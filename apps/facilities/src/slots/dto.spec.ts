import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  Slot,
  CreateSlotRequest,
  GetSlotsRequest,
} from '@app/common/facilities/slots.dto';
import { PaginationRequest } from '@app/common/dto';

describe('Slots DTOs', () => {
  describe('Slot', () => {
    it('should create an instance with valid data', () => {
      const data = {
        id: 1,
        unitId: 1,
        dayOfWeek: 1,
        openTime: '08:00',
        closeTime: '22:00',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const slot = Slot.fromObject(data);

      expect(slot.id).toBe(1);
      expect(slot.unitId).toBe(1);
      expect(slot.dayOfWeek).toBe(1);
      expect(slot.openTime).toBe('08:00');
      expect(slot.closeTime).toBe('22:00');
      expect(slot.active).toBe(true);
      expect(slot.createdAt).toBeInstanceOf(Date);
      expect(slot.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle null values correctly', () => {
      const data = {
        id: 1,
        unitId: 1,
        dayOfWeek: 0,
        openTime: '06:00',
        closeTime: '23:59',
        active: true,
        createdAt: null,
        updatedAt: null,
      };

      const slot = Slot.fromObject(data);

      expect(slot.createdAt).toBeNull();
      expect(slot.updatedAt).toBeNull();
    });

    it('should create instance using fromObject static method', () => {
      const data = {
        id: 1,
        unitId: 1,
        dayOfWeek: 1,
        openTime: '08:00',
        closeTime: '22:00',
        active: true,
      };

      const slot = Slot.fromObject(data);

      expect(slot).toBeInstanceOf(Slot);
      expect(slot.id).toBe(1);
      expect(slot.unitId).toBe(1);
    });

    it('should create empty instance and assign properties', () => {
      const slot = new Slot();
      slot.id = 1;
      slot.unitId = 1;
      slot.dayOfWeek = 1;
      slot.openTime = '08:00';
      slot.closeTime = '22:00';
      slot.active = true;

      expect(slot.id).toBe(1);
      expect(slot.unitId).toBe(1);
      expect(slot.dayOfWeek).toBe(1);
      expect(slot.openTime).toBe('08:00');
      expect(slot.closeTime).toBe('22:00');
      expect(slot.active).toBe(true);
    });
  });

  describe('CreateSlotRequest', () => {
    it('should pass validation with valid data', async () => {
      const validData = {
        unitId: 1,
        dayOfWeek: 1,
        openTime: '08:00',
        closeTime: '22:00',
      };

      const request = plainToClass(CreateSlotRequest, validData);
      const errors = await validate(request);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing unitId', async () => {
      const invalidData = {
        dayOfWeek: 1,
        openTime: '08:00',
        closeTime: '22:00',
      };

      const request = plainToClass(CreateSlotRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('unitId');
      expect(errors[0].constraints).toHaveProperty('isDefined');
    });

    it('should fail validation with invalid dayOfWeek', async () => {
      const invalidData = {
        unitId: 1,
        dayOfWeek: 7, // Invalid: should be 0-6
        openTime: '08:00',
        closeTime: '22:00',
      };

      const request = plainToClass(CreateSlotRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('dayOfWeek');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail validation with invalid time format', async () => {
      const invalidData = {
        unitId: 1,
        dayOfWeek: 1,
        openTime: '25:00', // Invalid hour
        closeTime: '22:00',
      };

      const request = plainToClass(CreateSlotRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('openTime');
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should pass validation with edge case times', async () => {
      const validData = {
        unitId: 1,
        dayOfWeek: 0, // Sunday
        openTime: '00:00',
        closeTime: '23:59',
      };

      const request = plainToClass(CreateSlotRequest, validData);
      const errors = await validate(request);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with negative unitId', async () => {
      const invalidData = {
        unitId: -1,
        dayOfWeek: 1,
        openTime: '08:00',
        closeTime: '22:00',
      };

      const request = plainToClass(CreateSlotRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('unitId');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail validation with dayOfWeek below 0', async () => {
      const invalidData = {
        unitId: 1,
        dayOfWeek: -1,
        openTime: '08:00',
        closeTime: '22:00',
      };

      const request = plainToClass(CreateSlotRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('dayOfWeek');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('GetSlotsRequest', () => {
    it('should create instance without any filters', () => {
      const request = new GetSlotsRequest();

      expect(request.pagination).toBeUndefined();
      expect(request.unitId).toBeUndefined();
      expect(request.dayOfWeek).toBeUndefined();
    });

    it('should create instance with pagination', () => {
      const paginationData = {
        limit: 10,
        offset: 0,
      };

      const request = new GetSlotsRequest();
      request.pagination = plainToClass(PaginationRequest, paginationData);

      expect(request.pagination).toBeDefined();
      expect(request.pagination.limit).toBe(10);
      expect(request.pagination.offset).toBe(0);
    });

    it('should create instance with filters', () => {
      const requestData = {
        unitId: 1,
        dayOfWeek: 1,
        pagination: {
          limit: 5,
          offset: 10,
        },
      };

      const request = plainToClass(GetSlotsRequest, requestData);

      expect(request.unitId).toBe(1);
      expect(request.dayOfWeek).toBe(1);
      expect(request.pagination).toBeDefined();
    });

    it('should pass validation with all valid optional fields', async () => {
      const validData = {
        unitId: 1,
        dayOfWeek: 6, // Saturday
        pagination: {
          limit: 20,
          offset: 5,
        },
      };

      const request = plainToClass(GetSlotsRequest, validData);
      const errors = await validate(request);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid pagination values', async () => {
      const invalidData = {
        limit: -1,
        offset: -5,
      };

      const request = plainToClass(GetSlotsRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((error) => error.property === 'limit');
      const offsetError = errors.find((error) => error.property === 'offset');
      expect(limitError).toBeDefined();
      expect(offsetError).toBeDefined();
    });
  });
});
