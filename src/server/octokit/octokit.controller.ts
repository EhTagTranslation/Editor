import { Controller, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { InjectableBase } from '../injectable-base.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OctokitService } from './octokit.service.js';

@ApiTags('Octokit')
@Controller('octokit')
export class OctokitController extends InjectableBase {
    constructor(private readonly octokit: OctokitService) {
        super();
    }

    private releaseCache: unknown = null;
    @Get('release')
    @ApiOperation({ summary: '获取最新版本', description: '代理 GitHub API' })
    @HttpCode(HttpStatus.OK)
    async release(): Promise<unknown> {
        if (this.releaseCache) {
            return this.releaseCache;
        }
        const response = await this.octokit.forApp.repos.getLatestRelease({
            owner: this.octokit.owner,
            repo: this.octokit.repo,
        });
        this.releaseCache = response.data;
        setTimeout(() => {
            this.releaseCache = null;
        }, 1000);
        return this.releaseCache;
    }
}
