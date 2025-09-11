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
          unit_id: 1,
          day_of_week: 1,
          open_time: new Date('1900-01-01T08:00:00Z'),
          close_time: new Date('1900-01-01T22:00:00Z'),
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
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

    it('should filter by unit_id when provided', async () => {
      const request: GetSlotsRequest = {
        unit_id: 1,
        pagination: { limit: 10, offset: 0 },
      };

      mockPrismaService.slots.findMany.mockResolvedValue([]);
      mockPrismaService.slots.count.mockResolvedValue(0);

      await service.findMany(request);

      expect(prismaService.slots.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: [{ id: 'asc' }],
        where: { unit_id: 1 },
      });
    });

    it('should filter by day_of_week when provided', async () => {
      const request: GetSlotsRequest = {
        day_of_week: 1,
        pagination: { limit: 10, offset: 0 },
      };

      mockPrismaService.slots.findMany.mockResolvedValue([]);
      mockPrismaService.slots.count.mockResolvedValue(0);

      await service.findMany(request);

      expect(prismaService.slots.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: [{ id: 'asc' }],
        where: { day_of_week: 1 },
      });
    });
  });

  describe('create', () => {
    it('should create a new slot', async () => {
      const createRequest: CreateSlotRequest = {
        unit_id: 1,
        day_of_week: 1,
        open_time: '08:00',
        close_time: '22:00',
      };
      const open_time = new Date(Date.UTC(1900, 0, 1, 8, 0));
      const close_time = new Date(Date.UTC(1900, 0, 1, 22, 0));
      const mockCreatedSlot = {
        id: 1,
        ...createRequest,
        open_time,
        close_time,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
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
          unit_id: 1,
          day_of_week: 1,
          open_time: {
            lt: close_time,
          },
          close_time: {
            gt: open_time,
          },
        },
      });
      expect(prismaService.slots.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...createRequest,
          open_time,
          close_time,
          active: true,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      });
      expect(result).toBeInstanceOf(Slot);
      expect(result).toEqual(expect.objectContaining(createRequest));
    });

    it('should throw RpcException when unit does not exist', async () => {
      const createRequest: CreateSlotRequest = {
        unit_id: 999,
        day_of_week: 1,
        open_time: '08:00',
        close_time: '22:00',
      };

      mockPrismaService.units.count.mockResolvedValue(0);

      await expect(service.create(createRequest)).rejects.toThrow(RpcException);

      expect(prismaService.slots.create).not.toHaveBeenCalled();
    });

    it('should throw RpcException when overlapping slot exists', async () => {
      const createRequest: CreateSlotRequest = {
        unit_id: 1,
        day_of_week: 1,
        open_time: '08:00',
        close_time: '22:00',
      };

      mockPrismaService.units.count.mockResolvedValue(1);
      mockPrismaService.slots.findMany.mockResolvedValue([
        {
          id: 2,
          unit_id: 1,
          day_of_week: 1,
          open_time: new Date(Date.UTC(1900, 0, 1, 21, 0)),
          close_time: new Date(Date.UTC(1900, 0, 1, 23, 0)),
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
      mockPrismaService.slots.findFirst.mockResolvedValue({
        id: 1,
        unit_id: 1,
        day_of_week: 1,
        open_time: new Date(Date.UTC(1900, 0, 1, 9, 0)),
        close_time: new Date(Date.UTC(1900, 0, 1, 21, 0)),
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(service.create(createRequest)).rejects.toThrow(RpcException);

      expect(prismaService.slots.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing slot', async () => {
      const slotId = 1;
      const updateData = {
        open_time: '09:00',
        close_time: '21:00',
      };

      const existingSlot = {
        id: slotId,
        unit_id: 1,
        day_of_week: 1,
        open_time: new Date('1900-01-01T08:00:00Z'),
        close_time: new Date('1900-01-01T22:00:00Z'),
        active: true,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01'),
      };

      const updatedSlot = {
        ...existingSlot,
        ...updateData,
        open_time: new Date(Date.UTC(1900, 0, 1, 9, 0)),
        close_time: new Date(Date.UTC(1900, 0, 1, 21, 0)),
        updated_at: expect.any(Date),
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
      const updateData = { open_time: '09:00' };

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
        unit_id: 1,
        day_of_week: 1,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
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
