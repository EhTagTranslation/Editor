import axios, { type AxiosResponse, type RawAxiosRequestConfig, isAxiosError } from 'axios';
import { config as defaultConfig } from './config.js';

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function requestImpl<T = unknown, R = AxiosResponse<T>>(
    config: RawAxiosRequestConfig,
    retry: number,
    delayTime: number,
    errors: Error[],
): Promise<R> {
    try {
        return await axios.request<T, R>(config);
    } catch (err) {
        if (isAxiosError(err) && err.response != null && err.response.status < 500) {
            throw err;
        }
        errors.push(err as Error);
        if (errors.length > retry) {
            throw new AggregateError(errors, `Failed after ${errors.length} tries.`);
        }
        await delay(delayTime);
        return requestImpl<T, R>(config, retry, delayTime * 5, errors);
    }
}

export async function request<T = unknown, R = AxiosResponse<T>>(config: RawAxiosRequestConfig, retry = 3): Promise<R> {
    if (!config.url) throw new Error('url is required');
    const cfg = defaultConfig(config);
    return requestImpl(cfg, retry, 600, []);
}
