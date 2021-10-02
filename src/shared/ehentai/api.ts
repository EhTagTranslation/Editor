import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { NamespaceName } from '../interfaces/ehtag';
import type { RawTag } from '../raw-tag';

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

declare let location: unknown;

const config: AxiosRequestConfig<never> =
    typeof location === 'object'
        ? // Browser environment
          {
              url: 'https://api.e-hentai.org/api.php',
              headers: {},
          }
        : // Node environment
          {
              url: 'http://api.e-hentai.org/api.php',
              headers: {
                  Connection: 'keep-alive',
                  'sec-ch-ua': '"Chromium";v="94", "Microsoft Edge";v="94", ";Not A Brand";v="99"',
                  DNT: '1',
                  'sec-ch-ua-mobile': '?0',
                  'User-Agent':
                      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36 Edg/94.0.992.31',
                  'sec-ch-ua-platform': '"Windows"',
                  'Content-Type': 'application/json',
                  Accept: '*/*',
                  Origin: 'https://e-hentai.org',
                  'Sec-Fetch-Dest': 'empty',
                  'Sec-Fetch-Mode': 'cors',
                  'Sec-Fetch-Site': 'same-site',
                  Referer: 'https://e-hentai.org/',
                  'Accept-Encoding': 'gzip, deflate, br',
                  'Accept-language': 'en,en-US;q=0.9',
              },
          };

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function request<T = unknown, R = AxiosResponse<T>>(config: AxiosRequestConfig, retry: number): Promise<R> {
    try {
        return axios.request<T, R>(config);
    } catch (err) {
        if (retry <= 0) {
            throw err;
        }
        const axiosError = err as AxiosError;
        if (axiosError.isAxiosError && (axiosError.response == null || axiosError.response.status >= 500)) {
            await delay(1000);
            return request<T, R>(config, retry - 1);
        }
        throw err;
    }
}

export async function postApi<T extends ApiRequest<string, unknown>>(payload: T): Promise<ResponseOf<T>> {
    const req: AxiosRequestConfig<T> = {
        ...config,
        method: 'POST',
        data: payload,
    };
    const response = await request<ResponseOf<T>>(req, 3);
    const data = response.data;
    if (typeof data == 'object' && 'error' in (data as object)) {
        let err = (data as { error: string }).error;
        if (typeof err != 'string') err = JSON.stringify(err);
        throw new Error(err);
    }
    return data;
}
