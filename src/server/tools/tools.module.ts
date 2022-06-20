import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service.js';
import { ToolsController } from './tools.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
    imports: [DatabaseModule],
    providers: [ToolsService],
    controllers: [ToolsController],
})
export class ToolsModule {}
