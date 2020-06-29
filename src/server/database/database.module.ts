import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { OctokitModule } from 'server/octokit/octokit.module';
import { DatabaseBadgeController } from './database-badge.controller';

@Module({
    imports: [OctokitModule],
    providers: [DatabaseService],
    controllers: [DatabaseController, DatabaseBadgeController],
    exports: [DatabaseService],
})
export class DatabaseModule {}
