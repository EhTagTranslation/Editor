import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { request } from './core.js';

export * from './api.js';
export * from './html.js';

export { request };

export async function post<T, D>(url: string, data: D): Promise<AxiosResponse<T, D>> {
    const response = await request<T>({
        url,
        method: 'POST',
        headers: {
            'content-type': typeof data == 'string' ? 'text/plain' : 'application/json',
        },
        data,
    });
    return response;
}

export async function get<T>(url: string, options?: AxiosRequestConfig<never>): Promise<AxiosResponse<T>> {
    const response = await request<T>({
        url,
        method: 'GET',
        ...options,
    });
    return response;
}
