import type { AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import ProxyAgent from 'proxy-agent';

const agent = new ProxyAgent();
const proxyConfig: AxiosRequestConfig<never> = {
    httpAgent: agent,
    httpsAgent: agent,
    proxy: false,
};

const fakeHeaders: AxiosRequestHeaders = {
    dnt: '1',
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Microsoft Edge";v="101"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36 Edg/101.0.1210.53',
    'content-type': 'application/json',
    accept: '*/*',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'accept-Encoding': 'gzip, deflate, br',
    'accept-language': 'en,en-US;q=0.9',
};

export function config(url: string, _config: AxiosRequestConfig): AxiosRequestConfig<never> {
    const headers = { ...fakeHeaders };
    const u = new URL(url, 'https://e-hentai.org');
    headers['origin'] = u.origin;
    headers['referer'] = u.origin + '/';
    if (u.hostname.endsWith('hentai.org')) {
        headers['cookie'] =
            'ipb_member_id=3512590; ipb_pass_hash=cfb712ea2633f9894c5dae23146f78d0; igneous=322abe39d; sl=dm_2';
    }
    return {
        ...proxyConfig,
        headers,
    };
}
