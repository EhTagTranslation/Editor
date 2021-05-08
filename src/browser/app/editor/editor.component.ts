import { Component, OnInit } from '@angular/core';
import { EhTagConnectorService } from 'browser/services/eh-tag-connector.service';
import { RouteService } from 'browser/services/route.service';
import { Observable, BehaviorSubject, combineLatest, merge } from 'rxjs';
import { editableNs, ETKey } from 'browser/interfaces/ehtranslation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { map, tap, mergeMap, filter, shareReplay, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TitleService } from 'browser/services/title.service';
import { GithubOauthService } from 'browser/services/github-oauth.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { snackBarConfig } from 'browser/environments/environment';
import { Tag, NamespaceName, FrontMatters } from 'shared/interfaces/ehtag';
import { GithubReleaseService } from 'browser/services/github-release.service';
import { DebugService } from 'browser/services/debug.service';
import { DbRepoService } from 'browser/services/db-repo.service';
import { RawTag, isRawTag, isNamespaceName } from 'shared/validate';
import { Context } from 'shared/markdown';
import { suggestTag, Tag as TagSuggest, parseTag } from 'shared/ehentai';

class TagSuggestOption {
    constructor(
        readonly suggest: TagSuggest,
        private readonly services: {
            release: GithubReleaseService;
            router: RouteService;
        },
    ) {}

    readonly master = this.suggest.master ?? this.suggest;
    readonly isSlaved = !!this.suggest.master;
    translation(): Observable<Tag<'text'> | undefined> {
        return this.services.release.tags.pipe(
            map((v) => {
                const { namespace: ns, raw } = this.master;
                const tag = v.data[ns].get(raw);
                if (!tag) return undefined;
                return tag.render('text', new Context(tag, raw));
            }),
        );
    }
    toString(): string {
        return this.master.raw;
    }
    navigate(): void {
        this.translation().subscribe((v) => {
            if (v) {
                this.services.router.navigate(['./edit', this.master.namespace, this.master.raw], {}, false);
            } else {
                this.services.router.navigateParam({
                    namespace: this.master.namespace,
                    raw: this.master.raw,
                });
            }
        });
    }
}

type Fields = keyof Tag<'raw'> | keyof ETKey;
interface Item extends Tag<'raw'>, ETKey {}

const namespaceMapToSearch: { [k in NamespaceName]: string } = {
    artist: 'a:',
    parody: 'p:',
    reclass: 'r:',
    character: 'c:',
    group: 'g:',
    language: 'l:',
    male: 'm:',
    female: 'f:',
    misc: '',
    rows: '',
};

function legalRaw(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value || '');
    return RawTag(value) ? null : { raw: 'only a-zA-Z0-9. -' };
}

function isEditableNs(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value || '') as NamespaceName;
    return editableNs.includes(value) ? null : { editableNs: 'please use PR' };
}

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
    animations: [
        trigger('slide', [
            state('left', style({ transform: 'translateX(0)' })),
            state('right', style({ transform: 'translateX(-50%)' })),
            // ...
            transition('* => *', [animate('0.3s ease-in-out')]),
        ]),
    ],
})
export class EditorComponent implements OnInit {
    constructor(
        private readonly ehTagConnector: EhTagConnectorService,
        readonly github: GithubOauthService,
        readonly debug: DebugService,
        readonly release: GithubReleaseService,
        readonly router: RouteService,
        private readonly title: TitleService,
        private readonly snackBar: MatSnackBar,
        readonly dbRepo: DbRepoService,
    ) {}

    tagForm = new FormGroup({
        raw: new FormControl('', [
            // eslint-disable-next-line @typescript-eslint/unbound-method
            Validators.required,
            Validators.minLength(2),
            Validators.pattern(/^\S.*\S$/),
            legalRaw,
        ]),
        namespace: new FormControl('', [isEditableNs]),
        // eslint-disable-next-line @typescript-eslint/unbound-method
        name: new FormControl('', [Validators.required, Validators.pattern(/(\S\s*){1,}/)]),
        intro: new FormControl('', []),
        links: new FormControl('', []),
    });

    readonly nsOptions = NamespaceName;

    create!: Observable<boolean>;
    inputs!: {
        namespace: Observable<NamespaceName | null>;
        raw: Observable<string | null>;
        name: Observable<string | null>;
        intro: Observable<string | null>;
        links: Observable<string | null>;
    };

    original!: {
        namespace: Observable<NamespaceName>;
        raw: Observable<string>;
        name: Observable<string>;
        intro: Observable<string>;
        links: Observable<string>;
    };

    isEditableNs = new BehaviorSubject<boolean>(false);

    forms = {
        namespace: new BehaviorSubject<NamespaceName | null>(null),
        raw: new BehaviorSubject<string | null>(null),
        name: new BehaviorSubject<string | null>(null),
        intro: new BehaviorSubject<string | null>(null),
        links: new BehaviorSubject<string | null>(null),
    };

