import type { AxiosRequestConfig } from 'axios';

export function config(_url: string): AxiosRequestConfig<never> {
    return {
        headers: {},
    };
}
