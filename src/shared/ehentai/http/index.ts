import type { AxiosResponse } from 'axios';
import { request } from './core.js';

export * from './api.js';
export * from './html.js';

export { request };

export async function post<T, D>(url: string, data: D): Promise<AxiosResponse<T, D>> {
    const response = await request<T>({
        url,
        method: 'POST',
        data,
    });
    return response;
}

export async function get<T>(url: string): Promise<AxiosResponse<T>> {
    const response = await request<T>({
        url,
        method: 'GET',
    });
    return response;
}
