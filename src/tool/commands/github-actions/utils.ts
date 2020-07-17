import { SimpleGit } from 'simple-git';
import { Sha1Value } from '../../../shared/interfaces/ehtag';

interface GitTag {
    sha: Sha1Value;
    tag: string;
}

export async function lsRemoteTags(git: SimpleGit): Promise<GitTag[]> {
    const ret = await git.listRemote({ '--tags': true, '--sort': '-creatordate' });
    return ret
        .split('\n')
        .map((s) => {
            const [shaStr, ref] = s.split('\t');
            const sha = Sha1Value(shaStr);
            if (!sha) return undefined;
            const tag = ref.split('/')[2];
            if (!tag) return undefined;
            return { sha, tag };
        })
        .filter((s): s is GitTag => s != null);
}
