import { ApiProperty } from '@nestjs/swagger';
import type { TagResponseDto } from 'server/dtos/repo-info.dto';
import { IsString } from 'class-validator';

export class TagParams {
    @ApiProperty({ type: String, description: '原始标签' })
    @IsString()
    raw!: string;
}

export class ParsedLine {
    key?: string;
    value!: TagResponseDto;
}
