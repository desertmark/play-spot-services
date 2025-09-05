import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { SupabaseAdapter } from './supabase.adapter';
import { ContextService } from '@app/common/users/context.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [],
  controllers: [UsersController, AuthController],
  providers: [SupabaseAdapter, ContextService],
})
export class UsersModule {}
