import { Test, TestingModule } from '@nestjs/testing';
import { EstablishmentsService } from './establishments.service';
import { PrismaService } from '@app/common/prisma';
import { ContextService } from '@app/common/users/context.service';
import { Logger } from '@nestjs/common';
import {
  Establishment,
  GetEstablishmentsRequest,
} from '@app/common/facilities';
import { PaginationResponse } from '@app/common/dto';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

describe('EstablishmentsService', () => {
  let service: EstablishmentsService;
  let prismaService: PrismaService;
  let contextService: ContextService;

  const mockPrismaService = {
    establishments: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockContextService = {
    userId: 'user-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstablishmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ContextService,
          useValue: mockContextService,
        },
      ],
    }).compile();

    service = module.get<EstablishmentsService>(EstablishmentsService);
    prismaService = module.get<PrismaService>(PrismaService);
    contextService = module.get<ContextService>(ContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMany', () => {
    it('should return paginated establishments', async () => {
      const mockDbEstablishments = [
        {
          id: 1,
          owner_id: 'user-123',
          name: 'Test Establishment',
          description: 'Test Description',
          address: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zip_code: '12345',
          tz: 'America/New_York',
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const request: GetEstablishmentsRequest = {
        pagination: { limit: 10, offset: 0 },
      };

      mockPrismaService.establishments.findMany.mockResolvedValue(
        mockDbEstablishments,
      );
      mockPrismaService.establishments.count.mockResolvedValue(1);

      const result = await service.findMany(request);

      expect(prismaService.establishments.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: { id: 'asc' },
      });
      expect(prismaService.establishments.count).toHaveBeenCalled();
      expect(result).toEqual({
        items: expect.any(Array),
        total: 1,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toBeInstanceOf(Establishment);
    });

    it('should handle request without pagination', async () => {
      const mockDbEstablishments = [];
      const request: GetEstablishmentsRequest = {};

      mockPrismaService.establishments.findMany.mockResolvedValue(
        mockDbEstablishments,
      );
      mockPrismaService.establishments.count.mockResolvedValue(0);

      const result = await service.findMany(request);

      expect(prismaService.establishments.findMany).toHaveBeenCalledWith({
        take: undefined,
        skip: undefined,
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual({
        items: [],
        total: 0,
      });
    });

    it('should handle database errors', async () => {
      const request: GetEstablishmentsRequest = {
        pagination: { limit: 10, offset: 0 },
      };

      const error = new Error('Database connection failed');
      mockPrismaService.establishments.findMany.mockRejectedValue(error);

      await expect(service.findMany(request)).rejects.toThrow(error);
    });
  });

  describe('create', () => {
    it('should create a new establishment with default values', async () => {
      const establishmentData: Partial<Establishment> = {
        name: 'New Establishment',
        description: 'New Description',
        address: '456 New St',
        city: 'New City',
        state: 'New State',
        zip_code: '67890',
        tz: 'America/Los_Angeles',
      };

      const mockCreatedEstablishment = {
        id: 1,
        ...establishmentData,
        owner_id: 'user-123',
        active: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      };

      mockPrismaService.establishments.create.mockResolvedValue(
        mockCreatedEstablishment,
      );

      const result = await service.create(establishmentData);

      expect(prismaService.establishments.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...establishmentData,
          owner_id: 'user-123',
          active: true,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      });
      expect(result).toEqual(mockCreatedEstablishment);
    });

    it('should set owner_id from context service', async () => {
      const establishmentData: Partial<Establishment> = {
        name: 'Test Establishment',
      };

      const mockCreatedEstablishment = {
        id: 1,
        ...establishmentData,
        owner_id: 'user-123',
        active: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      };

      mockPrismaService.establishments.create.mockResolvedValue(
        mockCreatedEstablishment,
      );

      await service.create(establishmentData);

      expect(prismaService.establishments.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          owner_id: 'user-123',
        }),
      });
    });

    it('should set active to true by default', async () => {
      const establishmentData: Partial<Establishment> = {
        name: 'Test Establishment',
        active: false, // This should be overridden
      };

      const mockCreatedEstablishment = {
        id: 1,
        ...establishmentData,
        owner_id: 'user-123',
        active: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      };

      mockPrismaService.establishments.create.mockResolvedValue(
        mockCreatedEstablishment,
      );

      await service.create(establishmentData);

      expect(prismaService.establishments.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          active: true,
        }),
      });
    });

    it('should handle database errors during creation', async () => {
      const establishmentData: Partial<Establishment> = {
        name: 'Test Establishment',
      };

      const error = new Error('Database constraint violation');
      mockPrismaService.establishments.create.mockRejectedValue(error);

      await expect(service.create(establishmentData)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update an existing establishment', async () => {
      const establishmentId = 1;
      const updateData: Partial<Establishment> = {
        name: 'Updated Establishment',
        description: 'Updated Description',
      };

      const existingEstablishment = {
        id: establishmentId,
        owner_id: 'user-123',
        name: 'Original Establishment',
        description: 'Original Description',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip_code: '12345',
        tz: 'America/New_York',
        active: true,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01'),
      };

      const updatedEstablishment = {
        ...existingEstablishment,
        ...updateData,
        updated_at: expect.any(Date),
      };

      mockPrismaService.establishments.findFirst.mockResolvedValue(
        existingEstablishment,
      );
      mockPrismaService.establishments.update.mockResolvedValue(
        updatedEstablishment,
      );

      const result = await service.update(establishmentId, updateData);

      expect(prismaService.establishments.findFirst).toHaveBeenCalledWith({
        where: { id: establishmentId },
      });
      expect(prismaService.establishments.update).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...existingEstablishment,
          ...updateData,
          updated_at: expect.any(Date),
        }),
        where: { id: establishmentId },
      });
      expect(result).toBeInstanceOf(Establishment);
    });

    it('should throw RpcException when establishment not found', async () => {
      const establishmentId = 999;
      const updateData: Partial<Establishment> = {
        name: 'Updated Establishment',
      };

      mockPrismaService.establishments.findFirst.mockResolvedValue(null);

      await expect(service.update(establishmentId, updateData)).rejects.toThrow(
        new RpcException({
          code: status.NOT_FOUND,
          message: `Establishment: ${establishmentId} not found`,
        }),
      );

      expect(prismaService.establishments.findFirst).toHaveBeenCalledWith({
        where: { id: establishmentId },
      });
      expect(prismaService.establishments.update).not.toHaveBeenCalled();
    });

    it('should update the updated_at timestamp', async () => {
      const establishmentId = 1;
      const updateData: Partial<Establishment> = {
        name: 'Updated Establishment',
      };

      const existingEstablishment = {
        id: establishmentId,
        owner_id: 'user-123',
        name: 'Original Establishment',
        description: 'Original Description',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip_code: '12345',
        tz: 'America/New_York',
        active: true,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01'),
      };

      const updatedEstablishment = {
        ...existingEstablishment,
        ...updateData,
        updated_at: new Date(),
      };

      mockPrismaService.establishments.findFirst.mockResolvedValue(
        existingEstablishment,
      );
      mockPrismaService.establishments.update.mockResolvedValue(
        updatedEstablishment,
      );

      const now = new Date('2023-12-01T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => now as any);

      await service.update(establishmentId, updateData);

      expect(prismaService.establishments.update).toHaveBeenCalledWith({
        data: expect.objectContaining({
          updated_at: now,
        }),
        where: { id: establishmentId },
      });

      // Limpiar el mock después del test
      (global.Date as any).mockRestore();
    });

    it('should handle database errors during update', async () => {
      const establishmentId = 1;
      const updateData: Partial<Establishment> = {
        name: 'Updated Establishment',
      };

      const existingEstablishment = {
        id: establishmentId,
        owner_id: 'user-123',
        name: 'Original Establishment',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.establishments.findFirst.mockResolvedValue(
        existingEstablishment,
      );
      const error = new Error('Database update failed');
      mockPrismaService.establishments.update.mockRejectedValue(error);

      await expect(service.update(establishmentId, updateData)).rejects.toThrow(
        error,
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing establishment', async () => {
      const establishmentId = 1;
      const deletedEstablishment = {
        id: establishmentId,
        owner_id: 'user-123',
        name: 'Test Establishment',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.establishments.delete.mockResolvedValue(
        deletedEstablishment,
      );

      const result = await service.delete(establishmentId);

      expect(prismaService.establishments.delete).toHaveBeenCalledWith({
        where: { id: establishmentId },
      });
      expect(result).toEqual(deletedEstablishment);
    });

    it('should return undefined when establishment not found for deletion', async () => {
      const establishmentId = 999;
      const error = {
        meta: {
          cause: 'No record was found for a delete.',
        },
      };

      mockPrismaService.establishments.delete.mockRejectedValue(error);

      const result = await service.delete(establishmentId);

      expect(prismaService.establishments.delete).toHaveBeenCalledWith({
        where: { id: establishmentId },
      });
      expect(result).toBeUndefined();
    });

    it('should throw error for other database errors during deletion', async () => {
      const establishmentId = 1;
      const error: any = new Error('Database connection failed');
      error.meta = {
        cause: 'Database connection failed',
      };

      mockPrismaService.establishments.delete.mockRejectedValue(error);

      await expect(service.delete(establishmentId)).rejects.toThrow(error);

      expect(prismaService.establishments.delete).toHaveBeenCalledWith({
        where: { id: establishmentId },
      });
    });

    it('should handle errors without meta property', async () => {
      const establishmentId = 1;
      const error = new Error('Generic database error');

      mockPrismaService.establishments.delete.mockRejectedValue(error);

      await expect(service.delete(establishmentId)).rejects.toThrow(error);
    });
  });
});
