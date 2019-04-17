import { Component, OnInit } from '@angular/core';
import { EhTagConnectorService } from 'src/services/eh-tag-connector.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteService } from 'src/services/route.service';
import { Observable } from 'rxjs';
import { ETNamespaceName, ETNamespaceEnum, isValidRaw, editableNs } from 'src/interfaces/ehtranslation';
import { ErrorStateMatcher } from '@angular/material';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { map, tap } from 'rxjs/operators';

type Fields = 'raw' | 'ns' | 'text' | 'intro' | 'links';

function legalRaw(control: AbstractControl): ValidationErrors | null {
  if (!control) {
    return null;
  }
  if (!control.touched && !control.dirty) {
    return null;
  }
  return isValidRaw(String(control && control.value)) ? null : { raw: 'only a-zA-Z0-9. -' };
}

function isEditableNs(control: AbstractControl): ValidationErrors | null {
  if (!control) {
    return null;
  }
  if (!control.touched && !control.dirty) {
    return null;
  }
  return editableNs.indexOf(String(control && control.value) as ETNamespaceName) >= 0 ? null : { editableNs: 'please use PR' };
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
    private router: RouteService, ) { }
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
    text: new FormControl('', [
      Validators.required,
      Validators.pattern(/(\S\s*){1,}/),
    ]),
    intro: new FormControl('', []),
    links: new FormControl('', []),
  });
  ns: Observable<ETNamespaceName>;

  nsOptions = Object.getOwnPropertyNames(ETNamespaceEnum)
    .filter(v => isNaN(Number(v))) as ETNamespaceName[];
  raw: Observable<string>;
  create: Observable<boolean>;

  inputs: {
    ns: Observable<ETNamespaceName | null>;
    raw: Observable<string>;
    text: Observable<string>;
    intro: Observable<string>;
    links: Observable<string>;
  };

  ngOnInit() {
    this.ns = this.router.initParam(this.route, 'ns',
      v => v && v in ETNamespaceEnum ? v as ETNamespaceName : 'artist',
      v => v ? this.getControl('ns').setValue(v) : null);
    this.raw = this.router.initParam(this.route, 'raw',
      v => { v = (v || '').trim(); return isValidRaw(v) ? v : ''; },
      v => v ? this.getControl('raw').setValue(v) : null);
    this.create = this.raw.pipe(map(v => !isValidRaw(v)), tap(v => {
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
        v => (v || '').trim(),
        v => v ? this.getControl('raw').setValue(v) : null),
      text: this.router.initQueryParam(this.route, 'text',
        v => (v || '').trim(),
        v => v ? this.getControl('text').setValue(v) : null),
      intro: this.router.initQueryParam(this.route, 'intro',
        v => (v || '').trim(),
        v => v ? this.getControl('intro').setValue(v) : null),
      links: this.router.initQueryParam(this.route, 'links',
        v => (v || '').trim(),
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
    return form.value;
  }

  enabled(field: Fields) {
    const form = this.getControl(field);
    return form.enabled;
  }
}
