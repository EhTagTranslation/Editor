import { Controller, HttpStatus, Get, Req, Res } from '@nestjs/common';
import { InjectableBase } from '../injectable-base.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OctokitService } from './octokit.service.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { brotliCompress } from 'node:zlib';
import { promisify } from 'node:util';

const brotliCompressAsync = promisify(brotliCompress);

@ApiTags('Octokit')
@Controller('octokit')
export class OctokitController extends InjectableBase {
    constructor(private readonly octokit: OctokitService) {
        super();
    }

    private releaseFetchPromise: Promise<{ json: string; br: Buffer }> | null = null;
    private releaseCacheTimer: ReturnType<typeof setTimeout> | null = null;

    private async fetchRelease(): Promise<{ json: string; br: Buffer }> {
        const response = await this.octokit.forApp.repos.getLatestRelease({
            owner: this.octokit.owner,
            repo: this.octokit.repo,
        });
        const json = JSON.stringify(response.data);
        const br = await brotliCompressAsync(Buffer.from(json));
        return { json, br };
    }

    @Get('release')
    @ApiOperation({ summary: '获取最新版本', description: '代理 GitHub API' })
    async release(@Req() req: FastifyRequest, @Res() res: FastifyReply): Promise<void> {
        if (!this.releaseFetchPromise) {
            const promise = this.fetchRelease();
            this.releaseFetchPromise = promise;
            void promise.then(() => {
                if (this.releaseFetchPromise !== promise) return;
                if (this.releaseCacheTimer) clearTimeout(this.releaseCacheTimer);
                this.releaseCacheTimer = setTimeout(() => {
                    if (this.releaseFetchPromise === promise) this.releaseFetchPromise = null;
                    this.releaseCacheTimer = null;
                }, 10_000);
            });
            void promise.catch(() => {
                if (this.releaseFetchPromise === promise) this.releaseFetchPromise = null;
            });
        }

        const { json, br } = await this.releaseFetchPromise;
        const acceptEncoding = req.headers['accept-encoding'] ?? '';
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
