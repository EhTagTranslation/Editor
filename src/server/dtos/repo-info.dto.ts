import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import {
    type RepoInfo,
    type Commit,
    type NamespaceInfo,
    type Signature,
    type Sha1Value,
    type FrontMatters,
    NamespaceName,
    type Tag,
} from '#shared/interfaces/ehtag';
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export class SignatureDto implements Signature {
    @ApiProperty({ type: String, description: '签名名称', example: 'user' })
    name!: string;
    @ApiProperty({ type: String, description: '签名 E-mail', format: 'email' })
    email!: string;
    @ApiProperty({ type: Date, description: '签名时间' })
    when!: Date;
}
export class CommitDto implements Commit {
    @ApiProperty({ type: SignatureDto, description: '作者签名' })
    author!: SignatureDto;
    @ApiProperty({ type: SignatureDto, description: '提交者签名' })
    committer!: SignatureDto;
    @ApiProperty({
        type: String,
        description: '提交的 SHA1 值',
        pattern: '^[a-f0-9]{40}$',
    })
    sha!: Sha1Value;
    @ApiProperty({
        type: String,
        description: '提交的消息',
    })
    message!: string;
}
class TagDtoBase {
    @IsString()
    @ApiProperty({
        type: String,
        description: '描述',
        example:
            `![黑猫](https://ehgt.org/1b/04/1b04021da892517c44f0729afb44168bd32c1c90-1985827-2521-3600-jpg_l.jpg)\n` +
            `网名黑猫。SNS社群“宅女集合”的成员之一，桐乃在线下会认识的宅友。`,
    })
    intro!: string;
    @IsString()
    @ApiProperty({
        type: String,
        description: '外部链接',
        example:
            `[萌娘百科](https://zh.moegirl.org.cn/zh-hans/五更琉璃) ` +
            `[Fandom](https://oreimo.fandom.com/zh/wiki/五更琉璃)`,
    })
    links!: string;
}

export class LooseTagDto extends TagDtoBase implements Tag<'raw'> {
    @IsString()
    @ApiProperty({ type: String, description: '名称', example: '五更琉璃（黑猫）' })
    name!: string;
}

export class TagDto extends TagDtoBase implements Tag<'raw'> {
    @MinLength(1)
    @ApiProperty({ type: String, description: '名称', example: '五更琉璃（黑猫）' })
    name!: string;
}
export class TagAndRawDto extends TagDto {
    @ApiProperty({ type: String, description: '原始标签', example: 'ruri gokou' })
    raw!: string;
}

const Cell: SchemaObject[] = [
    {
        type: 'string',
        description: '原始文本',
    },
    {
        type: 'object',
        description: 'MarkDown Ast',
    },
    {
        type: 'string',
        description: 'HTML 文本',
    },
    {
        type: 'string',
        description: '纯文本',
    },
    {
        type: 'object',
        description: '完整信息',
        properties: {
            raw: {
                type: 'string',
                description: '原始文本',
            },
            ast: {
                type: 'object',
                description: 'MarkDown Ast',
            },
            html: {
                type: 'string',
                description: 'HTML 文本',
            },
            text: {
                type: 'string',
                description: '纯文本',
            },
        },
    },
];
export class TagResponseDto implements Tag<unknown> {
    @ApiProperty({ oneOf: Cell, description: '名称', example: '五更琉璃（黑猫）' })
    name!: unknown;
    @ApiProperty({
        oneOf: Cell,
        description: '描述',
        example:
            `![黑猫](https://ehgt.org/1b/04/1b04021da892517c44f0729afb44168bd32c1c90-1985827-2521-3600-jpg_l.jpg)\n` +
            `网名黑猫。SNS社群“宅女集合”的成员之一，桐乃在线下会认识的宅友。`,
    })
    intro!: unknown;
    @ApiProperty({
        oneOf: Cell,
        description: '外部链接',
        example:
            `[萌娘百科](https://zh.moegirl.org.cn/zh-hans/五更琉璃) ` +
            `[Fandom](https://oreimo.fandom.com/zh/wiki/五更琉璃)`,
    })
    links!: unknown;
}

