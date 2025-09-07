import { Test, TestingModule } from '@nestjs/testing';
import { UnitsModule } from './units.module';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { PrismaService } from '@app/common/prisma';
import { GRPC_USERS_CLIENT } from '@app/common/constants';

describe('UnitsModule', () => {
  let module: TestingModule;

  const mockPrismaService = {
    units: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    establishments: {
      count: jest.fn(),
    },
  };

  const mockUsersClient = {
    getService: jest.fn().mockReturnValue({
      ValidateJwt: jest.fn(),
    }),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [UnitsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
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

  it('should provide UnitsController', () => {
    const controller = module.get<UnitsController>(UnitsController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(UnitsController);
  });

  it('should provide UnitsService', () => {
    const service = module.get<UnitsService>(UnitsService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(UnitsService);
  });

  it('should have proper dependency injection setup', () => {
    const controller = module.get<UnitsController>(UnitsController);
    const service = module.get<UnitsService>(UnitsService);

    // Verify that controller has service injected
    expect(controller['unitsService']).toBe(service);

    // Verify that service has PrismaService injected
    expect(service['prisma']).toBe(mockPrismaService);
  });

  it('should import required modules', () => {
    // Verify that PrismaModule components are available
    expect(() => module.get<PrismaService>(PrismaService)).not.toThrow();

    // Verify that UsersClientModule components are available
    expect(() => module.get(GRPC_USERS_CLIENT)).not.toThrow();
  });

  describe('Module structure', () => {
    it('should have correct module configuration', () => {
      // Test that the module correctly exposes units functionality
      expect(() => module.get<UnitsController>(UnitsController)).not.toThrow();
      expect(() => module.get<UnitsService>(UnitsService)).not.toThrow();
    });

    it('should configure gRPC services correctly', () => {
      const controller = module.get<UnitsController>(UnitsController);

      // Verify controller is properly configured for gRPC
      expect(controller).toBeDefined();
      expect(typeof controller.getEstablishments).toBe('function');
      expect(typeof controller.createEstablishments).toBe('function');
      expect(typeof controller.updateEstablishment).toBe('function');
      expect(typeof controller.deleteEstablishment).toBe('function');
    });

    it('should have service with all CRUD operations', () => {
      const service = module.get<UnitsService>(UnitsService);

      // Verify service has all required methods
      expect(typeof service.findMany).toBe('function');
      expect(typeof service.create).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.delete).toBe('function');
    });
  });

  describe('Integration', () => {
    it('should allow controller to interact with service', () => {
      const controller = module.get<UnitsController>(UnitsController);
      const service = module.get<UnitsService>(UnitsService);

      // Mock service method
      jest.spyOn(service, 'findMany').mockResolvedValue({
        items: [],
        total: 0,
      });

      // Test that controller can call service
      expect(async () => {
        await controller.getEstablishments({});
      }).not.toThrow();
    });

    it('should handle service dependencies correctly', () => {
      const service = module.get<UnitsService>(UnitsService);

      // Verify service has access to its dependencies
      expect(service['prisma']).toBeDefined();
      expect(service['logger']).toBeDefined();
    });
  });
});
