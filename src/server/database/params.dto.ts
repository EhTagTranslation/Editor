import { ApiProperty } from '@nestjs/swagger';
import { NamespaceName } from 'shared/interfaces/ehtag';
import { IsIn, IsOptional } from 'class-validator';
import { IsRawTag, RawTag } from 'shared/validate';
export class NsParams {
    @ApiProperty({
        description: '命名空间名称',
        enum: NamespaceName,
        enumName: 'NamespaceName',
    })
    @IsIn((NamespaceName as unknown) as unknown[])
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