export class FrontMattersDto implements FrontMatters {
    @ApiProperty({
        description: '命名空间完整名称',
        enum: NamespaceName,
        enumName: 'NamespaceName',
        example: 'character',
    })
    key!: NamespaceName;
    @ApiPropertyOptional({ type: String, description: '命名空间简称', example: 'c' })
    abbr?: string;
    @ApiPropertyOptional({ type: [String], description: '命名空间的别名', example: ['char'] })
    aliases?: string[];
    @ApiProperty({ type: String, description: '命名空间中文名称', example: '角色' })
    name!: string;
    @ApiProperty({ type: String, description: '命名空间描述', example: '作品中出现的角色。' })
    description!: string;
    @ApiPropertyOptional({
        type: String,
        description: '内容版权信息',
        example:
            '对于标有(*)的条目，其描述文本复制/翻译自维基百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-相同方式共享 3.0协议）进行二次分发。\n\n对于标有(**)的条目，其描述文本复制/翻译自萌娘百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议）进行二次分发。\n',
    })
    copyright?: string;
    @ApiPropertyOptional({
        type: [String],
        description: '内容书写规则',
        example: [
            '优先写公认的中文翻译，不知道的也可以写日文原名。',
            '第一推荐萌娘百科，也可以用百度百科或维基百科查译名。',
        ],
    })
    rules?: string[];
    @ApiPropertyOptional({
        type: TagAndRawDto,
        description: '示例',
        example: {
            raw: 'ruri gokou',
            name: '五更琉璃（黑猫）',
            intro: '![黑猫](https://ehgt.org/1b/04/1b04021da892517c44f0729afb44168bd32c1c90-1985827-2521-3600-jpg_l.jpg)\n网名黑猫。SNS社群“宅女集合”的成员之一，桐乃在线下会认识的宅友。\n',
            links: '[萌娘百科](https://zh.moegirl.org.cn/zh-hans/五更琉璃) [Fandom](https://oreimo.fandom.com/zh/wiki/五更琉璃)\n',
        },
    })
    example?: Tag<'raw'> & { raw: string };
}

export class NamespaceInfoDto implements NamespaceInfo {
    @ApiProperty({ type: Number, description: '包含的记录条数', example: 3548 })
    count!: number;

    @ApiProperty({
        description: '命名空间完整名称',
        enum: NamespaceName,
        enumName: 'NamespaceName',
        example: 'character',
    })
    namespace!: NamespaceName;
    @ApiProperty({ type: FrontMattersDto, description: '命名空间文件头部数据' })
    frontMatters!: FrontMattersDto;
}

