import type { AxiosRequestConfig } from 'axios';
import ProxyAgent from 'proxy-agent';

const agent = new ProxyAgent();
const config: AxiosRequestConfig<never> = {
    httpAgent: agent,
    httpsAgent: agent,
    proxy: false,
};

export default config;
