import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { SupabaseAdapter } from './supabase.adapter';
import { UserProfile } from '@app/common/users';
import { Metadata } from '@grpc/grpc-js';

describe('UsersController', () => {
  let usersController: UsersController;
  let currentUser: UserProfile;
  beforeEach(async () => {
    currentUser = new UserProfile();
    currentUser.id = 'test-user-id';
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [SupabaseAdapter],
    })
      .overrideProvider(SupabaseAdapter)
      .useValue({
        getUserById: jest.fn().mockResolvedValue(currentUser),
      })
      .compile();
    usersController = app.get<UsersController>(UsersController);
  });

  describe('root', () => {
    it('should return current user', () => {
      const meta = new Metadata();
      meta.set('userId', 'test-user-id');
      expect(usersController.getCurrentUser({}, meta)).resolves.toEqual({
        id: 'test-user-id',
      });
    });
  });
});
