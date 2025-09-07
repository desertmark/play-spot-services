import { Test, TestingModule } from '@nestjs/testing';
import { UnitsService } from './units.service';
import { PrismaService } from '@app/common/prisma';
import {
  CreateUnitRequest,
  GetUnitsRequest,
  Unit,
  UnitType,
  SurfaceType,
} from '@app/common/facilities/units.dto';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

describe('UnitsService', () => {
  let service: UnitsService;
  let prismaService: PrismaService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UnitsService>(UnitsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMany', () => {
    it('should return paginated units with default pagination', async () => {
      const request: GetUnitsRequest = {};
      const mockUnits = [
        {
          id: 1,
          establishment_id: 1,
          name: 'Campo 1',
          type: UnitType.FOOTBALL,
          surface_type: SurfaceType.ARTIFICIAL_GRASS,
          indoor: false,
          capacity: 22,
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPrismaService.units.findMany.mockResolvedValue(mockUnits);
      mockPrismaService.units.count.mockResolvedValue(1);

      const result = await service.findMany(request);

      expect(prismaService.units.findMany).toHaveBeenCalledWith({
        take: undefined,
        skip: undefined,
        orderBy: { id: 'asc' },
      });
      expect(prismaService.units.count).toHaveBeenCalled();
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0]).toBeInstanceOf(Unit);
    });

    it('should return paginated units with custom pagination', async () => {
      const request: GetUnitsRequest = {
        pagination: { limit: 5, offset: 10 },
      };
      const mockUnits = [];

      mockPrismaService.units.findMany.mockResolvedValue(mockUnits);
      mockPrismaService.units.count.mockResolvedValue(0);

      const result = await service.findMany(request);

      expect(prismaService.units.findMany).toHaveBeenCalledWith({
        take: 5,
        skip: 10,
        orderBy: { id: 'asc' },
      });
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('create', () => {
    it('should create a new unit successfully', async () => {
      const createRequest: CreateUnitRequest = {
        establishment_id: 1,
        name: 'Nuevo Campo',
        type: UnitType.PADDLE,
        surface_type: SurfaceType.CLAY,
        indoor: true,
        capacity: 4,
      };

      const mockCreatedUnit = {
        id: 1,
        ...createRequest,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.establishments.count.mockResolvedValue(1);
      mockPrismaService.units.create.mockResolvedValue(mockCreatedUnit);

      const result = await service.create(createRequest);

      expect(prismaService.establishments.count).toHaveBeenCalledWith({
        where: { id: createRequest.establishment_id },
      });
      expect(prismaService.units.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...createRequest,
          active: true,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      });
      expect(result).toBeInstanceOf(Unit);
      expect(result.name).toBe(createRequest.name);
    });

    it('should throw RpcException when establishment does not exist', async () => {
      const createRequest: CreateUnitRequest = {
        establishment_id: 999,
        name: 'Campo Inexistente',
        type: UnitType.FOOTBALL,
        surface_type: SurfaceType.NATURAL_GRASS,
        indoor: false,
        capacity: null,
      };

      mockPrismaService.establishments.count.mockResolvedValue(0);

      await expect(service.create(createRequest)).rejects.toThrow(RpcException);

      try {
        await service.create(createRequest);
      } catch (error) {
        expect(error.error.code).toBe(status.NOT_FOUND);
        expect(error.error.message).toContain('Establishment: 999 not found');
      }

      expect(prismaService.units.create).not.toHaveBeenCalled();
    });

    it('should create unit with null optional fields', async () => {
      const createRequest: CreateUnitRequest = {
        establishment_id: 1,
        name: 'Campo Básico',
        type: UnitType.FOOTBALL,
        surface_type: null,
        indoor: false,
        capacity: null,
      };

      const mockCreatedUnit = {
        id: 2,
        ...createRequest,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.establishments.count.mockResolvedValue(1);
      mockPrismaService.units.create.mockResolvedValue(mockCreatedUnit);

      const result = await service.create(createRequest);

      expect(result).toBeInstanceOf(Unit);
      expect(result.surface_type).toBeNull();
      expect(result.capacity).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing unit successfully', async () => {
      const unitId = 1;
      const updateData = {
        name: 'Campo Actualizado',
        type: UnitType.PADDLE,
        capacity: 6,
      };

      const existingUnit = {
        id: unitId,
        establishment_id: 1,
        name: 'Campo Original',
        type: UnitType.FOOTBALL,
        surface_type: SurfaceType.ARTIFICIAL_GRASS,
        indoor: false,
        capacity: 22,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedUnit = {
        ...existingUnit,
        ...updateData,
        updated_at: new Date(),
      };

      mockPrismaService.units.findFirst.mockResolvedValue(existingUnit);
      mockPrismaService.units.update.mockResolvedValue(updatedUnit);

      const result = await service.update(unitId, updateData);

      expect(prismaService.units.findFirst).toHaveBeenCalledWith({
        where: { id: unitId },
      });
      expect(prismaService.units.update).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...updateData,
          updated_at: expect.any(Date),
        }),
        where: { id: unitId },
      });
      expect(result).toBeInstanceOf(Unit);
      expect(result.name).toBe(updateData.name);
    });

    it('should throw RpcException when unit does not exist', async () => {
      const unitId = 999;
      const updateData = { name: 'Campo Inexistente' };

      mockPrismaService.units.findFirst.mockResolvedValue(null);

      await expect(service.update(unitId, updateData)).rejects.toThrow(
        RpcException,
      );

      try {
        await service.update(unitId, updateData);
      } catch (error) {
        expect(error.error.code).toBe(status.NOT_FOUND);
        expect(error.error.message).toContain('Unit: 999 not found');
      }

      expect(prismaService.units.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an existing unit successfully', async () => {
      const unitId = 1;
      const deletedUnit = {
        id: unitId,
        establishment_id: 1,
        name: 'Campo a Eliminar',
        type: UnitType.FOOTBALL,
        surface_type: SurfaceType.ARTIFICIAL_GRASS,
        indoor: false,
        capacity: 22,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.units.delete.mockResolvedValue(deletedUnit);

      const result = await service.delete(unitId);

      expect(prismaService.units.delete).toHaveBeenCalledWith({
        where: { id: unitId },
      });
      expect(result).toEqual(deletedUnit);
    });

    it('should handle deletion of non-existent unit gracefully', async () => {
      const unitId = 999;
      const prismaError = {
        meta: {
          cause: 'No record was found for a delete.',
        },
      };

      mockPrismaService.units.delete.mockRejectedValue(prismaError);

      const result = await service.delete(unitId);

      expect(prismaService.units.delete).toHaveBeenCalledWith({
        where: { id: unitId },
      });
      expect(result).toBeUndefined();
    });

    it('should re-throw unexpected database errors', async () => {
      const unitId = 1;
      const unexpectedError = new Error('Database connection failed');

      mockPrismaService.units.delete.mockRejectedValue(unexpectedError);

      await expect(service.delete(unitId)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
