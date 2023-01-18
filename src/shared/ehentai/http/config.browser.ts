import type { RawAxiosRequestConfig } from 'axios';

export function config(_url: string, _config: RawAxiosRequestConfig): RawAxiosRequestConfig<never> {
    return {
        headers: {},
    };
}
