import { Test, TestingModule } from '@nestjs/testing';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';
import {
  CreateSlotRequest,
  GetSlotsRequest,
  UpdateSlotRequest,
  Slot,
} from '@app/common/facilities/slots.dto';
import { PaginationResponse } from '@app/common/dto';

describe('SlotsController', () => {
  let controller: SlotsController;
  let service: SlotsService;

  const mockSlotsService = {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlotsController],
      providers: [
        {
          provide: SlotsService,
          useValue: mockSlotsService,
        },
      ],
    })
      .overrideGuard(require('@app/common/users/auth.guard').AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SlotsController>(SlotsController);
    service = module.get<SlotsService>(SlotsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getSlots', () => {
    it('should call findMany service method and return slots', async () => {
      const request: GetSlotsRequest = {
        pagination: { limit: 10, offset: 0 },
      };

      const expectedResult: PaginationResponse<Slot> = {
        items: [
          {
            id: 1,
            unitId: 1,
            dayOfWeek: 1,
            openTime: '08:00',
            closeTime: '22:00',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Slot,
        ],
        total: 1,
      };

      mockSlotsService.findMany.mockResolvedValue(expectedResult);

      const result = await controller.getSlots(request);

      expect(mockSlotsService.findMany).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty pagination request', async () => {
      const request: GetSlotsRequest = {};
      const expectedResult: PaginationResponse<Slot> = {
        items: [],
        total: 0,
      };

      mockSlotsService.findMany.mockResolvedValue(expectedResult);

      const result = await controller.getSlots(request);

      expect(mockSlotsService.findMany).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedResult);
    });

    it('should handle filtered requests', async () => {
      const request: GetSlotsRequest = {
        unitId: 1,
        dayOfWeek: 1,
        pagination: { limit: 5, offset: 0 },
      };

      const expectedResult: PaginationResponse<Slot> = {
        items: [],
        total: 0,
      };

      mockSlotsService.findMany.mockResolvedValue(expectedResult);

      const result = await controller.getSlots(request);

      expect(mockSlotsService.findMany).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createSlot', () => {
    it('should call create service method and return created slot', async () => {
      const request: CreateSlotRequest = {
        unitId: 1,
        dayOfWeek: 1,
        openTime: '08:00',
        closeTime: '22:00',
      };

      const expectedResult: Slot = {
        id: 1,
        unitId: 1,
        dayOfWeek: 1,
        openTime: '08:00',
        closeTime: '22:00',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Slot;

      mockSlotsService.create.mockResolvedValue(expectedResult);

      const result = await controller.createSlot(request);

      expect(mockSlotsService.create).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedResult);
    });

    it('should handle creation without optional fields', async () => {
      const request: CreateSlotRequest = {
        unitId: 2,
        dayOfWeek: 6,
        openTime: '06:00',
        closeTime: '23:59',
      };

      const expectedResult: Slot = {
        id: 2,
        ...request,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Slot;

      mockSlotsService.create.mockResolvedValue(expectedResult);

      const result = await controller.createSlot(request);

      expect(mockSlotsService.create).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateSlot', () => {
    it('should call update service method and return updated slot', async () => {
      const request: UpdateSlotRequest = {
        id: 1,
        model: {
          unitId: 1,
          dayOfWeek: 1,
          openTime: '09:00',
          closeTime: '21:00',
        },
      };

      const expectedResult: Slot = {
        id: 1,
        unitId: 1,
        dayOfWeek: 1,
        openTime: '09:00',
        closeTime: '21:00',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Slot;

      mockSlotsService.update.mockResolvedValue(expectedResult);

      const result = await controller.updateSlot(request);

      expect(mockSlotsService.update).toHaveBeenCalledWith(
        request.id,
        request.model,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteSlot', () => {
    it('should call delete service method', async () => {
      const request = { id: 1 };

      mockSlotsService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteSlot(request);

      expect(mockSlotsService.delete).toHaveBeenCalledWith(request.id);
      expect(result).toBeUndefined();
    });

    it('should handle deletion of non-existent slot', async () => {
      const request = { id: 999 };

      mockSlotsService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteSlot(request);

      expect(mockSlotsService.delete).toHaveBeenCalledWith(request.id);
      expect(result).toBeUndefined();
    });
  });
});
