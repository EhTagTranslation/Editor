import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { NamespaceName, Sha1Value } from '#shared/interfaces/ehtag';
import { IsRawTag, RawTag } from '#shared/raw-tag';
export class NsParams {
    @ApiProperty({
        description: '命名空间名称',
        enum: NamespaceName,
        enumName: 'NamespaceName',
    })
    @IsIn(NamespaceName)
    namespace!: NamespaceName;
}

export class TagParams extends NsParams {
    @ApiProperty({ type: String, description: '原始标签' })
    @IsRawTag()
    raw!: RawTag;
}

export class PostTagQuery {
    @ApiProperty({ type: String, description: '插入该标签前一行' })
    @IsRawTag()
    @IsOptional()
    before?: RawTag;
    @ApiProperty({ type: String, description: '插入该标签后一行' })
    @IsRawTag()
    @IsOptional()
    after?: RawTag;
}
export interface PushEvent {
    ref: string;
    before: Sha1Value;
    after: Sha1Value;
    head_commit: Commit;
}
interface Commit {
    id: Sha1Value;
    tree_id: string;
    distinct: boolean;
    message: string;
    timestamp: Date;
    url: string;
    added: string[];
    removed: string[];
    modified: string[];
}
