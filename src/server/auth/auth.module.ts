import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OctokitModule } from '../octokit/octokit.module';

@Module({
    imports: [OctokitModule],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
