import { Component, Input, type OnChanges, type OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import type { Subscription } from 'rxjs';
import type { Jsonify } from 'type-fest';
import MarkdownIt from 'markdown-it';
import type { Commit, NamespaceName, Signature } from '#shared/interfaces/ehtag';
import { isRawTag } from '#shared/raw-tag';
import { EhTagConnectorService } from '#browser/services/eh-tag-connector.service';
import { DbRepoService } from '#browser/services/db-repo.service';

interface HistoryIdentity {
    name: string;
    url?: string;
    avatarUrl?: string;
}

interface HistoryEntry extends Jsonify<Commit> {
    subject: string;
    body: string;
    bodyHtml: string;
    expanded: boolean;
    authorInfo: HistoryIdentity;
    committerInfo?: HistoryIdentity;
    commitUrl: string;
}

const historyMarkdown = new MarkdownIt({ html: false, linkify: true });
historyMarkdown.renderer.rules['link_open'] = (tokens, index, options, _env, renderer): string => {
    tokens[index].attrSet('target', '_blank');
    tokens[index].attrSet('rel', 'noopener noreferrer');
    return renderer.renderToken(tokens, index, options);
};

function historyIdentity(signature: Jsonify<Signature>): HistoryIdentity {
    const login = /^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/.exec(signature.email)?.[1];
    const url = login ? `https://github.com/${encodeURIComponent(login)}` : undefined;
    return {
        name: login ?? signature.name,
        url,
        avatarUrl: url ? `${url}.png?size=48` : undefined,
    };
}

@Component({
    selector: 'app-tag-history',
    templateUrl: './tag-history.component.html',
    styleUrls: ['./tag-history.component.scss'],
    standalone: false,
})
export class TagHistoryComponent implements OnChanges, OnDestroy {
    constructor(
        private readonly connector: EhTagConnectorService,
        private readonly dbRepo: DbRepoService,
        private readonly clipboard: Clipboard,
        private readonly snackBar: MatSnackBar,
    ) {}

    @Input() namespace: NamespaceName | null = null;
    @Input() raw: string | null = null;

    state: 'idle' | 'loading' | 'error' | 'not-found' | 'success' = 'idle';
    entries: HistoryEntry[] = [];
    notFoundMessage = '';
    private request?: Subscription;

    ngOnChanges(): void {
        this.request?.unsubscribe();
        this.entries = [];
        this.notFoundMessage = '';
        this.state = 'idle';
    }

    ngOnDestroy(): void {
        this.request?.unsubscribe();
    }

    copySha(sha: string): void {
        const copied = this.clipboard.copy(sha);
        this.snackBar.open(copied ? '已复制完整提交编号' : '复制失败，请手动复制提交编号', '关闭', { duration: 3000 });
    }

    load(): void {
        if (!this.namespace || !isRawTag(this.raw) || (this.state !== 'idle' && this.state !== 'error')) return;
        this.state = 'loading';
        this.request = this.connector.getBlame({ namespace: this.namespace, raw: this.raw }).subscribe({
            next: (commits) => {
                this.entries = commits.map((commit) => {
                    const [subject, ...lines] = commit.message.trim().split('\n');
                    const body = lines.join('\n').trim();
                    return {
                        ...commit,
                        subject,
                        body,
                        bodyHtml: historyMarkdown.render(body),
                        expanded: false,
                        authorInfo: historyIdentity(commit.author),
                        committerInfo:
                            commit.committer.email !== commit.author.email ||
                            commit.committer.name !== commit.author.name
                                ? historyIdentity(commit.committer)
                                : undefined,
                        commitUrl: this.dbRepo.resolve(`commit/${commit.sha}`),
                    };
                });
                this.state = 'success';
            },
            error: (error: unknown) => {
                if (error instanceof HttpErrorResponse && error.status === 404) {
                    const message = (error.error as { message?: unknown } | null)?.message;
                    this.notFoundMessage = typeof message === 'string' && message.trim() ? message : '条目不存在';
                    this.state = 'not-found';
                } else {
                    this.state = 'error';
                }
            },
        });
    }
}
