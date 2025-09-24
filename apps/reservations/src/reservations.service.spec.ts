import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '@app/common/prisma';
import { ContextService } from '@app/common/users/context.service';
import { RpcException } from '@nestjs/microservices';
import { ReservationStatus } from '@app/common/reservations';
import { of } from 'rxjs';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prismaService: any;
  let slotsService: any;

  const mockReservation = {
    id: 1,
    userId: 'test-user-id',
    reservationDate: new Date('2023-12-01'),
    status: ReservationStatus.CONFIRMED,
    createdAt: new Date(),
    updatedAt: new Date(),
    reservationSlots: [
      { id: 1, reservationId: 1, slotId: 1 },
      { id: 2, reservationId: 1, slotId: 2 },
    ],
  };

  const mockSlots = {
    items: [
      {
        id: 1,
        unitId: 1,
        dayOfWeek: 5, // Friday
        openTime: '09:00',
        closeTime: '10:00',
      },
      {
        id: 2,
        unitId: 1,
        dayOfWeek: 5, // Friday
        openTime: '10:00',
        closeTime: '11:00',
      },
    ],
  };

  beforeEach(async () => {
    slotsService = {
      GetSlots: jest.fn(),
    };

    const mockPrismaService = {
      reservations: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockContextService = {
      userId: 'test-user-id',
      authHeader: 'Bearer test-token',
    };

    const mockFacilitiesClient = {
      getService: jest.fn().mockReturnValue(slotsService),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ContextService,
          useValue: mockContextService,
        },
        {
          provide: 'GRPC_FACILITIES_CLIENT',
          useValue: mockFacilitiesClient,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prismaService = module.get(PrismaService);
  });

  describe('findMany', () => {
    it('should return paginated reservations', async () => {
      const request = {
        userId: 'test-user-id',
        limit: 10,
        offset: 0,
      };

      prismaService.reservations.findMany.mockResolvedValue([mockReservation]);
      prismaService.reservations.count.mockResolvedValue(1);

      const result = await service.findMany(request);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(prismaService.reservations.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        include: {
          reservationSlots: true,
        },
        where: { userId: 'test-user-id' },
      });
    });

    it('should filter by reservation date', async () => {
      const request = {
        reservationDate: '2023-12-01',
        limit: 10,
        offset: 0,
      };

      prismaService.reservations.findMany.mockResolvedValue([]);
      prismaService.reservations.count.mockResolvedValue(0);

      await service.findMany(request);

      expect(prismaService.reservations.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        include: {
          reservationSlots: true,
        },
        where: { reservationDate: '2023-12-01' },
      });
    });

    it('should filter by status', async () => {
      const request = {
        status: ReservationStatus.CONFIRMED,
        limit: 10,
        offset: 0,
      };

      prismaService.reservations.findMany.mockResolvedValue([]);
      prismaService.reservations.count.mockResolvedValue(0);

      await service.findMany(request);

      expect(prismaService.reservations.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        include: {
          reservationSlots: true,
        },
        where: { status: ReservationStatus.CONFIRMED },
      });
    });
  });

  describe('create', () => {
    const createRequest = {
      reservationDate: new Date('2023-12-01'),
      slotIds: [1, 2],
    };

    beforeEach(() => {
      slotsService.GetSlots.mockReturnValue(of(mockSlots));
    });

    it('should create a reservation successfully', async () => {
      prismaService.reservations.count.mockResolvedValue(0);
      prismaService.reservations.create.mockResolvedValue(mockReservation);

      const result = await service.create(createRequest);

      expect(result).toBeDefined();
      expect(prismaService.reservations.count).toHaveBeenCalledWith({
        where: {
          reservationDate: createRequest.reservationDate,
          status: ReservationStatus.CONFIRMED,
          reservationSlots: {
            some: {
              slotId: { in: createRequest.slotIds },
            },
          },
        },
      });
      expect(prismaService.reservations.create).toHaveBeenCalledWith({
        data: {
          userId: 'test-user-id',
          reservationDate: createRequest.reservationDate,
          status: ReservationStatus.CONFIRMED,
          reservationSlots: {
            create: [{ slotId: 1 }, { slotId: 2 }],
          },
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        include: {
          reservationSlots: true,
        },
      });
    });

    it('should throw error if slots are already booked', async () => {
      prismaService.reservations.count.mockResolvedValue(1);

      await expect(service.create(createRequest)).rejects.toThrow(RpcException);
      expect(prismaService.reservations.create).not.toHaveBeenCalled();
    });

    it('should throw error if slots are from different units', async () => {
      const differentUnitSlots = {
        items: [
          { ...mockSlots.items[0], unitId: 1 },
          { ...mockSlots.items[1], unitId: 2 },
        ],
      };

      slotsService.GetSlots.mockReturnValue(of(differentUnitSlots));
      prismaService.reservations.count.mockResolvedValue(0);

      await expect(service.create(createRequest)).rejects.toThrow(RpcException);
    });

    it('should throw error if slots are from different days', async () => {
      const differentDaySlots = {
        items: [
          { ...mockSlots.items[0], dayOfWeek: 5 },
          { ...mockSlots.items[1], dayOfWeek: 6 },
        ],
      };

      slotsService.GetSlots.mockReturnValue(of(differentDaySlots));
      prismaService.reservations.count.mockResolvedValue(0);

      await expect(service.create(createRequest)).rejects.toThrow(RpcException);
    });

    it('should throw error if slots are not contiguous', async () => {
      const nonContiguousSlots = {
        items: [
          {
            id: 1,
            unitId: 1,
            dayOfWeek: 5,
            openTime: '09:00',
            closeTime: '10:00',
          },
          {
            id: 2,
            unitId: 1,
            dayOfWeek: 5,
            openTime: '11:00', // Gap between 10:00 and 11:00
            closeTime: '12:00',
          },
        ],
      };

      slotsService.GetSlots.mockReturnValue(of(nonContiguousSlots));
      prismaService.reservations.count.mockResolvedValue(0);

      await expect(service.create(createRequest)).rejects.toThrow(RpcException);
    });

    it('should throw error if reservation date does not match slot day', async () => {
      const mondayReservationDate = new Date('2023-12-04'); // Monday
      const fridaySlots = {
        items: [
          {
            id: 1,
            unitId: 1,
            dayOfWeek: 5, // Friday
            openTime: '09:00',
            closeTime: '10:00',
          },
        ],
      };

      slotsService.GetSlots.mockReturnValue(of(fridaySlots));
      prismaService.reservations.count.mockResolvedValue(0);

      const invalidRequest = {
        ...createRequest,
        reservationDate: mondayReservationDate,
        slotIds: [1],
      };

      await expect(service.create(invalidRequest)).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation successfully', async () => {
      const reservationId = 1;
      const cancelledReservation = {
        ...mockReservation,
        status: ReservationStatus.CANCELLED,
      };

      prismaService.reservations.findUnique.mockResolvedValue(mockReservation);
      prismaService.reservations.update.mockResolvedValue(cancelledReservation);

      const result = await service.cancel(reservationId);

      expect(result).toBeDefined();
      expect(prismaService.reservations.findUnique).toHaveBeenCalledWith({
        where: { id: reservationId },
      });
      expect(prismaService.reservations.update).toHaveBeenCalledWith({
        where: { id: reservationId },
        data: {
          status: ReservationStatus.CANCELLED,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should throw error if reservation not found', async () => {
      const reservationId = 999;

      prismaService.reservations.findUnique.mockResolvedValue(null);

      await expect(service.cancel(reservationId)).rejects.toThrow(RpcException);
      expect(prismaService.reservations.update).not.toHaveBeenCalled();
    });
  });
});
