import { Test, TestingModule } from '@nestjs/testing';
import { ExecService } from './exec.service';

describe('ExecService', () => {
    let service: ExecService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ExecService],
        }).compile();

        service = module.get<ExecService>(ExecService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
