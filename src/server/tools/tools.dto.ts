import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import type { TagResponseDto } from '../dtos/repo-info.dto.js';

export class TagParams {
    @ApiProperty({ type: String, description: '原始标签' })
    @IsString()
    raw!: string;
}

export class ParsedLine {
    key?: string;
    value!: TagResponseDto;
}
