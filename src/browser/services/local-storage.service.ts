import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DebugService } from './debug.service';

interface LocalStorageItem {
    value: string | null;
    valueChange: Observable<string | null>;
}

class LocalStorageItemImpl implements LocalStorageItem {
    constructor(private readonly token: string, private readonly debug: DebugService) {}

    valueChange = new BehaviorSubject<string | null>(this.value);
    get value(): string | null {
        return localStorage.getItem(this.token);
    }
    set value(value) {
        const oldValue = this.value;
        if (value) {
            localStorage.setItem(this.token, value);
            this.onValueChange(oldValue, value);
        } else {
            localStorage.removeItem(this.token);
            this.onValueChange(oldValue, null);
        }
    }

    private static getValueRep(value: string | undefined | null): string {
        if (value === undefined) {
            return '?';
        }
        if (value === null) {
            return 'null';
        }
        return `"${value}"`;
    }
    onValueChange(oldValue?: string | null, newValue?: string | null): void {
        if (newValue === undefined) {
            newValue = this.value;
        }
        if (newValue === this.valueChange.getValue()) {
            return;
        }
        this.valueChange.next(newValue);
        this.debug.log(
            `localStorage: ${this.token} = ${LocalStorageItemImpl.getValueRep(
                oldValue,
            )} -> ${LocalStorageItemImpl.getValueRep(newValue)}`,
        );
    }
}

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    constructor(private readonly debug: DebugService) {
        window.addEventListener('storage', this.storageChanged);
    }

    private readonly values = new Map<string, LocalStorageItemImpl>();

    private readonly storageChanged = (ev: StorageEvent): void => {
        if (ev.storageArea !== localStorage) {
            return;
        }
        if (ev.key) {
            const storage = this.values.get(ev.key);
            if (storage) {
                storage.onValueChange(ev.oldValue, ev.newValue);
                return;
            }
        }
        this.values.forEach((value) => value.onValueChange());
    };

    get(token: string): LocalStorageItem {
        const exist = this.values.get(token);
        if (exist) {
            return exist;
        }

        const created = new LocalStorageItemImpl(token, this.debug);
        this.values.set(token, created);
        return created;
    }
}
