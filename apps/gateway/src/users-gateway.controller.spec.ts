import { Test, TestingModule } from '@nestjs/testing';
import { UsersGatewayController } from './users-gateway.controller';
import { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { IUsersClient } from '@app/common/users/users.client';
import { GRPC_USERS_CLIENT, GRPC_USERS_SERVICE } from '@app/common/constants';
import { UpdateUserRequest, UserProfile } from '@app/common/users';

describe('UsersGatewayController', () => {
  let controller: UsersGatewayController;
  let mockUsersService: jest.Mocked<IUsersClient>;
  let mockClientGrpc: jest.Mocked<ClientGrpc>;

  beforeEach(async () => {
    mockUsersService = {
      GetCurrentUser: jest.fn(),
      UpdateUser: jest.fn(),
    } as any;

    mockClientGrpc = {
      getService: jest.fn().mockReturnValue(mockUsersService),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersGatewayController],
      providers: [
        {
          provide: GRPC_USERS_CLIENT,
          useValue: mockClientGrpc,
        },
      ],
    }).compile();

    controller = module.get<UsersGatewayController>(UsersGatewayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize users service', () => {
      controller.onModuleInit();
      expect(mockClientGrpc.getService).toHaveBeenCalledWith(
        GRPC_USERS_SERVICE,
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should call GetCurrentUser service method', async () => {
      const metadata = new Metadata();
      const updateRequest = new UpdateUserRequest();
      updateRequest.firstName = 'Jane';
      updateRequest.lastName = 'Doe';
      const expectedResult = {
        id: '1',
        email: 'janedoe@email.com',
        firstName: 'Jane',
        lastName: 'Doe',
      };
      mockUsersService.GetCurrentUser.mockResolvedValue(expectedResult);

      controller.onModuleInit();
      const result = await controller.getCurrentUser(metadata);

      expect(mockUsersService.GetCurrentUser).toHaveBeenCalledWith(
        {},
        metadata,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateUser', () => {
    it('should call UpdateUser service method', async () => {
      const metadata = new Metadata();
      const updateRequest = new UpdateUserRequest();
      updateRequest.firstName = 'Jane';
      updateRequest.lastName = 'Doe';
      const expectedResult: UserProfile = {
        id: '1',
        email: 'janedoe@email.com',
        firstName: 'Jane',
        lastName: 'Doe',
      };
      mockUsersService.UpdateUser.mockResolvedValue(expectedResult);

      controller.onModuleInit();
      const result = await controller.updateUser(updateRequest, metadata);

      expect(mockUsersService.UpdateUser).toHaveBeenCalledWith(
        updateRequest,
        metadata,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
