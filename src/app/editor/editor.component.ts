import { Component, OnInit } from '@angular/core';
import { EhTagConnectorService } from 'src/services/eh-tag-connector.service';
import { RouteService } from 'src/services/route.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { isValidRaw, editableNs, NamespaceInfo, ETKey } from 'src/interfaces/ehtranslation';
import { MatSnackBar } from '@angular/material';
import { FormControl, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { map, tap } from 'rxjs/operators';
import * as Bluebird from 'bluebird';
import { TitleService } from 'src/services/title.service';
import { GithubOauthService } from 'src/services/github-oauth.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { snackBarConfig } from 'src/environments/environment';
import { Tag, NamespaceName, NamespaceEnum } from 'src/interfaces/ehtag';
import { GithubReleaseService } from 'src/services/github-release.service';
import { dashCaseToCamelCase } from '@angular/compiler/src/util';
type Fields = keyof Tag<'raw'> | keyof ETKey;
interface Item extends Tag<'raw'>, ETKey { }

function legalRaw(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value || '');
  return isValidRaw(value) ? null : { raw: 'only a-zA-Z0-9. -' };
}

function isEditableNs(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value || '') as NamespaceName;
  return editableNs.indexOf(value) >= 0 ? null : { editableNs: 'please use PR' };
}

const parser = new DOMParser();

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.sass'],
  animations: [
    trigger('slide', [
      state('left', style({ transform: 'translateX(0)' })),
      state('right', style({ transform: 'translateX(-50%)' })),
      // ...
      transition('* => *', [
        animate('0.3s ease-in-out'),
      ]),
    ]),
  ],
})
export class EditorComponent implements OnInit {

