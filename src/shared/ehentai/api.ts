import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { NamespaceName } from '../interfaces/ehtag';
import type { RawTag } from '../raw-tag';
import proxyConfig from './proxy';

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

async function config(url: string): Promise<AxiosRequestConfig<never>> {
    if (typeof location === 'object') {
        // Browser environment
        return {
            headers: {},
        };
    }
    // Node environment
    return {
        headers: {
            Connection: 'keep-alive',
            DNT: '1',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Microsoft Edge";v="101"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36 Edg/101.0.1210.53',
            'content-type': 'application/json',
            accept: '*/*',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'accept-Encoding': 'gzip, deflate, br',
            'accept-language': 'en,en-US;q=0.9',

            ...(url.includes('hentai.org')
                ? {
                      origin: 'https://e-hentai.org',
                      referer: 'https://e-hentai.org/',
                      cookie: 'ipb_member_id=3552014; ipb_pass_hash=7a245abd0fa9866ccdfeaf58ff7dd0fd;',
                  }
                : {}),
        },
        ...proxyConfig,
    };
}

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
    const response = await post<ResponseOf<T>, T>('http://api.e-hentai.org/api.php', payload);
    const data = response.data;
    if (typeof data == 'object' && 'error' in (data as object)) {
        let err = (data as { error: string }).error;
        if (typeof err != 'string') err = JSON.stringify(err);
        throw new Error(err);
    }
    return data;
}

export async function post<T, D>(url: string, data: D): Promise<AxiosResponse<T, D>> {
    const response = await request<T>(
        {
            ...(await config(url)),
            url,
            method: 'POST',
            data,
        },
        3,
    );
    return response;
}

export async function get<T>(url: string): Promise<AxiosResponse<T>> {
    const response = await request<T>(
        {
            ...(await config(url)),
            url,
            method: 'GET',
        },
        3,
    );
    return response;
}
