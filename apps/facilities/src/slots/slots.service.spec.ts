import { Test, TestingModule } from '@nestjs/testing';
import { SlotsService } from './slots.service';
import { PrismaService } from '@app/common/prisma';
import {
  CreateSlotRequest,
  GetSlotsRequest,
  Slot,
} from '@app/common/facilities/slots.dto';
import { RpcException } from '@nestjs/microservices';
import { ContextService } from '@app/common/users/context.service';

describe('SlotsService', () => {
  let service: SlotsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    slots: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    units: {
      count: jest.fn(),
    },
  };

  const mockContextService = {
    userId: 'user-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotsService,
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

    service = module.get<SlotsService>(SlotsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMany', () => {
    it('should return paginated slots', async () => {
      const mockDbSlots = [
        {
          id: 1,
          unitId: 1,
          dayOfWeek: 1,
          openTime: new Date('1900-01-01T08:00:00Z'),
          closeTime: new Date('1900-01-01T22:00:00Z'),
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const request: GetSlotsRequest = {
        pagination: { limit: 10, offset: 0 },
      };

      mockPrismaService.slots.findMany.mockResolvedValue(mockDbSlots);
      mockPrismaService.slots.count.mockResolvedValue(1);

      const result = await service.findMany(request);

      expect(prismaService.slots.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: [{ id: 'asc' }],
        where: {},
      });
      expect(prismaService.slots.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        items: expect.any(Array),
        total: 1,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toBeInstanceOf(Slot);
    });

    it('should filter by unitId when provided', async () => {
      const request: GetSlotsRequest = {
        unitId: 1,
        pagination: { limit: 10, offset: 0 },
      };

      mockPrismaService.slots.findMany.mockResolvedValue([]);
      mockPrismaService.slots.count.mockResolvedValue(0);

      await service.findMany(request);

      expect(prismaService.slots.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: [{ id: 'asc' }],
        where: { unitId: 1 },
      });
    });

    it('should filter by dayOfWeek when provided', async () => {
      const request: GetSlotsRequest = {
        dayOfWeek: 1,
        pagination: { limit: 10, offset: 0 },
      };

      mockPrismaService.slots.findMany.mockResolvedValue([]);
      mockPrismaService.slots.count.mockResolvedValue(0);

      await service.findMany(request);

      expect(prismaService.slots.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: [{ id: 'asc' }],
        where: { dayOfWeek: 1 },
      });
    });
  });

  describe('create', () => {
    it('should create a new slot', async () => {
      const createRequest: CreateSlotRequest = {
        unitId: 1,
        dayOfWeek: 1,
        openTime: '08:00',
        closeTime: '22:00',
      };
      const openTime = new Date(Date.UTC(1900, 0, 1, 8, 0));
      const closeTime = new Date(Date.UTC(1900, 0, 1, 22, 0));
      const mockCreatedSlot = {
        id: 1,
        ...createRequest,
        openTime,
        closeTime,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.units.count.mockResolvedValue(1);
      mockPrismaService.slots.findMany.mockResolvedValue([]);
      mockPrismaService.slots.create.mockResolvedValue(mockCreatedSlot);

      const result = await service.create(createRequest);

      expect(prismaService.units.count).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.slots.findMany).toHaveBeenCalledWith({
        where: {
          unitId: 1,
          dayOfWeek: 1,
          openTime: {
            lt: closeTime,
          },
          closeTime: {
            gt: openTime,
          },
        },
      });
      expect(prismaService.slots.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...createRequest,
          openTime,
          closeTime,
          active: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      });
      expect(result).toBeInstanceOf(Slot);
      expect(result.unitId).toBe(createRequest.unitId);
      expect(result.dayOfWeek).toBe(createRequest.dayOfWeek);
      expect(result.openTime).toBe(createRequest.openTime);
      expect(result.closeTime).toBe(createRequest.closeTime);
    });

    it('should throw RpcException when unit does not exist', async () => {
      const createRequest: CreateSlotRequest = {
        unitId: 999,
        dayOfWeek: 1,
        openTime: '08:00',
        closeTime: '22:00',
      };

      mockPrismaService.units.count.mockResolvedValue(0);

      await expect(service.create(createRequest)).rejects.toThrow(RpcException);

      expect(prismaService.slots.create).not.toHaveBeenCalled();
    });

    it('should throw RpcException when overlapping slot exists', async () => {
      const createRequest: CreateSlotRequest = {
        unitId: 1,
        dayOfWeek: 1,
        openTime: '08:00',
        closeTime: '22:00',
      };

      mockPrismaService.units.count.mockResolvedValue(1);
      mockPrismaService.slots.findMany.mockResolvedValue([
        {
          id: 2,
          unitId: 1,
          dayOfWeek: 1,
          openTime: new Date(Date.UTC(1900, 0, 1, 21, 0)),
          closeTime: new Date(Date.UTC(1900, 0, 1, 23, 0)),
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      mockPrismaService.slots.findFirst.mockResolvedValue({
        id: 1,
        unitId: 1,
        dayOfWeek: 1,
        openTime: new Date(Date.UTC(1900, 0, 1, 9, 0)),
        closeTime: new Date(Date.UTC(1900, 0, 1, 21, 0)),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.create(createRequest)).rejects.toThrow(RpcException);

      expect(prismaService.slots.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing slot', async () => {
      const slotId = 1;
      const updateData = {
        openTime: '09:00',
        closeTime: '21:00',
      };

      const existingSlot = {
        id: slotId,
        unitId: 1,
        dayOfWeek: 1,
        openTime: new Date('1900-01-01T08:00:00Z'),
        closeTime: new Date('1900-01-01T22:00:00Z'),
        active: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      const updatedSlot = {
        ...existingSlot,
        ...updateData,
        openTime: new Date(Date.UTC(1900, 0, 1, 9, 0)),
        closeTime: new Date(Date.UTC(1900, 0, 1, 21, 0)),
        updatedAt: expect.any(Date),
      };
      mockPrismaService.slots.findFirst.mockResolvedValue(existingSlot);
      mockPrismaService.slots.findMany.mockResolvedValue([]);
      mockPrismaService.slots.update.mockResolvedValue(updatedSlot);

      const result = await service.update(slotId, updateData);

      expect(prismaService.slots.findFirst).toHaveBeenCalledWith({
        where: { id: slotId },
      });
      expect(prismaService.slots.update).toHaveBeenCalledWith({
        data: expect.objectContaining(updatedSlot),
        where: { id: slotId },
      });
      expect(result).toBeInstanceOf(Slot);
    });

    it('should throw RpcException when slot does not exist', async () => {
      const slotId = 999;
      const updateData = { openTime: '09:00' };

      mockPrismaService.slots.findFirst.mockResolvedValue(null);

      await expect(service.update(slotId, updateData)).rejects.toThrow(
        RpcException,
      );

      expect(prismaService.slots.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an existing slot', async () => {
      const slotId = 1;
      const deletedSlot = {
        id: slotId,
        unitId: 1,
        dayOfWeek: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.slots.delete.mockResolvedValue(deletedSlot);

      const result = await service.delete(slotId);

      expect(prismaService.slots.delete).toHaveBeenCalledWith({
        where: { id: slotId },
      });
      expect(result).toEqual(deletedSlot);
    });

    it('should handle deletion of non-existent slot gracefully', async () => {
      const slotId = 999;
      const error = new Error('Database delete failed');
      error.meta = { cause: 'No record was found for a delete.' };

      mockPrismaService.slots.delete.mockRejectedValue(error);

      const result = await service.delete(slotId);

      expect(result).toBeUndefined();
    });
  });
});
