import { Module } from '@nestjs/common';
import { ExecService } from './exec.service';

@Module({
    providers: [ExecService],
    exports: [ExecService],
})
export class ExecModule {}
