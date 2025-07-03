import { Test, TestingModule } from '@nestjs/testing';
import { ActusService } from './actus.service';

describe('ActusService', () => {
  let service: ActusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActusService],
    }).compile();

    service = module.get<ActusService>(ActusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
