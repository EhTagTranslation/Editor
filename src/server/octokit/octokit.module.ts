import { Module } from '@nestjs/common';
import { OctokitService } from './octokit.service.js';

@Module({
    providers: [OctokitService],
    exports: [OctokitService],
})
export class OctokitModule {}
