import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesModule } from './facilities.module';
import { EstablishmentsController } from './establishments/establishments.controller';
import { EstablishmentsService } from './establishments/establishments.service';
import { PrismaService } from '@app/common/prisma';
import { ContextService } from '@app/common/users/context.service';
import { GRPC_USERS_CLIENT } from '@app/common/constants';

describe('FacilitiesModule', () => {
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

  const mockUsersClient = {
    getService: jest.fn().mockReturnValue({
      ValidateJwt: jest.fn(),
    }),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [FacilitiesModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(ContextService)
      .useValue(mockContextService)
      .overrideProvider(GRPC_USERS_CLIENT)
      .useValue(mockUsersClient)
      .compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should import EstablishmentsModule', () => {
    // Verify that EstablishmentsModule components are available
    const controller = module.get<EstablishmentsController>(
      EstablishmentsController,
    );
    const service = module.get<EstablishmentsService>(EstablishmentsService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should provide access to establishments functionality', () => {
    // Test that the module correctly exposes establishments functionality
    expect(() =>
      module.get<EstablishmentsController>(EstablishmentsController),
    ).not.toThrow();
    expect(() =>
      module.get<EstablishmentsService>(EstablishmentsService),
    ).not.toThrow();
  });

  describe('Module structure', () => {
    it('should be properly structured as a feature module', () => {
      // Verify that the module follows NestJS best practices
      expect(FacilitiesModule).toBeDefined();
      expect(typeof FacilitiesModule).toBe('function');
    });

    it('should have correct dependency injection chain', () => {
      const controller = module.get<EstablishmentsController>(
        EstablishmentsController,
      );
      const service = module.get<EstablishmentsService>(EstablishmentsService);

      // Verify dependency injection is working
      expect(controller['establishmentsService']).toBe(service);
      expect(service['prisma']).toBe(mockPrismaService);
      expect(service['context']).toBe(mockContextService);
    });
  });

  describe('Module compilation', () => {
    it('should compile successfully with all dependencies', async () => {
      await expect(
        Test.createTestingModule({
          imports: [FacilitiesModule],
        })
          .overrideProvider(PrismaService)
          .useValue(mockPrismaService)
          .overrideProvider(ContextService)
          .useValue(mockContextService)
          .overrideProvider(GRPC_USERS_CLIENT)
          .useValue(mockUsersClient)
          .compile(),
      ).resolves.toBeDefined();
    });

    it('should fail compilation without required dependencies', async () => {
      // Test that the module fails to compile without required dependencies
      await expect(
        Test.createTestingModule({
          imports: [FacilitiesModule],
        }).compile(),
      ).rejects.toThrow();
    });
  });
});
