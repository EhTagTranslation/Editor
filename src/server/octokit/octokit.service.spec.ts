import { Test, TestingModule } from '@nestjs/testing';
import { OctokitService } from './octokit.service';

describe('OctokitService', () => {
  let service: OctokitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OctokitService],
    }).compile();

    service = module.get<OctokitService>(OctokitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
