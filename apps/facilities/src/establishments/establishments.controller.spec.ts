import { Test, TestingModule } from '@nestjs/testing';
import { EstablishmentsController } from './establishments.controller';
import { EstablishmentsService } from './establishments.service';
import {
  CreateEstablishmentRequest,
  GetEstablishmentsRequest,
  Establishment,
} from '@app/common/facilities';
import { PaginationResponse } from '@app/common/dto';
import { GRPC_USERS_CLIENT } from '@app/common/constants';

describe('EstablishmentsController', () => {
  let controller: EstablishmentsController;
  let service: EstablishmentsService;

  const mockEstablishmentsService = {
    findMany: jest.fn(),
    create: jest.fn(),
  };

  const mockUsersClient = {
    getService: jest.fn().mockReturnValue({
      ValidateJwt: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstablishmentsController],
      providers: [
        {
          provide: EstablishmentsService,
          useValue: mockEstablishmentsService,
        },
        {
          provide: GRPC_USERS_CLIENT,
          useValue: mockUsersClient,
        },
      ],
    }).compile();

    controller = module.get<EstablishmentsController>(EstablishmentsController);
    service = module.get<EstablishmentsService>(EstablishmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getEstablishments', () => {
    it('should return a paginated list of establishments', async () => {
      const mockRequest: GetEstablishmentsRequest = {
        pagination: { limit: 10, offset: 0 },
      };

      const mockEstablishment = new Establishment();
      Object.assign(mockEstablishment, {
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
      });

      const mockResponse: PaginationResponse<Establishment> = {
        items: [mockEstablishment],
        total: 1,
      };

      mockEstablishmentsService.findMany.mockResolvedValue(mockResponse);

      const result = await controller.getEstablishments(mockRequest);

      expect(service.findMany).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty pagination request', async () => {
      const mockRequest: GetEstablishmentsRequest = {};

      const mockResponse: PaginationResponse<Establishment> = {
        items: [],
        total: 0,
      };

      mockEstablishmentsService.findMany.mockResolvedValue(mockResponse);

      const result = await controller.getEstablishments(mockRequest);

      expect(service.findMany).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createEstablishments', () => {
    it('should create a new establishment', async () => {
      const mockCreateRequest: CreateEstablishmentRequest = {
        name: 'New Establishment',
        description: 'New Description',
        address: '456 New St',
        city: 'New City',
        state: 'New State',
        zip_code: '67890',
        tz: 'America/Los_Angeles',
      };

      const mockCreatedEstablishment = new Establishment();
      Object.assign(mockCreatedEstablishment, {
        id: 2,
        owner_id: 'user-123',
        ...mockCreateRequest,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      mockEstablishmentsService.create.mockResolvedValue(
        mockCreatedEstablishment,
      );

      const result = await controller.createEstablishments(mockCreateRequest);

      expect(service.create).toHaveBeenCalledWith(mockCreateRequest);
      expect(result).toEqual(mockCreatedEstablishment);
    });

    it('should handle service errors during creation', async () => {
      const mockCreateRequest: CreateEstablishmentRequest = {
        name: 'New Establishment',
        description: 'New Description',
        address: '456 New St',
        city: 'New City',
        state: 'New State',
        zip_code: '67890',
        tz: 'America/Los_Angeles',
      };

      const error = new Error('Database error');
      mockEstablishmentsService.create.mockRejectedValue(error);

      await expect(
        controller.createEstablishments(mockCreateRequest),
      ).rejects.toThrow(error);
      expect(service.create).toHaveBeenCalledWith(mockCreateRequest);
    });
  });
});