  constructor(
    private ehTagConnector: EhTagConnectorService,
    public github: GithubOauthService,
    public release: GithubReleaseService,
    private router: RouteService,
    private title: TitleService,
    private snackBar: MatSnackBar, ) {
  }
  tagForm = new FormGroup({
    raw: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(/^\S.*\S$/),
      legalRaw,
    ]),
    namespace: new FormControl('', [
      isEditableNs,
    ]),
    name: new FormControl('', [
      Validators.required,
      Validators.pattern(/(\S\s*){1,}/),
    ]),
    intro: new FormControl('', []),
    links: new FormControl('', []),
  });

  nsOptions = Object.getOwnPropertyNames(NamespaceEnum)
    .filter(v => isNaN(Number(v))) as NamespaceName[];

  create: Observable<boolean>;
  inputs: {
    namespace: Observable<NamespaceName | null>;
    raw: Observable<string | null>;
    name: Observable<string | null>;
    intro: Observable<string | null>;
    links: Observable<string | null>;
  };

  original: {
    namespace: Observable<NamespaceName>;
    raw: Observable<string>;
    name: Observable<string>;
    intro: Observable<string>;
    links: Observable<string>;
  };

  rendered = {
    loading: new BehaviorSubject<boolean>(false),
    raw: new BehaviorSubject<string>(''),
    name: new BehaviorSubject<string>(''),
    intro: new BehaviorSubject<string>(''),
    links: new BehaviorSubject<string>(''),
  };

  submitting = new BehaviorSubject<boolean>(false);

  narrowPreviewing = false;

  ngOnInit() {
    this.release.refresh();
    const ons = this.router.initParam('namespace',
      v => v && v in NamespaceEnum ? v as NamespaceName : 'artist');
    const oraw = this.router.initParam('raw',
      v => { v = (v || '').trim(); return isValidRaw(v) ? v : ''; },
      v => {
        if (v) {
          this.title.setTitle('修改标签 - ' + v);
        } else {
          this.title.setTitle('新建标签');
        }
      });
    const otag = combineLatest([
      ons,
      oraw,
      this.release.tags.raw,
    ]).pipe(map(data => {
      if (!data[2] || !data[1]) {
        return undefined;
      }
      const nsdata = data[2].data.find(ns => ns.namespace === data[0]);
      if (!nsdata) {
        return undefined;
      }
      return nsdata.data[data[1]];
    }));
    this.original = {
      namespace: ons,
      raw: oraw,
      name: otag.pipe(map(t => t && t.name || '')),
      intro: otag.pipe(map(t => t && t.intro || '')),
      links: otag.pipe(map(t => t && t.links || '')),
    };
    this.create = this.original.raw.pipe(map(v => !isValidRaw(v)), tap(v => {
      if (v) {
        this.getControl('namespace').enable();
        this.getControl('raw').enable();
      } else {
        this.getControl('namespace').disable();
        this.getControl('raw').disable();
      }
    }));
    this.inputs = {
      namespace: this.router.initQueryParam('namespace',
        v => v && v in NamespaceEnum ? v as NamespaceName : null),
      raw: this.router.initQueryParam('raw',
        v => v),
      name: this.router.initQueryParam('name',
        v => v),
      intro: this.router.initQueryParam('intro',
        v => v),
      links: this.router.initQueryParam('links',
        v => v),
    };
    for (const key in this.tagForm.controls) {
      if (this.tagForm.controls.hasOwnProperty(key)) {
        const element = this.tagForm.controls[key];
        element.valueChanges.subscribe(value => {
          if (element.dirty) {
            this.router.navigateParam({
              [key]: value
            });
          }
        });
      }
    }

    function mapCurrentCanEdit<T>(creating: boolean, original: T, inputs: T | null) {
      if (creating) {
        return inputs;
      } else {
        // 不要使用 inputs || original，inputs === '' 表示已经编辑
        return inputs === null ? original : inputs;
      }
    }

    function mapCurrentCantEdit<T>(creating: boolean, original: T, inputs: T | null) {
      if (creating) {
        // 不要使用 inputs || original，inputs === '' 表示已经编辑
        return inputs === null ? original : inputs;
      } else {
        return original;
      }
    }

    combineLatest([this.create, this.original.namespace, this.inputs.namespace])
      .pipe(map(v => mapCurrentCantEdit(...v)))
      .subscribe(v => v ? this.getControl('namespace').setValue(v) : null);
    combineLatest([this.create, this.original.raw, this.inputs.raw])
      .pipe(map(v => mapCurrentCantEdit(...v)), tap(v => this.rendered.raw.next(v)))
      .subscribe(v => v ? this.getControl('raw').setValue(v) : null);

    combineLatest([this.create, this.original.name, this.inputs.name])
      .pipe(map(v => mapCurrentCanEdit(...v)))
      .subscribe(v => v ? this.getControl('name').setValue(v) : null);
    combineLatest([this.create, this.original.intro, this.inputs.intro])
      .pipe(map(v => mapCurrentCanEdit(...v)))
      .subscribe(v => v ? this.getControl('intro').setValue(v) : null);
    combineLatest([this.create, this.original.links, this.inputs.links])
      .pipe(map(v => mapCurrentCanEdit(...v)))
      .subscribe(v => v ? this.getControl('links').setValue(v) : null);
  }

  private getControl(field: Fields | null) {
    const form = field ? this.tagForm.get(field) : this.tagForm;
    if (!form) {
      throw new Error(`Wrong field name, '${field}' is not in the form.`);
    }
    return form;
  }

  getNamespace(namespace: NamespaceName) {
    return NamespaceInfo[namespace];
  }

  hasError(field: Fields | null, includeErrors: string | string[], excludedErrors?: string | string[]) {
    const form = this.getControl(field);
    const ie = Array.isArray(includeErrors) ? includeErrors : [includeErrors];
    const ee = excludedErrors ? Array.isArray(excludedErrors) ? excludedErrors : [excludedErrors] : [];
    for (const e of ee) {
      if (form.hasError(e)) {
        return false;
      }
    }
    for (const e of ie) {
      if (form.hasError(e)) {
        return true;
      }
    }
    return false;
  }
  value<F extends Fields>(field: F) {
    const form = this.getControl(field);
    if (form.value) {
      return form.value as Item[F];
    }
    return '';
  }

  enabled(field: Fields) {
    const form = this.getControl(field);
    return form.enabled;
  }

  pasting(ev: ClipboardEvent, isMd: boolean) {
    if (!(ev.target instanceof HTMLInputElement) && !(ev.target instanceof HTMLTextAreaElement)) {
      return;
    }
    const field = ev.target.getAttribute('formControlName') as Fields;
    if (!field) {
      return;
    }
    const handleText = () => {
      const data = ev.clipboardData.getData('Text');
      if (!data) {
        return undefined;
      }
      return data.trim().replace('\t', ' ');
    }
    const handleHtml = () => {
      const data = ev.clipboardData.getData('text/html');
      if (!data) {
        return undefined;
      }
      const doc = parser.parseFromString(data, 'text/html');
      return getMdPre(doc.body);

      function getMdPre(node: ChildNode): string {
        switch (node.nodeType) {
          case Node.TEXT_NODE:
            let text = node.textContent || '';
            if (text.trimLeft() !== text) {
              text = ' ' + text.trimLeft();
            }
            if (text.trimRight() !== text) {
              text = text.trimRight() + ' ';
            }
            return text;
          case Node.ELEMENT_NODE: {
            const el = node as Element;
            const inner = Array.from(el.childNodes).map(getMdPre).join('').trim();
            switch (el.tagName) {
              case 'BODY':
                return inner + '\n';
              case 'P':
                return inner + '\n\n';
              case 'A':
                return `[${inner}](${el.getAttribute('href')})`;
              case 'IMG':
                if (typeof el.getAttribute('nsfw') === 'string') {
                  return `![${inner || '图'}](# "${el.getAttribute('src')}")`;
                }
                return `![${inner || '图'}](${el.getAttribute('src')})`;
              case 'B': case 'STRONG':
                return `**${inner}**`;
              case 'I': case 'EM':
                return `*${inner}*`;
              case 'BR':
                return '\n';
              default:
                return inner;
            }
          }
          default:
            return '';
        }
      }
    }
    const data = isMd ? handleHtml() || handleText() : handleText();
    if (!data) {
      return;
    }
    ev.preventDefault();
    ev.target.setRangeText(data, ev.target.selectionStart || 0, ev.target.selectionEnd || 0, 'end');
    this.router.navigateParam({
      [field]: ev.target.value,
    });
  }

  async preview() {
    if (this.rendered.loading.getValue()) {
      return;
    }
    this.rendered.loading.next(true);
    try {
      const delay = Bluebird.delay(300);
      const result = await this.ehTagConnector.normalizeTag({
        name: this.value('name'),
        intro: this.value('intro'),
        links: this.value('links'),
      }, 'html').toPromise();
      this.rendered.name.next(result.name);
      this.rendered.intro.next(result.intro);
      this.rendered.links.next(result.links);
      await delay;
    } finally {
      this.rendered.loading.next(false);
    }
  }
  preSubmit() {
    if (this.submitting.getValue()) {
      return false;
    }
    if (this.tagForm.invalid) {
      for (const key in this.tagForm.controls) {
        if (this.tagForm.controls.hasOwnProperty(key)) {
          const element = this.tagForm.controls[key];
          element.markAsTouched();
        }
      }
      return false;
    }
    return true;
  }

  async submit() {
    if (!this.preSubmit()) {
      return;
    }
    this.submitting.next(true);
    try {
      const payload: Tag<'raw'> = {
        name: this.value('name'),
        intro: this.value('intro'),
        links: this.value('links'),
      };
      const key = {
        namespace: this.value('namespace'),
        raw: this.value('raw'),
      };

      const result = (await this.ehTagConnector.hasTag(key).toPromise())
        ? await this.ehTagConnector.modifyTag(key, payload).toPromise()
        : await this.ehTagConnector.addTag(key, payload).toPromise();
      this.router.navigate(['/edit', key.namespace, key.raw], result || payload);
      this.snackBar.open(result ? '更改已提交' : '提交内容与数据库一致', '关闭', snackBarConfig);
    } catch (ex) {
      console.log(ex);
      this.snackBar.open('提交过程中出现错误', '重试', snackBarConfig)
        .onAction().subscribe(() => {
          this.submit();
        });
    } finally {
      this.submitting.next(false);
    }
  }
}
