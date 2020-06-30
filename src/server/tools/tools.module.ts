import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';
import { DatabaseModule } from 'server/database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [ToolsService],
    controllers: [ToolsController],
})
export class ToolsModule {}
