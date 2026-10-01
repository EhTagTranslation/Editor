import { Component, Input, type OnChanges, type OnDestroy } from '@angular/core';
import type { Subscription } from 'rxjs';
import type { Jsonify } from 'type-fest';
import type { Commit, NamespaceName } from '#shared/interfaces/ehtag';
import { isRawTag } from '#shared/raw-tag';
import { EhTagConnectorService } from '#browser/services/eh-tag-connector.service';
import { DbRepoService } from '#browser/services/db-repo.service';

interface HistoryEntry extends Jsonify<Commit> {
    subject: string;
    body: string;
    authorUrl?: string;
    authorName: string;
    commitUrl: string;
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
    ) {}

    @Input() namespace: NamespaceName | null = null;
    @Input() raw: string | null = null;

    state: 'idle' | 'loading' | 'error' | 'success' = 'idle';
    entries: HistoryEntry[] = [];
    private request?: Subscription;

    ngOnChanges(): void {
        this.request?.unsubscribe();
        this.entries = [];
        this.state = 'idle';
    }

    ngOnDestroy(): void {
        this.request?.unsubscribe();
    }

    load(): void {
        if (!this.namespace || !isRawTag(this.raw) || (this.state !== 'idle' && this.state !== 'error')) return;
        this.state = 'loading';
        this.request = this.connector.getBlame({ namespace: this.namespace, raw: this.raw }).subscribe({
            next: (commits) => {
                this.entries = commits.map((commit) => {
                    const [subject, ...body] = commit.message.trim().split('\n');
                    const login = /^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/.exec(commit.author.email)?.[1];
                    return {
                        ...commit,
                        subject,
                        body: body.join('\n').trim(),
                        authorName: login ?? commit.author.name,
                        authorUrl: login ? `https://github.com/${encodeURIComponent(login)}` : undefined,
                        commitUrl: this.dbRepo.resolve(`commit/${commit.sha}`),
                    };
                });
                this.state = 'success';
            },
            error: () => {
                this.state = 'error';
            },
        });
    }
}
