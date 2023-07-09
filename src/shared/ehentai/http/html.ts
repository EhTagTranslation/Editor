import type { AxiosResponse } from 'axios';
import { request } from './core.js';
import { parse, type DefaultTreeAdapterMap } from 'parse5';

export type Document = DefaultTreeAdapterMap['document'];
export async function html(url: string): Promise<AxiosResponse<Document>> {
    const response = await request<Document>(
        {
            url,
            method: 'GET',
            transformResponse: (data: string) => parse(data),
        },
        3,
    );
    return response;
}
