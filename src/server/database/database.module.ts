import { Module } from '@nestjs/common';
import { OctokitModule } from '../octokit/octokit.module.js';
import { DatabaseService } from './database.service.js';
import { DatabaseController } from './database.controller.js';
import { DatabaseBadgeController } from './database-badge.controller.js';

@Module({
    imports: [OctokitModule],
    providers: [DatabaseService],
    controllers: [DatabaseController, DatabaseBadgeController],
    exports: [DatabaseService],
})
export class DatabaseModule {}
