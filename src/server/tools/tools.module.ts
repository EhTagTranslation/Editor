import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';

@Module({
  providers: [ToolsService],
  controllers: [ToolsController]
})
export class ToolsModule {}
