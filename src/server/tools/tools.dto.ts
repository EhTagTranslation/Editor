import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { TagResponseDto } from '../dtos/repo-info.dto.js';

export class TagParams {
    @ApiProperty({ type: String, description: '原始标签', example: 'ruri gokou' })
    @IsString()
    raw!: string;
}

export class ParsedLine extends TagResponseDto {
    @ApiProperty({ type: String, description: '原始标签', example: 'ruri gokou' })
    raw?: string;
}
