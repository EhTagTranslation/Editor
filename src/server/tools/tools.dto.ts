import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { TagResponseDto } from '../dtos/repo-info.dto.js';

export class TagParams {
    @ApiProperty({ type: String, description: '原始标签' })
    @IsString()
    raw!: string;
}

export class ParsedLine {
    @ApiProperty({ type: String, description: '原始标签' })
    key?: string;
    @ApiProperty({ type: TagResponseDto, description: '翻译内容' })
    value!: TagResponseDto;
}