export class RepoInfoDto implements RepoInfo {
    @ApiProperty({ type: String, description: '仓库 URL', example: 'https://github.com/EhTagTranslation/Database.git' })
    repo!: string;
    @ApiProperty({ type: CommitDto, description: '当前提交' })
    head!: CommitDto;
    @ApiProperty({ type: Number, description: '数据库版本', example: 6 })
    version!: number;
    @ApiProperty({
        type: [NamespaceInfoDto],
        description: '命名空间的信息',
        example: [
            {
                namespace: 'rows',
                frontMatters: {
                    name: '内容索引',
                    description: '标签列表的行名，即标签的命名空间。',
                    key: 'rows',
                    rules: ['参考命名空间(https://ehwiki.org/wiki/Namespace)撰写翻译。'],
                },
                count: 12,
            },
            {
                namespace: 'reclass',
                frontMatters: {
                    name: '重新分类',
                    description: '用于分类出错的图库，当某个重新分类标签权重达到 100，将移动图库至对应分类。',
                    key: 'reclass',
                    abbr: 'r',
                    copyright:
                        '除有特殊说明外，本文的简介文本翻译自 EHWiki，遵循原始许可协议（即 GNU 自由文档许可证）进行二次分发。\n\nCopyright (c) 2022 EhTagTranslation. Permission is granted to copy, distribute and/or modify this document under the terms of the GNU Free Documentation License, Version 1.2 or any later version published by the Free Software Foundation; with no Invariant Sections, no Front-Cover Texts, and no Back-Cover Texts. A copy of the license is included in the section entitled "GNU Free Documentation License".\n\n本文的其他内容，遵循知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议提供。\n',
                    rules: ['参考图库分类(https://ehwiki.org/wiki/Gallery_Categories)撰写翻译。'],
                },
                count: 11,
            },
            {
                namespace: 'language',
                frontMatters: {
                    name: '语言',
                    description: '作品的语言。',
                    key: 'language',
                    abbr: 'l',
                    aliases: ['lang'],
                    copyright:
                        '除有特殊说明外，本文的简介文本复制/翻译自维基百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-相同方式共享 3.0协议）进行二次分发。\n\n对于标有(*)的条目，其简介文本翻译自 EHWiki，遵循原始许可协议（即 GNU 自由文档许可证）进行二次分发。\n\nCopyright (c) 2022 EhTagTranslation. Permission is granted to copy, distribute and/or modify this document under the terms of the GNU Free Documentation License, Version 1.2 or any later version published by the Free Software Foundation; with no Invariant Sections, no Front-Cover Texts, and no Back-Cover Texts. A copy of the license is included in the section entitled "GNU Free Documentation License".\n\n对于标有(**)的条目，其简介文本复制/翻译自萌娘百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议）进行二次分发。\n\n本文的其他内容，遵循知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议提供。\n',
                    rules: ['语言按首字母排序。', '语言列表参考语言标签目录(https://ehwiki.org/wiki/language)。'],
                    example: {
                        raw: 'speechless',
                        name: '无言',
                        intro: '图库没有任何表示交谈或叙事意义的文字。设置该图库语言为无语言(N/A)。含有拟声词或发出声音不影响此标签。不要和`text cleaned`混淆。\n',
                        links: '(\\*)\n',
                    },
                },
                count: 87,
            },
            {
                namespace: 'parody',
                frontMatters: {
                    name: '原作',
                    description: '同人作品模仿的原始作品。',
                    key: 'parody',
                    abbr: 'p',
                    aliases: ['series'],
                    copyright:
                        '对于标有(*)的条目，其描述文本复制/翻译自维基百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-相同方式共享 3.0协议）进行二次分发。\n\n对于标有(**)的条目，其描述文本复制/翻译自萌娘百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议）进行二次分发。\n',
                    rules: [
                        '优先写公认的中文翻译，不知道的也可以写日文原名。',
                        '第一推荐萌娘百科，也可以用百度百科或维基百科查译名。',
                        '描述图片尽量出现尽可能多的主角，或者其他易于辨识的作品标志物。',
                    ],
                    example: {
                        raw: 'kantai collection',
                        name: '![大船](https://tva1.sinaimg.cn/large/6c84b2d6gy1fehdg37hq1g200k00c03b.gif)舰队Collection',
                        intro: '《舰队Collection》（艦隊これくしょん -艦これ-，又译舰队收藏）\n![图](https://ehgt.org/d5/4c/d54cf38acf7115b65c8e9ae6496b85a7d3cd38de-701265-1416-2000-jpg_l.jpg)\n',
                        links: '[官网地址](http://www.dmm.com/netgame/feature/kancolle.html) [萌娘百科](https://zh.moegirl.org.cn/舰队Collection)\n',
                    },
                },
                count: 1925,
            },
            {
                namespace: 'character',
                frontMatters: {
                    name: '角色',
                    description: '作品中出现的角色。',
                    key: 'character',
                    abbr: 'c',
                    aliases: ['char'],
                    copyright:
                        '对于标有(*)的条目，其描述文本复制/翻译自维基百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-相同方式共享 3.0协议）进行二次分发。\n\n对于标有(**)的条目，其描述文本复制/翻译自萌娘百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议）进行二次分发。\n',
                    rules: [
                        '优先写公认的中文翻译，不知道的也可以写日文原名。',
                        '第一推荐萌娘百科，也可以用百度百科或维基百科查译名。',
                    ],
                    example: {
                        raw: 'ruri gokou',
                        name: '五更琉璃（黑猫）',
                        intro: '![黑猫](https://ehgt.org/1b/04/1b04021da892517c44f0729afb44168bd32c1c90-1985827-2521-3600-jpg_l.jpg)\n网名黑猫。SNS社群“宅女集合”的成员之一，桐乃在线下会认识的宅友。\n',
                        links: '[萌娘百科](https://zh.moegirl.org.cn/zh-hans/五更琉璃) [Fandom](https://oreimo.fandom.com/zh/wiki/五更琉璃)\n',
                    },
                },
                count: 3548,
            },
            {
                namespace: 'group',
                frontMatters: {
                    name: '团队',
                    description: '制作社团或公司。',
                    key: 'group',
                    abbr: 'g',
                    aliases: ['creator', 'circle'],
                    copyright:
                        '对于标有(*)的条目，其描述文本复制/翻译自维基百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-相同方式共享 3.0协议）进行二次分发。\n\n对于标有(**)的条目，其描述文本复制/翻译自萌娘百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议）进行二次分发。\n',
                    rules: [
                        '有官方或公认的中文名称时优先写中文名，否则写日文名。',
                        '日文名中有汉字者优先写含汉字的名称。',
                    ],
                    example: {
                        raw: 'twinbox',
                        name: 'TwinBox',
                        intro: '「TwinBox」是`hanahanamaki`和`sousouman`共同的同人社团名称，同时也是商业活动的笔名。\n',
                        links: '[X](https://x.com/digimon215) [pixiv](https://www.pixiv.net/users/264932) [微博](https://weibo.com/u/5189316437) [官方网站](https://www.twinbox-tb.com)\n',
                    },
                },
                count: 12406,
            },
            {
                namespace: 'artist',
                frontMatters: {
                    name: '艺术家',
                    description: '绘画作者/写手。',
                    key: 'artist',
                    abbr: 'a',
                    copyright:
                        '对于标有(*)的条目，其描述文本复制/翻译自维基百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-相同方式共享 3.0协议）进行二次分发。\n\n对于标有(**)的条目，其描述文本复制/翻译自萌娘百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议）进行二次分发。\n',
                    rules: [
                        '有官方或公认的中文名称时优先写中文名，否则写日文名。',
                        '日文名中有汉字者优先写含汉字的名称。',
                        '描述图片可用作者的 pixiv 头像，或者为你自己喜爱的画师做一张图片。为排版好看，头像高度建议 200px 以内，当然头像里明显H的就不要放了。',
                    ],
                    example: {
                        raw: 'oouso',
                        name: '大嘘',
                        intro: '![大嘘头像](https://tva1.sinaimg.cn/large/6c84b2d6gy1fjkes482gzj204q04qmxx.jpg)\n袜控，尻控，女子高中生(误)画家。\n',
                        links: '[X](https://x.com/u_s_o) [pixiv](https://www.pixiv.net/users/457541)\n',
                    },
                },
                count: 12072,
            },
            {
                namespace: 'cosplayer',
                frontMatters: {
                    name: 'Coser',
                    description: '角色扮演者。',
                    key: 'cosplayer',
                    abbr: 'cos',
                    copyright:
                        '对于标有(*)的条目，其描述文本复制/翻译自维基百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-相同方式共享 3.0协议）进行二次分发。\n\n对于标有(**)的条目，其描述文本复制/翻译自萌娘百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议）进行二次分发。\n',
                    rules: [
                        '有官方或公认的中文名称时优先写中文名，否则写日文名。',
                        '日文名中有汉字者优先写含汉字的名称。',
                        '描述图片可用作者的 pixiv 头像，或者为你自己喜爱的画师做一张图片。为排版好看，头像高度建议 200px 以内，当然头像里明显H的就不要放了。',
                    ],
                    example: {
                        raw: 'sayako',
                        name: 'さやこ',
                        intro: '',
                        links: '[X](https://x.com/sayako_cos)',
                    },
                },
                count: 49,
            },
            {
                namespace: 'male',
                frontMatters: {
                    name: '男性',
                    description: '男性角色相关的恋物标签。',
                    key: 'male',
                    abbr: 'm',
                    copyright:
                        '除有特殊说明外，本文的简介文本翻译自 EHWiki，遵循原始许可协议（即 GNU 自由文档许可证）进行二次分发。\n\nCopyright (c) 2022 EhTagTranslation. Permission is granted to copy, distribute and/or modify this document under the terms of the GNU Free Documentation License, Version 1.2 or any later version published by the Free Software Foundation; with no Invariant Sections, no Front-Cover Texts, and no Back-Cover Texts. A copy of the license is included in the section entitled "GNU Free Documentation License".\n\n对于标有(*)的条目，其简介文本复制/翻译自维基百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-相同方式共享 3.0协议）进行二次分发。\n\n对于标有(**)的条目，其简介文本复制/翻译自萌娘百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议）进行二次分发。\n\n本文的其他内容，遵循知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议提供。\n',
                    rules: [
                        '为方便查找理解同类性癖的标签，请尽量按恋物标签分类(https://ehwiki.org/wiki/Fetish_Listing)归类存放，将类别写成注释。',
                        '若有属于多个分类的，放入最相关的那一个分类。',
                    ],
                    example: {
                        raw: 'tanlines',
                        name: '晒痕',
                        intro: '浅浅的可见的线，通常来自衣服，由日光浴导致。不得与`dark skin`混淆。\n![图](# "https://ehgt.org/e8/e8/e8e84e887aae3d27b78b7e1d9531c7bda453b5dd-1178193-1200-1694-jpg_l.jpg")\n',
                        links: '',
                    },
                },
                count: 516,
            },
            {
                namespace: 'female',
                frontMatters: {
                    name: '女性',
                    description: '女性角色相关的恋物标签。',
                    key: 'female',
                    abbr: 'f',
                    copyright:
                        '除有特殊说明外，本文的简介文本翻译自 EHWiki，遵循原始许可协议（即 GNU 自由文档许可证）进行二次分发。\n\nCopyright (c) 2022 EhTagTranslation. Permission is granted to copy, distribute and/or modify this document under the terms of the GNU Free Documentation License, Version 1.2 or any later version published by the Free Software Foundation; with no Invariant Sections, no Front-Cover Texts, and no Back-Cover Texts. A copy of the license is included in the section entitled "GNU Free Documentation License".\n\n对于标有(*)的条目，其简介文本复制/翻译自维基百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-相同方式共享 3.0协议）进行二次分发。\n\n对于标有(**)的条目，其简介文本复制/翻译自萌娘百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议）进行二次分发。\n\n本文的其他内容，遵循知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议提供。\n',
                    rules: [
                        '为方便查找理解同类性癖的标签，请尽量按恋物标签分类(https://ehwiki.org/wiki/Fetish_Listing)归类存放，将类别写成注释。',
                        '若有属于多个分类的，放入最相关的那一个分类。',
                    ],
                    example: {
                        raw: 'tanlines',
                        name: '晒痕',
                        intro: '浅浅的可见的线，通常来自衣服，由日光浴导致。不得与`dark skin`混淆。\n![图](# "https://ehgt.org/d6/a8/d6a86a4e2a3d78d869d1f7da6a80e9ab3bf4d319-1264624-1200-1600-jpg_l.jpg")\n',
                        links: '',
                    },
                },
                count: 562,
            },
            {
                namespace: 'mixed',
                frontMatters: {
                    name: '混合',
                    description: '两性/中性的恋物标签。',
                    key: 'mixed',
                    abbr: 'x',
                    copyright:
                        '除有特殊说明外，本文的简介文本翻译自 EHWiki，遵循原始许可协议（即 GNU 自由文档许可证）进行二次分发。\n\nCopyright (c) 2022 EhTagTranslation. Permission is granted to copy, distribute and/or modify this document under the terms of the GNU Free Documentation License, Version 1.2 or any later version published by the Free Software Foundation; with no Invariant Sections, no Front-Cover Texts, and no Back-Cover Texts. A copy of the license is included in the section entitled "GNU Free Documentation License".\n\n对于标有(*)的条目，其简介文本复制/翻译自维基百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-相同方式共享 3.0协议）进行二次分发。\n\n对于标有(**)的条目，其简介文本复制/翻译自萌娘百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议）进行二次分发。\n\n本文的其他内容，遵循知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议提供。\n',
                    rules: [
                        '为方便查找理解同类性癖的标签，请尽量按恋物标签分类(https://ehwiki.org/wiki/Fetish_Listing)归类存放，将类别写成注释。',
                        '若有属于多个分类的，放入最相关的那一个分类。',
                    ],
                    example: {
                        raw: 'group',
                        name: '乱交',
                        intro: '两个以上的人同时进行性行为。是它们的前置标签：`harem`、`layer cake`、`mtf threesome`、`mmt threesome`、`mmf threesome`、`ttm threesome`、`ttf threesome`、`ffm threesome`和`fft threesome`等 3P 标签。\n',
                        links: '',
                    },
                },
                count: 19,
            },
            {
                namespace: 'other',
                frontMatters: {
                    name: '其他',
                    description: '经过确认的技术标签。',
                    key: 'other',
                    abbr: 'o',
                    copyright:
                        '除有特殊说明外，本文的简介文本翻译自 EHWiki，遵循原始许可协议（即 GNU 自由文档许可证）进行二次分发。\n\nCopyright (c) 2022 EhTagTranslation. Permission is granted to copy, distribute and/or modify this document under the terms of the GNU Free Documentation License, Version 1.2 or any later version published by the Free Software Foundation; with no Invariant Sections, no Front-Cover Texts, and no Back-Cover Texts. A copy of the license is included in the section entitled "GNU Free Documentation License".\n\n对于标有(*)的条目，其简介文本复制/翻译自维基百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-相同方式共享 3.0协议）进行二次分发。\n\n对于标有(**)的条目，其简介文本复制/翻译自萌娘百科，遵循原始许可协议（即知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议）进行二次分发。\n\n本文的其他内容，遵循知识共享(Creative Commons) 署名-非商业性使用-相同方式共享 3.0 协议提供。\n',
                    rules: [
                        '为方便查找理解同类性癖的标签，请尽量按恋物标签分类(https://ehwiki.org/wiki/Fetish_Listing)归类存放，将类别写成注释。',
                        '若有属于多个分类的，放入最相关的那一个分类。',
                    ],
                    example: {
                        raw: 'anaglyph',
                        name: '红蓝3D',
                        intro: '使用双色产生 3D 效果的图片。不应与`3d`和`stereoscopic`混淆。\n',
                        links: '',
                    },
                },
                count: 56,
            },
        ],
    })
    data!: NamespaceInfoDto[];
}
