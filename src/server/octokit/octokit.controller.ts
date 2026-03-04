import { brotliCompress } from 'node:zlib';
import { promisify } from 'node:util';
import { Controller, HttpStatus, Get, Req, Res, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { InjectableBase } from '../injectable-base.js';
import { OctokitService } from './octokit.service.js';

const brotliCompressAsync = promisify(brotliCompress);

@ApiTags('Octokit')
@Controller('octokit')
export class OctokitController extends InjectableBase implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly octokit: OctokitService) {
        super();
    }
    private releaseLoopHandle: NodeJS.Timeout | null = null;
    async onModuleInit(): Promise<void> {
        await this.fetchRelease();
        this.releaseLoopHandle = setInterval(() => {
            void this.fetchRelease();
        }, 10_000);
    }
    onModuleDestroy(): void {
        if (this.releaseLoopHandle) {
            clearInterval(this.releaseLoopHandle);
            this.releaseLoopHandle = null;
        }
    }

    private releaseCache: { json: string; br: Buffer } | null = null;
    private async fetchRelease(): Promise<boolean> {
        try {
            const response = await this.octokit.forApp.repos.getLatestRelease({
                owner: this.octokit.owner,
                repo: this.octokit.repo,
            });
            const json = JSON.stringify(response.data);
            const br = await brotliCompressAsync(Buffer.from(json));
            this.releaseCache = { json, br };
            return true;
        } catch (err) {
            this.logger.error(`Failed to fetch latest release`, err);
            return false;
        }
    }

    @Get('release')
    @ApiOperation({ summary: '获取最新版本', description: '代理 GitHub API' })
    release(@Req() req: FastifyRequest, @Res() res: FastifyReply): void {
        if (!this.releaseCache) {
            void res
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .send({ error: 'Release information is not available yet. Please try again later.' });
            return;
        }
        const { json, br } = this.releaseCache;
        const acceptEncoding = (req.headers['accept-encoding'] ?? '')
            .toLowerCase()
            .split(',')
            .map((enc) => enc.trim());
        const reply = res
            .status(HttpStatus.OK)
            .header('Cache-Control', 'public, max-age=10, s-maxage=10')
            .header('Content-Type', 'application/json; charset=utf-8')
            .header('Vary', 'Accept-Encoding');
        if (acceptEncoding.includes('br')) {
            void reply.header('Content-Encoding', 'br').send(br);
        } else {
            void reply.send(json);
        }
    }
}
