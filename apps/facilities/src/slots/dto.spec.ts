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
        unit_id: 1,
        day_of_week: 1,
        open_time: '08:00',
        close_time: '22:00',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const slot = Slot.fromObject(data);

      expect(slot.id).toBe(1);
      expect(slot.unit_id).toBe(1);
      expect(slot.day_of_week).toBe(1);
      expect(slot.open_time).toBe('08:00');
      expect(slot.close_time).toBe('22:00');
      expect(slot.active).toBe(true);
      expect(slot.created_at).toBeInstanceOf(Date);
      expect(slot.updated_at).toBeInstanceOf(Date);
    });

    it('should handle null values correctly', () => {
      const data = {
        id: 1,
        unit_id: 1,
        day_of_week: 0,
        open_time: '06:00',
        close_time: '23:59',
        active: true,
        created_at: null,
        updated_at: null,
      };

      const slot = Slot.fromObject(data);

      expect(slot.created_at).toBeNull();
      expect(slot.updated_at).toBeNull();
    });

    it('should create instance using fromObject static method', () => {
      const data = {
        id: 1,
        unit_id: 1,
        day_of_week: 1,
        open_time: '08:00',
        close_time: '22:00',
        active: true,
      };

      const slot = Slot.fromObject(data);

      expect(slot).toBeInstanceOf(Slot);
      expect(slot.id).toBe(1);
      expect(slot.unit_id).toBe(1);
    });

    it('should create empty instance and assign properties', () => {
      const slot = new Slot();
      slot.id = 1;
      slot.unit_id = 1;
      slot.day_of_week = 1;
      slot.open_time = '08:00';
      slot.close_time = '22:00';
      slot.active = true;

      expect(slot.id).toBe(1);
      expect(slot.unit_id).toBe(1);
      expect(slot.day_of_week).toBe(1);
      expect(slot.open_time).toBe('08:00');
      expect(slot.close_time).toBe('22:00');
      expect(slot.active).toBe(true);
    });
  });

  describe('CreateSlotRequest', () => {
    it('should pass validation with valid data', async () => {
      const validData = {
        unit_id: 1,
        day_of_week: 1,
        open_time: '08:00',
        close_time: '22:00',
      };

      const request = plainToClass(CreateSlotRequest, validData);
      const errors = await validate(request);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing unit_id', async () => {
      const invalidData = {
        day_of_week: 1,
        open_time: '08:00',
        close_time: '22:00',
      };

      const request = plainToClass(CreateSlotRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('unit_id');
      expect(errors[0].constraints).toHaveProperty('isDefined');
    });

    it('should fail validation with invalid day_of_week', async () => {
      const invalidData = {
        unit_id: 1,
        day_of_week: 7, // Invalid: should be 0-6
        open_time: '08:00',
        close_time: '22:00',
      };

      const request = plainToClass(CreateSlotRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('day_of_week');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail validation with invalid time format', async () => {
      const invalidData = {
        unit_id: 1,
        day_of_week: 1,
        open_time: '25:00', // Invalid hour
        close_time: '22:00',
      };

      const request = plainToClass(CreateSlotRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('open_time');
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should pass validation with edge case times', async () => {
      const validData = {
        unit_id: 1,
        day_of_week: 0, // Sunday
        open_time: '00:00',
        close_time: '23:59',
      };

      const request = plainToClass(CreateSlotRequest, validData);
      const errors = await validate(request);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with negative unit_id', async () => {
      const invalidData = {
        unit_id: -1,
        day_of_week: 1,
        open_time: '08:00',
        close_time: '22:00',
      };

      const request = plainToClass(CreateSlotRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('unit_id');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail validation with day_of_week below 0', async () => {
      const invalidData = {
        unit_id: 1,
        day_of_week: -1,
        open_time: '08:00',
        close_time: '22:00',
      };

      const request = plainToClass(CreateSlotRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('day_of_week');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('GetSlotsRequest', () => {
    it('should create instance without any filters', () => {
      const request = new GetSlotsRequest();

      expect(request.pagination).toBeUndefined();
      expect(request.unit_id).toBeUndefined();
      expect(request.day_of_week).toBeUndefined();
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
        unit_id: 1,
        day_of_week: 1,
        pagination: {
          limit: 5,
          offset: 10,
        },
      };

      const request = plainToClass(GetSlotsRequest, requestData);

      expect(request.unit_id).toBe(1);
      expect(request.day_of_week).toBe(1);
      expect(request.pagination).toBeDefined();
    });

    it('should pass validation with all valid optional fields', async () => {
      const validData = {
        unit_id: 1,
        day_of_week: 6, // Saturday
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
        pagination: {
          limit: -1,
          offset: -5,
        },
      };

      const request = plainToClass(GetSlotsRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      const paginationError = errors.find(
        (error) => error.property === 'pagination',
      );
      expect(paginationError).toBeDefined();
    });
  });
});