    rendered = combineLatest([
        this.forms.namespace,
        this.forms.raw,
        this.forms.name,
        this.forms.intro,
        this.forms.links,
    ]).pipe(
        filter(([namespace]) => isNamespaceName(namespace)),
        debounceTime(100),
        mergeMap(([namespace, raw, name, intro, links]) => {
            return this.ehTagConnector
                .normalizeTag(
                    {
                        name: name ?? '',
                        intro: intro ?? '',
                        links: links ?? '',
                    },
                    namespace as NamespaceName,
                    'html',
                )
                .pipe(
                    map((tag) => ({
                        ...tag,
                        raw,
                        namespace,
                    })),
                );
        }),
        shareReplay(1),
    );

    submitting = new BehaviorSubject<boolean>(false);

    tagSuggests!: Observable<{
        suggestion: TagSuggestOption[];
        loading: boolean;
    }>;
    tagSuggestTerm = new BehaviorSubject<string>('');

    narrowPreviewing = false;

    ngOnInit(): void {
        this.release.refresh();
        const oNs = this.router.initParam('namespace', (v) => (isNamespaceName(v) ? v : 'artist'));
        const oRaw = this.router.initParam('raw', (v) => {
            v = (v ?? '').trim();
            return RawTag(v) ? v : '';
        });
        const oTag = combineLatest([oNs, oRaw, this.release.tags]).pipe(
            map(([ns, raw, db]) => {
                if (!isRawTag(raw) || !db) {
                    return undefined;
                }
                const nsDb = db.data[ns];
                if (!nsDb) {
                    return undefined;
                }
                const tag = nsDb.get(raw);
                if (!tag) return undefined;
                return tag.render('raw', new Context(nsDb, raw));
            }),
        );
        this.original = {
            namespace: oNs,
            raw: oRaw,
            name: oTag.pipe(map((t) => t?.name ?? '')),
            intro: oTag.pipe(map((t) => t?.intro ?? '')),
            links: oTag.pipe(map((t) => t?.links ?? '')),
        };
        this.create = this.original.raw.pipe(
            map((v) => !isRawTag(v)),
            tap((v) => {
                if (v) {
                    this.getControl('namespace').enable();
                    this.getControl('raw').enable();
                } else {
                    this.getControl('namespace').disable();
                    this.getControl('raw').disable();
                }
            }),
        );
        this.inputs = {
            namespace: this.router.initQueryParam('namespace', (v) => (isNamespaceName(v) ? v : null)),
            raw: this.router.initQueryParam('raw', (v) => v),
            name: this.router.initQueryParam('name', (v) => v),
            intro: this.router.initQueryParam('intro', (v) => v),
            links: this.router.initQueryParam('links', (v) => v),
        };
        for (const key in this.tagForm.controls) {
            const element = this.tagForm.controls[key];
            element.valueChanges.subscribe((value) => {
                if (element.dirty) {
                    this.router.navigateParam({
                        [key]: value as unknown,
                    });
                }
            });
        }
        const tagSuggestSource = combineLatest([
            this.forms.raw.pipe(
                map((raw) => {
                    raw = (raw ?? '').trim().toLowerCase();
                    raw = raw.split(/\s+/gi).join(' ');
                    return raw;
                }),
                distinctUntilChanged(),
            ),
            this.forms.namespace.pipe(distinctUntilChanged()),
        ]).pipe(
            map(([raw, ns]) => {
                const { ns: rns, raw: tag } = parseTag(raw);
                ns = rns ?? ns;
                return [ns, tag] as const;
            }),
            distinctUntilChanged(([xns, xt], [yns, yt]) => xns === yns && xt === yt),
        );
        this.tagSuggests = merge(
            tagSuggestSource.pipe(
                tap(([_, raw]) => this.tagSuggestTerm.next(raw)),
                map(([_, raw]) => {
                    if (!raw)
                        return {
                            suggestion: [],
                            loading: false,
                        };
                    return {
                        suggestion: [],
                        loading: true,
                    };
                }),
            ),
            tagSuggestSource.pipe(
                debounceTime(100),
                mergeMap(
                    async ([ns, raw]): Promise<[string, TagSuggest[]]> => {
                        if (!raw) return [raw, []];
                        const suggestion = await suggestTag(undefined, raw);
                        suggestion.sort((a, b) => {
                            const aNs = a.master?.namespace ?? a.namespace;
                            const bNs = b.master?.namespace ?? b.namespace;
                            if (aNs === bNs) return 0;
                            if (aNs === ns) return -1;
                            if (bNs === ns) return 1;
                            return 0;
                        });
                        if (suggestion.length >= 10 && ns != null) {
                            const nsSuggestion = await suggestTag(ns, raw);
                            suggestion.unshift(
                                ...nsSuggestion.filter((s) =>
                                    suggestion.every((sug) => sug.id !== s.id && sug.master?.id !== s.id),
                                ),
                            );
                        }
                        return [raw, suggestion];
                    },
                ),
                filter(([raw]) => raw === this.tagSuggestTerm.value),
                map(([, suggestions]) => {
                    return {
                        suggestion: suggestions.map((s) => new TagSuggestOption(s, this)),
                        loading: false,
                    };
                }),
            ),
        );

        function mapCurrentCanEdit<T>(creating: boolean, original: T, inputs: T | null): T | null {
            if (creating) {
                return inputs;
            } else {
                // 不要使用 inputs || original，inputs === '' 表示已经编辑
                return inputs === null ? original : inputs;
            }
        }

        function mapCurrentCantEdit<T>(creating: boolean, original: T, inputs: T | null): T | null {
            if (creating) {
                // 不要使用 inputs || original，inputs === '' 表示已经编辑
                return inputs === null ? original : inputs;
            } else {
                return original;
            }
        }

        combineLatest([this.create, this.original.namespace, this.inputs.namespace])
            .pipe(
                map((v) => mapCurrentCantEdit(...v)),
                tap((v) => this.forms.namespace.next(v)),
            )
            .subscribe((v) => {
                this.getControl('namespace').setValue(v);
                this.isEditableNs.next(editableNs.includes(v as NamespaceName));
            });
        combineLatest([this.create, this.original.raw, this.inputs.raw])
            .pipe(
                map((v) => mapCurrentCantEdit(...v)),
                tap((v) => this.forms.raw.next(v)),
            )
            .subscribe((v) => this.getControl('raw').setValue(v));

        combineLatest([this.create, this.original.name, this.inputs.name])
            .pipe(
                map((v) => mapCurrentCanEdit(...v)),
                tap((v) => this.forms.name.next(v)),
            )
            .subscribe((v) => this.getControl('name').setValue(v));
        combineLatest([this.create, this.original.intro, this.inputs.intro])
            .pipe(
                map((v) => mapCurrentCanEdit(...v)),
                tap((v) => this.forms.intro.next(v)),
            )
            .subscribe((v) => this.getControl('intro').setValue(v));
        combineLatest([this.create, this.original.links, this.inputs.links])
            .pipe(
                map((v) => mapCurrentCanEdit(...v)),
                tap((v) => this.forms.links.next(v)),
            )
            .subscribe((v) => this.getControl('links').setValue(v));

        combineLatest([this.original.namespace, this.original.raw]).subscribe((v) => {
            if (v[1]) {
                const nsShort = v[0] === 'misc' ? '' : v[0][0] + ':';
                this.title.title = `${nsShort}${v[1]} - 修改标签`;
            } else {
                this.title.title = '新建标签';
            }
        });
    }

