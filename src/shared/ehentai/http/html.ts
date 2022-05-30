import type { AxiosResponse } from 'axios';
import { request } from './core';
import { parse, Document } from 'parse5';

export type { Document };
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
