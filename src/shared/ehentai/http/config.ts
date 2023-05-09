import type { RawAxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import { HttpClient } from '@actions/http-client';

const fakeHeaders = {
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
} satisfies RawAxiosRequestHeaders;

const COOKIE = (() => {
    const value =
        (process.env['EH_COOKIE'] ?? '').trim() ||
        (process.env['eh_cookie'] ?? '').trim() ||
        // https://exhentai.home.blog/2021/10/24/jc01/
        'ipb_member_id=7013610; ipb_pass_hash=1ff72e5df8f1949f2b48b49748432eca; igneous=298743a95;';
    const map = new Map<string, string>();
    for (const c of value.split(';')) {
        const match = /^\s*([^=]+?)\s*=\s*(.+?)\s*$/.exec(c);
        if (!match) continue;
        map.set(match[1], match[2]);
    }
    map.set('sl', 'dm_2');
    return [...map].map(([k, v]) => `${k}=${v}`).join(';');
})();

const client = new HttpClient(fakeHeaders['user-agent']);
export function config(config: RawAxiosRequestConfig): RawAxiosRequestConfig {
    const headers: RawAxiosRequestHeaders = { ...fakeHeaders, ...config.headers };
    const u = new URL(config.url ?? '', 'https://e-hentai.org');
    let { origin } = u;
    if (origin.endsWith('.e-hentai.org')) {
        origin = 'https://e-hentai.org';
    }
    headers['origin'] = origin;
    headers['referer'] = origin + '/';
    if (u.hostname.endsWith('hentai.org')) {
        headers['cookie'] = COOKIE;
    }
    const agent = client.getAgent(u.href);
    return {
        httpAgent: agent,
        httpsAgent: agent,
        proxy: false,
        ...config,
        headers,
    };
}
