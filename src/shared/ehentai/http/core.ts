import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios';
import { config as defaultConfig } from './config.js';

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function requestImpl<T = unknown, R = AxiosResponse<T>>(
    config: AxiosRequestConfig,
    retry: number,
    delayTime: number,
): Promise<R> {
    try {
        return axios.request<T, R>(config);
    } catch (err) {
        if (retry <= 0) {
            throw err;
        }
        const axiosError = err as AxiosError;
        if (axiosError.isAxiosError && (axiosError.response == null || axiosError.response.status >= 500)) {
            await delay(delayTime);
            return requestImpl<T, R>(config, retry - 1, delayTime * 2);
        }
        throw err;
    }
}

export async function request<T = unknown, R = AxiosResponse<T>>(config: AxiosRequestConfig, retry = 3): Promise<R> {
    if (!config.url) throw new Error('url is required');
    const def = defaultConfig(config.url, config);
    const headers = { ...def.headers, ...config.headers };
    const cfg = { ...def, ...config, headers };
    return requestImpl(cfg, retry, 1000);
}
