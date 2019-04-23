type Sha1Value = string;

interface Signature {
  name: string;
  email: string;
  when: Date;
}

interface Commit {
  author: Signature;
  committer: Signature;
  sha: Sha1Value;
  message: string;
}

export interface ETRepoInfo {
  repo: string;
  head: Commit;
  version: number;
  data: ETNamespaceInfo[];
}

export interface ETRoot extends ETRepoInfo {
  data: ETNamespace[];
}

export type ETNamespaceName = 'rows'
  | 'reclass'
  | 'language'
  | 'parody'
  | 'character'
  | 'group'
  | 'artist'
  | 'male'
  | 'female'
  | 'misc';

export const ETNamespaceInfo: { [k in ETNamespaceName]: ETTag } = {
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
export enum ETNamespaceEnum {
  'rows',
  'reclass',
  'language',
  'parody',
  'character',
  'group',
  'artist',
  'male',
  'female',
  'misc',
}

export interface ETNamespaceInfo {
  count: number;
  namespace: ETNamespaceName;

}

export interface ETNamespace extends ETNamespaceInfo {
  data: { [row: string]: ETTag };
}

export interface ETTag {
  intro: string;
  links: string;
  name: NonNullable<string>;
}

export interface RenderedETTag {
  renderedIntro: string;
  renderedLinks: string;
  renderedName: NonNullable<string>;
  textIntro: string;
  textLinks: string;
  textName: NonNullable<string>;
}

export interface ETKey {
  raw: NonNullable<string>;
  namespace: ETNamespaceName;
}

export interface ETItem extends ETTag, ETKey { }

export interface RenderedETItem extends ETTag, RenderedETTag, ETKey { }

export function isValidRaw(raw?: string | null) {
  if (!raw) {
    return false;
  }
  return raw.search(/^[-\.a-zA-Z0-9][- \.a-zA-Z0-9]*[-\.a-zA-Z0-9]$/) >= 0;
}

export const notEditableNs: ReadonlyArray<ETNamespaceName> = [
  'rows',
];
export const editableNs: ReadonlyArray<ETNamespaceName> = [
  'reclass',
  'language',
  'parody',
  'character',
  'group',
  'artist',
  'male',
  'female',
  'misc',
];


