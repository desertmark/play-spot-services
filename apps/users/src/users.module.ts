import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { SupabaseAdapter } from './supabase.adapter';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [SupabaseAdapter],
})
export class UsersModule {}
