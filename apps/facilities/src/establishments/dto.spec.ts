import { validate } from 'class-validator';
import { classToPlain, instanceToPlain, plainToClass } from 'class-transformer';
import {
  Establishment,
  CreateEstablishmentRequest,
  GetEstablishmentsRequest,
} from '@app/common/facilities';
import { PaginationRequest } from '@app/common/dto';

describe('Facilities DTOs', () => {
  describe('Establishment', () => {
    it('should create an instance with valid data', () => {
      const data = {
        id: 1,
        ownerId: 'user-123',
        name: 'Test Establishment',
        description: 'Test Description',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        tz: 'America/New_York',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const establishment = Establishment.fromObject(data);

      expect(establishment.id).toBe(1);
      expect(establishment.ownerId).toBe('user-123');
      expect(establishment.name).toBe('Test Establishment');
      expect(establishment.description).toBe('Test Description');
      expect(establishment.address).toBe('123 Test St');
      expect(establishment.city).toBe('Test City');
      expect(establishment.state).toBe('Test State');
      expect(establishment.zipCode).toBe('12345');
      expect(establishment.tz).toBe('America/New_York');
      expect(establishment.active).toBe(true);
      expect(establishment.createdAt).toBeInstanceOf(Date);
      expect(establishment.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle null values correctly', () => {
      const data = {
        id: 1,
        ownerId: 'user-123',
        name: 'Test Establishment',
        description: null,
        address: null,
        city: null,
        state: null,
        zipCode: null,
        tz: 'America/New_York',
        active: true,
        createdAt: null,
        updatedAt: null,
      };

      const establishment = Establishment.fromObject(data);

      expect(establishment.description).toBeNull();
      expect(establishment.address).toBeNull();
      expect(establishment.city).toBeNull();
      expect(establishment.state).toBeNull();
      expect(establishment.zipCode).toBeNull();
      expect(establishment.createdAt).toBeNull();
      expect(establishment.updatedAt).toBeNull();
    });

    it('should create instance using fromObject static method', () => {
      const data = {
        id: 1,
        ownerId: 'user-123',
        name: 'Test Establishment',
        tz: 'America/New_York',
        active: true,
      };

      const establishment = Establishment.fromObject(data);

      expect(establishment).toBeInstanceOf(Establishment);
      expect(establishment.id).toBe(1);
      expect(establishment.name).toBe('Test Establishment');
    });

    it('should create empty instance and assign properties', () => {
      const establishment = new Establishment();
      establishment.id = 1;
      establishment.name = 'Test Establishment';
      establishment.ownerId = 'user-123';
      establishment.active = true;

      expect(establishment.id).toBe(1);
      expect(establishment.name).toBe('Test Establishment');
      expect(establishment.ownerId).toBe('user-123');
      expect(establishment.active).toBe(true);
    });
  });

  describe('CreateEstablishmentRequest', () => {
    it('Should serialize dates as ISO', () => {
      const establishment = new Establishment();
      Object.assign<Establishment, Establishment>(establishment, {
        id: 1,
        ownerId: 'user-123',
        name: 'Test Establishment',
        description: 'Test Description',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        tz: 'America/New_York',
        active: true,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-02T12:00:00Z'),
      });
      const serialized = instanceToPlain(establishment);
      expect(serialized.createdAt).toBe('2023-01-01T12:00:00.000Z');
      expect(serialized.updatedAt).toBe('2023-01-02T12:00:00.000Z');
    });
    it('should pass validation with valid data', async () => {
      const validData = {
        name: 'Valid Establishment Name',
        description: 'Valid description with enough characters',
        address: 'Valid address with enough characters',
        city: 'Valid City Name',
        state: 'Valid State Name',
        zipCode: 'Valid Zip Code',
        tz: 'America/New_York',
      };

      const request = plainToClass(CreateEstablishmentRequest, validData);
      const errors = await validate(request);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with short name', async () => {
      const invalidData = {
        name: 'AB', // Too short (less than 3 characters)
        description: 'Valid description with enough characters',
        address: 'Valid address with enough characters',
        city: 'Valid City Name',
        state: 'Valid State Name',
        zipCode: 'Valid Zip Code',
        tz: 'America/New_York',
      };

      const request = plainToClass(CreateEstablishmentRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail validation with short description', async () => {
      const invalidData = {
        name: 'Valid Establishment Name',
        description: 'AB', // Too short
        address: 'Valid address with enough characters',
        city: 'Valid City Name',
        state: 'Valid State Name',
        zipCode: 'Valid Zip Code',
        tz: 'America/New_York',
      };

      const request = plainToClass(CreateEstablishmentRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail validation with invalid timezone', async () => {
      const invalidData = {
        name: 'Valid Establishment Name',
        description: 'Valid description with enough characters',
        address: 'Valid address with enough characters',
        city: 'Valid City Name',
        state: 'Valid State Name',
        zipCode: 'Valid Zip Code',
        tz: 'Invalid/Timezone',
      };

      const request = plainToClass(CreateEstablishmentRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('tz');
      expect(errors[0].constraints).toHaveProperty('isTimeZone');
    });

    it('should fail validation with multiple short fields', async () => {
      const invalidData = {
        name: 'AB', // Too short
        description: 'CD', // Too short
        address: 'EF', // Too short
        city: 'GH', // Too short
        state: 'IJ', // Too short
        zipCode: 'KL', // Too short
        tz: 'America/New_York',
      };

      const request = plainToClass(CreateEstablishmentRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBe(6); // All fields except tz should fail
      const failedFields = errors.map((error) => error.property);
      expect(failedFields).toContain('name');
      expect(failedFields).toContain('description');
      expect(failedFields).toContain('address');
      expect(failedFields).toContain('city');
      expect(failedFields).toContain('state');
      expect(failedFields).toContain('zipCode');
    });

    it('should pass validation with valid timezones', async () => {
      const validTimezones = [
        'America/New_York',
        'America/Los_Angeles',
        'America/Chicago',
        'Europe/London',
        'Asia/Tokyo',
        'UTC',
      ];

      for (const tz of validTimezones) {
        const validData = {
          name: 'Valid Establishment Name',
          description: 'Valid description with enough characters',
          address: 'Valid address with enough characters',
          city: 'Valid City Name',
          state: 'Valid State Name',
          zipCode: 'Valid Zip Code',
          tz,
        };

        const request = plainToClass(CreateEstablishmentRequest, validData);
        const errors = await validate(request);

        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('GetEstablishmentsRequest', () => {
    it('should create instance without pagination', () => {
      const request = new GetEstablishmentsRequest();

      expect(request.pagination).toBeUndefined();
    });

    it('should create instance with pagination', () => {
      const paginationData = {
        limit: 10,
        offset: 0,
      };

      const request = new GetEstablishmentsRequest();
      request.pagination = plainToClass(PaginationRequest, paginationData);

      expect(request.pagination).toBeDefined();
      expect(request.pagination.limit).toBe(10);
      expect(request.pagination.offset).toBe(0);
    });

    it('should pass validation with valid pagination', async () => {
      const validData = {
        pagination: {
          limit: 20,
          offset: 5,
        },
      };

      const request = plainToClass(GetEstablishmentsRequest, validData);
      const errors = await validate(request);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid pagination values', async () => {
      const invalidData = {
        limit: -1,
        offset: -5,
      };

      const request = plainToClass(GetEstablishmentsRequest, invalidData);
      const errors = await validate(request);

      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((error) => error.property === 'limit');
      const offsetError = errors.find((error) => error.property === 'offset');
      expect(limitError).toBeDefined();
      expect(offsetError).toBeDefined();
    });
  });
});
