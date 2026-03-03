import { brotliCompress } from 'node:zlib';
import { promisify } from 'node:util';
import { Controller, HttpStatus, Get, Req, Res } from '@nestjs/common';
import { InjectableBase } from '../injectable-base.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OctokitService } from './octokit.service.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

const brotliCompressAsync = promisify(brotliCompress);

@ApiTags('Octokit')
@Controller('octokit')
export class OctokitController extends InjectableBase {
    constructor(private readonly octokit: OctokitService) {
        super();
        void this.fetchRelease().catch((err: unknown) => this.logger.error(err));
        setInterval(() => {
            void this.fetchRelease().catch((err: unknown) => this.logger.error(err));
        }, 10_000);
    }

    private releaseCache: { json: string; br: Buffer } | null = null;
    private async fetchRelease(): Promise<void> {
        const response = await this.octokit.forApp.repos.getLatestRelease({
            owner: this.octokit.owner,
            repo: this.octokit.repo,
        });
        const json = JSON.stringify(response.data);
        const br = await brotliCompressAsync(Buffer.from(json));
        this.releaseCache = { json, br };
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
