import { Test, TestingModule } from '@nestjs/testing';
import { ActusController } from './actus.controller';

describe('ActusController', () => {
  let controller: ActusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActusController],
    }).compile();

    controller = module.get<ActusController>(ActusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
