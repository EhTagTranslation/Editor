import { request } from './core';

const responseType = Symbol();

export interface ApiRequest<Method extends string, TResponse> {
    method: Method;
    [responseType]?: TResponse;
}

export type ResponseOf<T extends ApiRequest<string, unknown>> = T extends ApiRequest<string, infer U> ? U : unknown;

export async function api<T extends ApiRequest<string, unknown>>(payload: T): Promise<ResponseOf<T>> {
    const response = await request<ResponseOf<T>>({
        url: 'https://api.e-hentai.org/api.php',
        method: 'POST',
        data: payload,
    });
    const data = response.data;
    if (typeof data == 'object' && 'error' in (data as object)) {
        let err = (data as { error: string }).error;
        if (typeof err != 'string') err = JSON.stringify(err);
        throw new Error(err);
    }
    return data;
}
