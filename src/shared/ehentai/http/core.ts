import axios, { type AxiosResponse, type RawAxiosRequestConfig, isAxiosError } from 'axios';
import { config as defaultConfig } from './config.js';

const delay = async (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function requestImpl<T = unknown>(
    config: RawAxiosRequestConfig,
    retry: number,
    delayTime: number,
    errors: Error[],
): Promise<AxiosResponse<T>> {
    try {
        return await axios.request<T>(config);
    } catch (err) {
        if (isAxiosError(err) && err.response != null && err.response.status < 500) {
            throw err;
        }
        errors.push(err as Error);
        if (errors.length > retry) {
            throw new AggregateError(
                errors,
                `Failed after ${errors.length} tries.\n${errors.map((e) => e.message).join('\n')}`,
                { cause: err },
            );
        }
        await delay(delayTime);
        return requestImpl<T>(config, retry, delayTime * 5, errors);
    }
}

export async function request<T = unknown>(config: RawAxiosRequestConfig, retry = 5): Promise<AxiosResponse<T>> {
    if (!config.url) throw new Error('url is required');
    const cfg = defaultConfig(config);
    return requestImpl(cfg, retry, 600, []);
}
