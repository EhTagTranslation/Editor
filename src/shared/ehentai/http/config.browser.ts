import type { AxiosRequestConfig } from 'axios';

export function config(_url: string, _config: AxiosRequestConfig): AxiosRequestConfig<never> {
    return {
        headers: {},
    };
}
