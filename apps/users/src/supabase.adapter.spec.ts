import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { SupabaseAdapter } from './supabase.adapter';
import { UserProfile } from '@app/common/users';
import { ContextService } from '@app/common/users/context.service';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');
jest.mock('@app/common/settings', () => ({
  Settings: {
    supabaseUrl: 'http://localhost:54321',
    supabaseSecretKey: 'test-key',
  },
}));

describe('SupabaseAdapter', () => {
  let adapter: SupabaseAdapter;
  let mockClient: any;
  let mockContextService: jest.Mocked<ContextService>;

  beforeEach(async () => {
    // Set environment variables for tests
    process.env.SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_SECRET_KEY = 'test-key';

    mockClient = {
      auth: {
        getClaims: jest.fn(),
        admin: {
          getUserById: jest.fn(),
          updateUserById: jest.fn(),
        },
      },
    };

    mockContextService = {
      userId: 'test-user-id',
    } as any;

    (createClient as jest.Mock).mockReturnValue(mockClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseAdapter,
        {
          provide: ContextService,
          useValue: mockContextService,
        },
      ],
    }).compile();

    adapter = module.get<SupabaseAdapter>(SupabaseAdapter);
    (adapter as any).logger = {
      error: jest.fn(),
      log: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    };
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
  });

  describe('validateJwt', () => {
    it('should return valid response when JWT is valid', async () => {
      const mockResponse = {
        data: {
          claims: {
            sub: 'user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      };
      mockClient.auth.getClaims.mockResolvedValue(mockResponse);

      const result = await adapter.validateJwt('valid-jwt');

      expect(result).toEqual({
        isValid: true,
        userId: 'user-123',
      });
    });

    it('should throw RpcException when JWT validation fails', async () => {
      const mockError = new Error('Invalid JWT');
      mockClient.auth.getClaims.mockRejectedValue(mockError);

      await expect(adapter.validateJwt('invalid-jwt')).rejects.toThrow(
        new RpcException({
          code: status.UNAUTHENTICATED,
          message: 'Invalid JWT',
        }),
      );
    });

    it('should throw error when response contains error', async () => {
      const mockResponse = {
        data: null,
        error: new Error('Token expired'),
      };
      mockClient.auth.getClaims.mockResolvedValue(mockResponse);

      await expect(adapter.validateJwt('expired-jwt')).rejects.toThrow(
        new RpcException({
          code: status.UNAUTHENTICATED,
          message: 'Token expired',
        }),
      );
    });
  });

  describe('getUserById', () => {
    it('should return user profile when user exists', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      const mockResponse = {
        data: { user: mockUser },
        error: null,
      };
      mockClient.auth.admin.getUserById.mockResolvedValue(mockResponse);

      const result = await adapter.getUserById('user-123');

      expect(result).toBeInstanceOf(UserProfile);
      expect(result.id).toBe('user-123');
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
    });

    it('should throw RpcException with NOT_FOUND when user not found', async () => {
      const mockResponse = {
        data: null,
        error: new Error('User not found'),
      };
      mockClient.auth.admin.getUserById.mockResolvedValue(mockResponse);

      await expect(adapter.getUserById('nonexistent')).rejects.toThrow(
        new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        }),
      );
    });
  });

  describe('updateUser', () => {
    it('should update user and return user profile', async () => {
      const updateRequest = {
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          firstName: 'Jane',
          lastName: 'Smith',
        },
      };
      const mockResponse = {
        data: { user: mockUser },
        error: null,
      };
      mockClient.auth.admin.updateUserById.mockResolvedValue(mockResponse);

      const result = await adapter.updateUser('user-123', updateRequest);

      expect(mockClient.auth.admin.updateUserById).toHaveBeenCalledWith(
        'user-123',
        {
          user_metadata: updateRequest,
        },
      );
      expect(result).toBeInstanceOf(UserProfile);
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
    });

    it('should throw RpcException with INVALID_ARGUMENT for invalid parameters', async () => {
      const mockResponse = {
        data: null,
        error: new Error('Expected parameter is missing'),
      };
      mockClient.auth.admin.updateUserById.mockResolvedValue(mockResponse);

      await expect(
        adapter.updateUser('user-123', { firstName: 'John' }),
      ).rejects.toThrow(
        new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Expected parameter is missing',
        }),
      );
    });
  });

  describe('toUserProfile', () => {
    it('should convert User to UserProfile correctly', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      const mockResponse = {
        data: { user: mockUser },
        error: null,
      };
      mockClient.auth.admin.getUserById.mockResolvedValue(mockResponse);

      const result = await adapter.getUserById('user-123');

      expect(result.id).toBe('user-123');
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
    });

    it('should handle missing user metadata', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {},
      };
      const mockResponse = {
        data: { user: mockUser },
        error: null,
      };
      mockClient.auth.admin.getUserById.mockResolvedValue(mockResponse);

      const result = await adapter.getUserById('user-123');

      expect(result.firstName).toBeUndefined();
      expect(result.lastName).toBeUndefined();
    });
  });
});
