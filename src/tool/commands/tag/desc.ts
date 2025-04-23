import type { AxiosError } from 'axios';
import clc from 'cli-color';
import type { Tag } from '#shared/interfaces/ehtag';
import { get } from '#shared/ehentai/http/index';
import { command, parseTag, formatTag } from './command.js';
import { Cell } from '#shared/cell';
import type { Node, NodeMap, NodeType } from '#shared/interfaces/ehtag.ast';
import { normalizeTag } from '#tool/normalize-tag';

const LS = clc.blackBright('[');
const RS = clc.blackBright(']');
const LB = clc.blackBright('(');
const RB = clc.blackBright(')');
const E = clc.blackBright('!');
const BS = clc.blackBright('`');
const Q = clc.blackBright('"');

function link(content: string, url: string, title: string | undefined): string {
    if (!title) return `${LS}${content}${RS}${LB}${url}${RB}`;
    return `${LS}${content}${RS}${LB}${url} ${Q}${title}${Q}${RB}`;
}

function toString(tag: Node): string {
    const t = tag as NodeMap[NodeType];
    switch (t.type) {
        case 'br':
            return '\n';
        case 'paragraph':
            return t.content.map(toString).join('');
        case 'emphasis':
            return clc.italic(t.content.map(toString).join(''));
        case 'strong':
            return clc.bold(t.content.map(toString).join(''));
        case 'text':
            return t.text;
        case 'image':
            if (t.nsfw === 'R18G')
                return E + link(t.content.map(toString).join(''), clc.red('##'), clc.underline(t.url));
            if (t.nsfw === 'R18')
                return E + link(t.content.map(toString).join(''), clc.yellow('#'), clc.underline(t.url));
            return E + link(t.content.map(toString).join(''), clc.underline(t.url), t.title);
        case 'link':
            return link(t.content.map(toString).join(''), clc.underline(t.url), t.title);
        case 'tagref':
            return `${BS}${clc.green(t.text)}${BS}`;
    }
    return '';
}

/** 渲染 MD */
function render(raw: string): string {
    const cell = new Cell(raw);
    const md = cell.render('ast', undefined);
    const result = md.map(toString).join('\n\n');
    return result;
}

command
    .command('desc <[namespace:]tag>')
    .description('查询数据库中标签信息')
    .action(async (tag: string) => {
        const [namespace, raw] = parseTag(tag);
        const result = await normalizeTag(namespace, raw);
        if (!result) {
            console.error('未找到相应标签');
            process.exitCode = 1;
            return;
        }
        try {
            const info = await get<Tag<'raw'>>(
                `https://ehtt.fly.dev/database/${result[0]}/${result[1]}?format=raw.json`,
            );

            console.log(`${clc.blackBright('原始标签：')}${formatTag({ namespace: result[0], raw: result[1] })}`);
            console.log(`${clc.blackBright('    名称：')}${render(info.data.name)}`);
            console.log(`${clc.blackBright('    描述：')}${render(info.data.intro)}`);
            console.log(`${clc.blackBright('外部链接：')}${render(info.data.links)}`);
        } catch (err) {
            const ae = err as AxiosError;
            if (ae.response?.status === 404) {
                console.error(`未找到标签 ${result[0]}:${result[1]} 的翻译`);
                process.exitCode = 1;
                return;
            }
            console.error(err);
        }
    });
