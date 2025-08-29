import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SupabaseAdapter } from './supabase.adapter';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, SupabaseAdapter],
})
export class UsersModule {}
