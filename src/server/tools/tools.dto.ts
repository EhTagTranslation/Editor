import { IsRawTag, RawTag } from 'shared/validate';
import { ApiProperty } from '@nestjs/swagger';
import { TagResponseDto } from 'server/dtos/repo-info.dto';
export class TagParams {
    @ApiProperty({ type: String, description: '原始标签' })
    raw!: RawTag;
}

export class ParsedLine {
    key?: string;
    value!: TagResponseDto;
}
