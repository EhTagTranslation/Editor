import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios';
import { config as defaultConfig } from './config';

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
    return requestImpl({ ...defaultConfig(config.url, config), ...config }, retry, 1000);
}