    getControl(field: Fields | null): AbstractControl {
        const form = field ? this.tagForm.get(field) : this.tagForm;
        if (!form) {
            throw new Error(`Wrong field name, '${field ?? ''}' is not in the form.`);
        }
        return form;
    }

    getNamespace(namespace: NamespaceName): Observable<FrontMatters> {
        return this.release.tags.pipe(map((tags) => tags.data[namespace].frontMatters));
    }

    hasError(field: Fields | null, includeErrors: string | string[], excludedErrors?: string | string[]): boolean {
        const form = this.getControl(field);
        const ie = Array.isArray(includeErrors) ? includeErrors : [includeErrors];
        const ee = excludedErrors ? (Array.isArray(excludedErrors) ? excludedErrors : [excludedErrors]) : [];
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
    value<F extends Fields>(field: F): Item[F] {
        const v = this.forms[field];
        if (v) {
            return (v.value ?? '') as Item[F];
        }
        if (field === 'namespace') {
            return 'misc' as Item[F];
        }
        return '' as Item[F];
    }

    enabled(field: Fields): boolean {
        const form = this.getControl(field);
        return form.enabled;
    }

    searchExternal(url: string): void {
        url = url.replace(/%(raw|mns|namespace|name|intro|links)/g, (k) => {
            if (k === '%mns') {
                return encodeURIComponent(namespaceMapToSearch[this.value('namespace')]);
            }
            return encodeURIComponent(this.value(k.substr(1) as Fields));
        });
        window.open(url, '_blank');
    }

    reset(): void {
        this.router.navigateParam(
            {
                namespace: undefined,
                name: undefined,
                raw: undefined,
                links: undefined,
                intro: undefined,
            },
            true,
        );
        this.tagForm.markAsPristine();
    }
    preSubmit(): boolean {
        if (this.submitting.getValue()) {
            return false;
        }
        if (this.tagForm.invalid) {
            for (const key in this.tagForm.controls) {
                const element = this.tagForm.controls[key];
                element.markAsTouched();
            }
            return false;
        }
        return true;
    }

    async submit(): Promise<void> {
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
            const key: ETKey = {
                namespace: this.value('namespace'),
                raw: this.value('raw'),
            };

            const result = (await this.ehTagConnector.hasTag(key).toPromise())
                ? await this.ehTagConnector.modifyTag(key, payload).toPromise()
                : await this.ehTagConnector.addTag(key, payload).toPromise();
            this.router.navigate(['/edit', key.namespace, key.raw], result ?? payload, true);
            this.snackBar.open(result ? '更改已提交' : '提交内容与数据库一致', '关闭', snackBarConfig);
            this.tagForm.markAsPristine();
        } catch (ex) {
            this.snackBar
                .open('提交过程中出现错误', '重试', snackBarConfig)
                .onAction()
                .subscribe(() => {
                    void this.submit();
                });
        } finally {
            this.submitting.next(false);
        }
    }
}
