import { NamespaceName, Tag } from './ehtag';

export const NamespaceInfo: { [k in NamespaceName]: Tag<'text'> } = {
  rows: { name: '行名', intro: '标签列表的行名，即标签的命名空间。', links: '数据库页面' },
  artist: { name: '艺术家', intro: '绘画作者 / Coser。', links: '数据库页面' },
  female: { name: '女性', intro: '女性角色相关的恋物标签。', links: '数据库页面' },
  male: { name: '男性', intro: '男性角色相关的恋物标签。', links: '数据库页面' },
  parody: { name: '原作', intro: '同人作品模仿的原始作品。', links: '数据库页面' },
  character: { name: '角色', intro: '作品中出现的角色。', links: '数据库页面' },
  group: { name: '团队', intro: '制作社团或公司。', links: '数据库页面' },
  language: { name: '语言', intro: '作品的语言。', links: '数据库页面' },
  reclass: { name: '重新分类', intro: '用于分类出错的画廊，当某个重新分类标签权重达到 100，将移动画廊至对应分类。', links: '数据库页面' },
  misc: { name: '杂项', intro: '两性/中性的恋物标签或没有具体分类的标签，可以在论坛发帖请求管理员添加新的标签或将标签移动到正确分类。', links: '数据库页面' },
};

export interface ETKey {
  raw: string;
  namespace: NamespaceName;
}

export function isValidRaw(raw?: string | null) {
  if (!raw) {
    return false;
  }
  return raw.search(/^[-\.a-zA-Z0-9][- \.a-zA-Z0-9]*[-\.a-zA-Z0-9]$/) >= 0;
}

export const notEditableNs: ReadonlyArray<NamespaceName> = [
  'rows',
  'reclass',
  'language',
  'male',
  'female',
  'misc',
];
export const editableNs: ReadonlyArray<NamespaceName> = [
  'parody',
  'character',
  'group',
  'artist',
];


