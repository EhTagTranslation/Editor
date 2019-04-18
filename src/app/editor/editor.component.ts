import { Component, OnInit } from '@angular/core';
import { EhTagConnectorService } from 'src/services/eh-tag-connector.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteService } from 'src/services/route.service';
import { Observable, Subject } from 'rxjs';
import { ETNamespaceName, ETNamespaceEnum, isValidRaw, editableNs, ETItem } from 'src/interfaces/ehtranslation';
import { ErrorStateMatcher } from '@angular/material';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { map, tap } from 'rxjs/operators';
import * as Bluebird from 'bluebird';
import { DebugService } from 'src/services/debug.service';
import { ReadVarExpr } from '@angular/compiler';
type Fields = Exclude<keyof ETItem, 'namespace'> | 'ns';
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
    private route: ActivatedRoute,
    private router: RouteService,
    private debug: DebugService, ) { }
  tagForm = new FormGroup({
    raw: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(/^\S.*\S$/),
      legalRaw,
    ]),
    ns: new FormControl('', [
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
    ns: Observable<ETNamespaceName | null>;
    raw: Observable<string>;
    name: Observable<string>;
    intro: Observable<string>;
    links: Observable<string>;
  };

  original: {
    ns: Observable<ETNamespaceName>;
    raw: Observable<string>;
    // name: Observable<string>;
    // intro: Observable<string>;
    // links: Observable<string>;
  };

  rendered = {
    loading: new Subject<boolean>(),
    name: new Subject<string>(),
    intro: new Subject<string>(),
    links: new Subject<string>(),
  };

  ngOnInit() {
    this.original = {
      ns: this.router.initParam(this.route, 'ns',
        v => v && v in ETNamespaceEnum ? v as ETNamespaceName : 'artist',
        v => v ? this.getControl('ns').setValue(v) : null),
      raw: this.router.initParam(this.route, 'raw',
        v => { v = (v || '').trim(); return isValidRaw(v) ? v : ''; },
        v => v ? this.getControl('raw').setValue(v) : null),
    };
    this.create = this.original.raw.pipe(map(v => !isValidRaw(v)), tap(v => {
      if (v) {
        this.getControl('ns').enable();
        this.getControl('raw').enable();
      } else {
        this.getControl('ns').disable();
        this.getControl('raw').disable();
      }
    }));
    this.inputs = {
      ns: this.router.initQueryParam(this.route, 'ns',
        v => v && v in ETNamespaceEnum ? v as ETNamespaceName : null,
        v => v ? this.getControl('ns').setValue(v) : null),
      raw: this.router.initQueryParam(this.route, 'raw',
        v => (v || ''),
        v => v ? this.getControl('raw').setValue(v) : null),
      name: this.router.initQueryParam(this.route, 'name',
        v => (v || ''),
        v => v ? this.getControl('name').setValue(v) : null),
      intro: this.router.initQueryParam(this.route, 'intro',
        v => (v || ''),
        v => v ? this.getControl('intro').setValue(v) : null),
      links: this.router.initQueryParam(this.route, 'links',
        v => (v || ''),
        v => v ? this.getControl('links').setValue(v) : null),
    };
    for (const key in this.tagForm.controls) {
      if (this.tagForm.controls.hasOwnProperty(key)) {
        const element = this.tagForm.controls[key];
        element.valueChanges.subscribe(value => {
          this.router.navigateParam(this.route, {
            [key]: value
          });
        });
      }
    }
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
  value(field: Fields) {
    const form = this.getControl(field);
    return form.value || '';
  }

  enabled(field: Fields) {
    const form = this.getControl(field);
    return form.enabled;
  }

  async preview() {
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
}
