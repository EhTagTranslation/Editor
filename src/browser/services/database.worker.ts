/// <reference lib="webworker" />

import { TagType, RepoData } from './../../shared/interfaces/ehtag';
import { DatabaseInMemory } from './database.shared';

addEventListener('message', ({ data }) => {
    const payload = data as {
        storage: RepoData<'raw'>;
        type: TagType;
    };
    const db = new DatabaseInMemory(payload.storage);
    const res = db.render(payload.type);
    void res.then(postMessage);
});
