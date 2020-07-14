import axios from 'axios';
import { NamespaceName } from '../interfaces/ehtag';
import { RawTag } from '../validate';

const responseType = Symbol();

export interface ApiRequest<Method extends string, TResponse> {
    method: Method;
    [responseType]?: TResponse;
}

export interface TagSuggestRequest
    extends ApiRequest<
        'tagsuggest',
        {
            tags: Record<number, ApiMasterTag | ApiSlaveTag> | [];
        }
    > {
    text: string;
}

interface ApiMasterTag {
    id: number;
    ns: NamespaceName;
    tn: RawTag;
}

interface ApiSlaveTag extends ApiMasterTag {
    mid: number;
    mns: NamespaceName;
    mtn: RawTag;
}

export type ResponseOf<T extends ApiRequest<string, unknown>> = T extends ApiRequest<string, infer U> ? U : unknown;

const config =
    'window' in globalThis
        ? {
              url: 'https://api.e-hentai.org/api.php',
              headers: {},
          }
        : {
              url: 'http://api.e-hentai.org/api.php',
              headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:74.0) Gecko/20100101 Firefox/74.0',
                  Origin: 'https://e-hentai.org',
                  Referer: 'https://e-hentai.org/mytags',
              },
          };

export async function postApi<T extends ApiRequest<string, unknown>>(payload: T): Promise<ResponseOf<T>> {
    try {
        const response = await axios.request<ResponseOf<T>>({
            ...config,
            method: 'POST',
            data: payload,
        });
        const data = response.data;
        if ('error' in data) {
            let err = (data as { error: string }).error;
            if (typeof err != 'string') err = JSON.stringify(err);
            throw new Error(err);
        }
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
