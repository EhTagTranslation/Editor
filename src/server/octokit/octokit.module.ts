import { Module } from '@nestjs/common';
import { OctokitService } from './octokit.service.js';
import { OctokitController } from './octokit.controller.js';

@Module({
    providers: [OctokitService],
    controllers: [OctokitController],
    exports: [OctokitService],
})
export class OctokitModule {}
