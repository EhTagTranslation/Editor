import { Component, OnInit } from '@angular/core';
import { EhTagConnectorService } from 'src/services/eh-tag-connector.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteService } from 'src/services/route.service';
import { Observable, Subject, BehaviorSubject, merge, combineLatest } from 'rxjs';
import { ETNamespaceName, ETNamespaceEnum, isValidRaw, editableNs, ETItem } from 'src/interfaces/ehtranslation';
import { ErrorStateMatcher, MatSnackBar } from '@angular/material';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { map, tap, distinctUntilChanged } from 'rxjs/operators';
import * as Bluebird from 'bluebird';
import { DebugService } from 'src/services/debug.service';
import { ReadVarExpr } from '@angular/compiler';
import { TitleService } from 'src/services/title.service';
import { GithubOauthService } from 'src/services/github-oauth.service';
type Fields = keyof ETItem;
const parser = new DOMParser();

function legalRaw(control: AbstractControl): ValidationErrors | null {
  if (!control) {
    return null;
  }
  if (!control.touched && !control.dirty) {
    return null;
  }
  const value = String((control && control.value) || '');
  return isValidRaw(value) ? null : { raw: 'only a-zA-Z0-9. -' };
}

function isEditableNs(control: AbstractControl): ValidationErrors | null {
  if (!control) {
    return null;
  }
  const value = String((control && control.value) || '');
  return editableNs.indexOf(value as ETNamespaceName) >= 0 ? null : { editableNs: 'please use PR' };
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.sass']
})
export class EditorComponent implements OnInit {

  constructor(
    private ehTagConnector: EhTagConnectorService,
    public github: GithubOauthService,
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

  nsOptions = Object.getOwnPropertyNames(ETNamespaceEnum)
    .filter(v => isNaN(Number(v))) as ETNamespaceName[];

  create: Observable<boolean>;
  inputs: {
    namespace: Observable<ETNamespaceName | null>;
    raw: Observable<string>;
    name: Observable<string>;
    intro: Observable<string>;
    links: Observable<string>;
  };

  original: {
    namespace: Observable<ETNamespaceName>;
    raw: Observable<string>;
    // name: Observable<string>;
    // intro: Observable<string>;
    // links: Observable<string>;
  };

  rendered = {
    loading: new BehaviorSubject<boolean>(false),
    name: new BehaviorSubject<string>(''),
    intro: new BehaviorSubject<string>(''),
    links: new BehaviorSubject<string>(''),
  };

  submitting = new BehaviorSubject<boolean>(false);
  canSubmit: Observable<boolean>;

  ngOnInit() {
    this.original = {
      namespace: this.router.initParam('namespace',
        v => v && v in ETNamespaceEnum ? v as ETNamespaceName : 'artist'),
      raw: this.router.initParam('raw',
        v => { v = (v || '').trim(); return isValidRaw(v) ? v : ''; },
        v => {
          if (v) {
            this.title.setTitle('修改标签 - ' + v);
          } else {
            this.title.setTitle('新建标签');
          }
        }),
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
        v => v && v in ETNamespaceEnum ? v as ETNamespaceName : null),
      raw: this.router.initQueryParam('raw',
        v => (v || '')),
      name: this.router.initQueryParam('name',
        v => (v || ''),
        v => v ? this.getControl('name').setValue(v) : null),
      intro: this.router.initQueryParam('intro',
        v => (v || ''),
        v => v ? this.getControl('intro').setValue(v) : null),
      links: this.router.initQueryParam('links',
        v => (v || ''),
        v => v ? this.getControl('links').setValue(v) : null),
    };
    this.canSubmit = combineLatest(this.github.tokenChange, this.tagForm.statusChanges)
      .pipe(map(data => !!data[0] && !(this.tagForm.invalid && this.tagForm.touched)));
    for (const key in this.tagForm.controls) {
      if (this.tagForm.controls.hasOwnProperty(key)) {
        const element = this.tagForm.controls[key];
        element.valueChanges.subscribe(value => {
          this.router.navigateParam({
            [key]: value
          });
        });
      }
    }
    merge(this.original.namespace, this.inputs.namespace).pipe(distinctUntilChanged())
      .subscribe(v => v ? this.getControl('namespace').setValue(v) : null);
    merge(this.original.raw, this.inputs.raw).pipe(distinctUntilChanged())
      .subscribe(v => v ? this.getControl('raw').setValue(v) : null);
  }

  private getControl(field: Fields | null) {
    const form = field ? this.tagForm.get(field) : this.tagForm;
    if (!form) {
      throw new Error(`Wrong field name, '${field}' is not in the form.`);
    }
    return form;
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
      return form.value as ETItem[F];
    }
    return '';
  }

  enabled(field: Fields) {
    const form = this.getControl(field);
    return form.enabled;
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
      }, 'html');
      this.rendered.name.next(result.name);
      this.rendered.intro.next(result.intro);
      this.rendered.links.next(result.links);
      await delay;
    } finally {
      this.rendered.loading.next(false);
    }
  }

  async submit() {
    if (this.submitting.getValue()) {
      return;
    }
    if (this.tagForm.invalid) {
      for (const key in this.tagForm.controls) {
        if (this.tagForm.controls.hasOwnProperty(key)) {
          const element = this.tagForm.controls[key];
          element.markAsTouched();
        }
      }
      return;
    }
    this.submitting.next(true);
    try {
      const payload = {
        name: this.value('name'),
        intro: this.value('intro'),
        links: this.value('links'),
      };
      const key = {
        namespace: this.value('namespace'),
        raw: this.value('raw'),
      };

      const result = (await this.ehTagConnector.getTag(key))
        ? await this.ehTagConnector.modifyTag({ ...key, ...payload })
        : await this.ehTagConnector.addTag({ ...key, ...payload });
      if (result) {
        this.router.navigate(['/edit', result.namespace, result.raw], result);
      } else {
        this.router.navigate(['/edit', key.namespace, key.raw], payload);
      }
      this.snackBar.open(result ? '更改已提交' : '提交内容与数据库一致', '关闭', { verticalPosition: 'top', duration: 5000, });
    } catch (ex) {
      console.log(ex);
      this.snackBar.open('提交过程中出现错误', '重试', { verticalPosition: 'top', duration: 5000, })
        .onAction().subscribe(() => {
          this.submit();
        });
    } finally {
      this.submitting.next(false);
    }
  }
}
