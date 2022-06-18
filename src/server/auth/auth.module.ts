import { Module } from '@nestjs/common';
import { OctokitModule } from '../octokit/octokit.module.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

@Module({
    imports: [OctokitModule],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
