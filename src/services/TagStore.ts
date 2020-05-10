import { TagType, Sha1Value, RepoData } from 'src/interfaces/ehtag';
import Dexie from 'dexie';

export interface TagRecord<T extends TagType> {
    type: T;
    hash: Sha1Value;
    data: RepoData<T>;
}

export class TagStore extends Dexie {
    // Declare implicit table properties.
    // (just to inform Typescript. Instanciated by Dexie in stores() method)
    data: Dexie.Table<TagRecord<TagType>, TagType>;
    constructor() {
        super('tag-store');
        this.version(1).stores({
            data: 'type, hash',
        });
    }
}
