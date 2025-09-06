import { Test, TestingModule } from '@nestjs/testing';
import { EstablishmentsModule } from './establishments.module';
import { EstablishmentsController } from './establishments.controller';
import { EstablishmentsService } from './establishments.service';
import { PrismaService } from '@app/common/prisma';
import { ContextService } from '@app/common/users/context.service';

describe('EstablishmentsModule', () => {
  let module: TestingModule;

  const mockPrismaService = {
    establishments: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockContextService = {
    userId: 'test-user-123',
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [EstablishmentsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(ContextService)
      .useValue(mockContextService)
      .compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide EstablishmentsController', () => {
    const controller = module.get<EstablishmentsController>(
      EstablishmentsController,
    );
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(EstablishmentsController);
  });

  it('should provide EstablishmentsService', () => {
    const service = module.get<EstablishmentsService>(EstablishmentsService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(EstablishmentsService);
  });

  it('should have proper dependency injection setup', () => {
    const controller = module.get<EstablishmentsController>(
      EstablishmentsController,
    );
    const service = module.get<EstablishmentsService>(EstablishmentsService);

    // Verify that controller has service injected
    expect(controller['establishmentsService']).toBe(service);

    // Verify that service has dependencies injected
    expect(service['prisma']).toBe(mockPrismaService);
    expect(service['context']).toBe(mockContextService);
  });

  it('should export EstablishmentsService', () => {
    // Test that the service can be imported by other modules
    expect(() =>
      module.get<EstablishmentsService>(EstablishmentsService),
    ).not.toThrow();
  });

  describe('Module compilation', () => {
    it('should compile without errors', async () => {
      await expect(
        Test.createTestingModule({
          imports: [EstablishmentsModule],
        })
          .overrideProvider(PrismaService)
          .useValue(mockPrismaService)
          .overrideProvider(ContextService)
          .useValue(mockContextService)
          .compile(),
      ).resolves.toBeDefined();
    });

    it('should handle missing dependencies gracefully', async () => {
      // Test what happens when required dependencies are not provided
      await expect(
        Test.createTestingModule({
          imports: [EstablishmentsModule],
        }).compile(),
      ).rejects.toThrow();
    });
  });
});
