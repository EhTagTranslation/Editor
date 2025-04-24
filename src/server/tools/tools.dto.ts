import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { TagResponseDto } from '../dtos/repo-info.dto.js';
import { NamespaceName } from '#shared/interfaces/ehtag';
import { WithLogEntriesDto } from '#server/dtos/log.dto';

export class TagNsParams {
    @ApiProperty({
        enum: NamespaceName,
        enumName: 'NamespaceName',
        example: 'character',
        description: '命名空间完整名称',
    })
    @IsString()
    namespace!: NamespaceName;
}
export class TagParams extends TagNsParams {
    @ApiProperty({ type: String, description: '原始标签', example: 'ruri gokou' })
    @IsString()
    raw!: string;
}

export class TagResponseLogDto extends IntersectionType(TagResponseDto, WithLogEntriesDto) {}

export class ParsedLine extends TagResponseLogDto {
    @ApiProperty({ type: String, description: '原始标签', example: 'ruri gokou' })
    raw?: string;
}
