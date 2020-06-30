import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseBadgeController } from './database-badge.controller';

describe('DatabaseBadge Controller', () => {
    let controller: DatabaseBadgeController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DatabaseBadgeController],
        }).compile();

        controller = module.get<DatabaseBadgeController>(DatabaseBadgeController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
