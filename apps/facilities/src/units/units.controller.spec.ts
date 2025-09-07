import { Test, TestingModule } from '@nestjs/testing';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import {
  CreateUnitRequest,
  GetUnitsRequest,
  UpdateUnitRequest,
  Unit,
  UnitType,
  SurfaceType,
} from '@app/common/facilities/units.dto';
import { PaginationResponse } from '@app/common/dto';
import { GRPC_USERS_CLIENT } from '@app/common/constants';

describe('UnitsController', () => {
  let controller: UnitsController;
  let service: UnitsService;

  const mockUnitsService = {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUsersClient = {
    getService: jest.fn().mockReturnValue({
      ValidateJwt: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitsController],
      providers: [
        {
          provide: UnitsService,
          useValue: mockUnitsService,
        },
        {
          provide: GRPC_USERS_CLIENT,
          useValue: mockUsersClient,
        },
      ],
    }).compile();

    controller = module.get<UnitsController>(UnitsController);
    service = module.get<UnitsService>(UnitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getEstablishments', () => {
    it('should call findMany service method and return units', async () => {
      const request: GetUnitsRequest = {
        pagination: { limit: 10, offset: 0 },
      };

      const expectedResult: PaginationResponse<Unit> = {
        items: [
          {
            id: 1,
            establishment_id: 1,
            name: 'Campo de Fútbol 1',
            type: UnitType.FOOTBALL,
            surface_type: SurfaceType.ARTIFICIAL_GRASS,
            indoor: false,
            capacity: 22,
            active: true,
            created_at: new Date(),
            updated_at: new Date(),
          } as Unit,
        ],
        total: 1,
      };

      mockUnitsService.findMany.mockResolvedValue(expectedResult);

      const result = await controller.getEstablishments(request);

      expect(service.findMany).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty pagination request', async () => {
      const request: GetUnitsRequest = {};
      const expectedResult: PaginationResponse<Unit> = {
        items: [],
        total: 0,
      };

      mockUnitsService.findMany.mockResolvedValue(expectedResult);

      const result = await controller.getEstablishments(request);

      expect(service.findMany).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createEstablishments', () => {
    it('should call create service method and return created unit', async () => {
      const request: CreateUnitRequest = {
        establishment_id: 1,
        name: 'Campo de Paddle 1',
        type: UnitType.PADDLE,
        surface_type: SurfaceType.CLAY,
        indoor: true,
        capacity: 4,
      };

      const expectedResult: Unit = {
        id: 1,
        establishment_id: 1,
        name: 'Campo de Paddle 1',
        type: UnitType.PADDLE,
        surface_type: SurfaceType.CLAY,
        indoor: true,
        capacity: 4,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      } as Unit;

      mockUnitsService.create.mockResolvedValue(expectedResult);

      const result = await controller.createEstablishments(request);

      expect(service.create).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedResult);
    });

    it('should handle creation without optional fields', async () => {
      const request: CreateUnitRequest = {
        establishment_id: 1,
        name: 'Campo Básico',
        type: UnitType.FOOTBALL,
        surface_type: null,
        indoor: false,
        capacity: null,
      };

      const expectedResult: Unit = {
        id: 2,
        ...request,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      } as Unit;

      mockUnitsService.create.mockResolvedValue(expectedResult);

      const result = await controller.createEstablishments(request);

      expect(service.create).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateEstablishment', () => {
    it('should call update service method and return updated unit', async () => {
      const request: UpdateUnitRequest = {
        id: 1,
        model: {
          establishment_id: 1,
          name: 'Campo de Fútbol Actualizado',
          type: UnitType.FOOTBALL,
          surface_type: SurfaceType.NATURAL_GRASS,
          indoor: false,
          capacity: 22,
        },
      };

      const expectedResult: Unit = {
        id: 1,
        establishment_id: 1,
        name: 'Campo de Fútbol Actualizado',
        type: UnitType.FOOTBALL,
        surface_type: SurfaceType.NATURAL_GRASS,
        indoor: false,
        capacity: 22,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      } as Unit;

      mockUnitsService.update.mockResolvedValue(expectedResult);

      const result = await controller.updateEstablishment(request);

      expect(service.update).toHaveBeenCalledWith(request.id, request.model);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteEstablishment', () => {
    it('should call delete service method', async () => {
      const request = { id: 1 };

      mockUnitsService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteEstablishment(request);

      expect(service.delete).toHaveBeenCalledWith(request.id);
      expect(result).toBeUndefined();
    });

    it('should handle deletion of non-existent unit', async () => {
      const request = { id: 999 };

      mockUnitsService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteEstablishment(request);

      expect(service.delete).toHaveBeenCalledWith(request.id);
      expect(result).toBeUndefined();
    });
  });
});
