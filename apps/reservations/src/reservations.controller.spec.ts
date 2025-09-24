import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '@app/common/prisma';
import { ContextService } from '@app/common/users/context.service';
import { ClientGrpc } from '@nestjs/microservices';

describe('ReservationsController', () => {
  let reservationsController: ReservationsController;

  const mockPrismaService = {
    reservations: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockContextService = {
    userId: 'test-user-id',
    authHeader: 'Bearer test-token',
  };

  const mockClientGrpc = {
    getService: jest.fn().mockReturnValue({
      GetSlots: jest.fn(),
    }),
  };

  const mockUsersClientGrpc = {
    getService: jest.fn().mockReturnValue({
      ValidateToken: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
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
          useValue: mockClientGrpc,
        },
        {
          provide: 'GRPC_USERS_CLIENT',
          useValue: mockUsersClientGrpc,
        },
      ],
    }).compile();

    reservationsController = app.get<ReservationsController>(
      ReservationsController,
    );
  });

  describe('createReservation', () => {
    it('should create a reservation', async () => {
      const createRequest = {
        slotIds: [1, 2],
        reservationDate: '2023-12-01',
        userId: 'test-user-id',
      };

      const mockReservation = {
        id: 1,
        ...createRequest,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(reservationsController['reservationsService'], 'create')
        .mockResolvedValue(mockReservation);

      const result =
        await reservationsController.createReservation(createRequest);

      expect(result).toEqual(mockReservation);
    });
  });

  describe('deleteReservation', () => {
    it('should delete a reservation', async () => {
      const deleteRequest = { id: 1 };

      jest
        .spyOn(reservationsController['reservationsService'], 'cancel')
        .mockResolvedValue(undefined);

      const result =
        await reservationsController.deleteReservation(deleteRequest);

      expect(result).toBeUndefined();
    });
  });
});
