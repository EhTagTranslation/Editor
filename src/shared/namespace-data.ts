export class NamespaceData {
    constructor(readonly file: string) {}
    async load(): Promise<void> {}
    async save(): Promise<void> {}
}
