import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import {
    RepoInfo,
    Commit,
    NamespaceInfo,
    Signature,
    Sha1Value,
    FrontMatters,
    NamespaceName,
    RepoData,
    NamespaceData,
    Tag,
} from '#shared/interfaces/ehtag';
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export class SignatureDto implements Signature {
    @ApiProperty({ type: String, description: '签名名称' })
    name!: string;
    @ApiProperty({ type: String, description: '签名 E-mail' })
    email!: string;
    @ApiProperty({ type: String, description: '签名时间' })
    when!: Date;
}
export class CommitDto implements Commit {
    @ApiProperty({ type: SignatureDto, description: '作者签名' })
    author!: SignatureDto;
    @ApiProperty({ type: SignatureDto, description: '提交者签名' })
    committer!: SignatureDto;
    @ApiProperty({ type: String, description: '提交的 SHA1 值' })
    sha!: Sha1Value;
    @ApiProperty({ type: String, description: '提交的消息' })
    message!: string;
}
class TagDtoBase {
    @IsString()
    @ApiProperty({ type: String, description: '描述' })
    intro!: string;
    @IsString()
    @ApiProperty({ type: String, description: '外部链接' })
    links!: string;
}

export class LooseTagDto extends TagDtoBase implements Tag<'raw'> {
    @IsString()
    @ApiProperty({ type: String, description: '名称' })
    name!: string;
}

export class TagDto extends TagDtoBase implements Tag<'raw'> {
    @MinLength(1)
    @ApiProperty({ type: String, description: '名称' })
    name!: string;
}
export class TagAndRawDto extends TagDto {
    @ApiProperty({ type: String, description: '原始标签' })
    raw!: string;
}

const Cell: SchemaObject[] = [
    {
        type: 'string',
        title: '原始文本',
    },
    {
        type: 'object',
        title: 'MarkDown Ast',
    },
    {
        type: 'string',
        title: 'HTML 文本',
    },
    {
        type: 'string',
        title: '纯文本',
    },
    {
        type: 'object',
        title: '完整信息',
    },
];
export class TagResponseDto implements Tag<unknown> {
    @ApiProperty({ oneOf: Cell, description: '名称' })
    name!: unknown;
    @ApiProperty({ oneOf: Cell, description: '描述' })
    intro!: unknown;
    @ApiProperty({ oneOf: Cell, description: '外部链接' })
    links!: unknown;
}

export class FrontMattersDto implements FrontMatters {
    @ApiProperty({
        description: '命名空间完整名称',
        enum: NamespaceName,
        enumName: 'NamespaceName',
    })
    key!: NamespaceName;
    @ApiPropertyOptional({ type: String, description: '命名空间简称' })
    abbr?: string;
    @ApiPropertyOptional({ type: [String], description: '命名空间的别名' })
    aliases?: string[];
    @ApiProperty({ type: String, description: '命名空间中文名称' })
    name!: string;
    @ApiProperty({ type: String, description: '命名空间描述' })
    description!: string;
    @ApiPropertyOptional({ type: String, description: '内容版权信息' })
    copyright?: string;
    @ApiPropertyOptional({ type: [String], description: '内容书写规则' })
    rules?: string[];
    @ApiPropertyOptional({ type: TagAndRawDto, description: '示例' })
    example?: Tag<'raw'> & { raw: string };
}

export class NamespaceInfoDto implements NamespaceInfo {
    @ApiProperty({ type: Number, description: '包含的记录条数' })
    count!: number;

    @ApiProperty({
        description: '命名空间完整名称',
        enum: NamespaceName,
        enumName: 'NamespaceName',
    })
    namespace!: NamespaceName;
    @ApiProperty({ type: FrontMattersDto, description: '命名空间文件头部数据' })
    frontMatters!: FrontMattersDto;
}

export class NamespaceDataDto extends NamespaceInfoDto implements NamespaceData<unknown> {
    @ApiProperty({
        example: {
            'ruri gokou': {
                name: '五更琉璃（黑猫）',
                intro:
                    `![黑猫](https://ehgt.org/1b/04/1b04021da892517c44f0729afb44168bd32c1c90-1985827-2521-3600-jpg_l.jpg)\n` +
                    `网名黑猫。SNS社群“宅女集合”的成员之一，桐乃在线下会认识的宅友。`,
                links:
                    `[萌娘百科](https://zh.moegirl.org.cn/zh-hans/五更琉璃) ` +
                    `[Fandom](https://oreimo.fandom.com/zh/wiki/五更琉璃)`,
            },
        } as { [raw: string]: Tag<unknown> },
        additionalProperties: {
            properties: {
                name: { type: 'cell' },
                intro: { type: 'cell' },
                links: { type: 'cell' },
            },
        },
    })
    data!: { [raw: string]: Tag<unknown> };
}
export class RepoInfoDto implements RepoInfo {
    @ApiProperty({ type: String, description: '仓库名称' })
    repo!: string;
    @ApiProperty({ type: CommitDto, description: '当前提交' })
    head!: CommitDto;
    @ApiProperty({ type: Number, description: '数据库版本' })
    version!: number;
    @ApiProperty({ type: [NamespaceInfoDto], description: '命名空间的信息' })
    data!: NamespaceInfoDto[];
}

export class RepoDataDto extends OmitType(RepoInfoDto, ['data']) implements RepoData<unknown> {
    @ApiProperty({ type: [NamespaceDataDto], description: '命名空间的数据' })
    data!: NamespaceDataDto[];
}
