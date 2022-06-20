import { ApiProperty, OmitType } from '@nestjs/swagger';
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

export class SignatureDto implements Signature {
    name!: string;
    email!: string;
    when!: Date;
}
export class CommitDto implements Commit {
    author!: SignatureDto;
    committer!: SignatureDto;
    sha!: Sha1Value;
    message!: string;
}

export class FrontMattersDto implements FrontMatters {
    @ApiProperty({
        enum: NamespaceName,
        enumName: 'NamespaceName',
    })
    key!: NamespaceName;
    name!: string;
    description!: string;
    copyright?: string;
    rules?: string[];
}

export class NamespaceInfoDto implements NamespaceInfo {
    count!: number;

    @ApiProperty({
        enum: NamespaceName,
        enumName: 'NamespaceName',
    })
    namespace!: NamespaceName;
    frontMatters!: FrontMattersDto;
}
class TagDtoBase {
    @IsString()
    intro!: string;
    @IsString()
    links!: string;
}

export class LooseTagDto extends TagDtoBase implements Tag<'raw'> {
    @IsString()
    name!: string;
}

export class TagDto extends TagDtoBase implements Tag<'raw'> {
    @MinLength(1)
    name!: string;
}
export class TagResponseDto implements Tag<unknown> {
    name!: unknown;
    intro!: unknown;
    links!: unknown;
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
    repo!: string;
    head!: CommitDto;
    version!: number;
    data!: NamespaceInfoDto[];
}

export class RepoDataDto extends OmitType(RepoInfoDto, ['data']) implements RepoData<unknown> {
    data!: NamespaceDataDto[];
}
