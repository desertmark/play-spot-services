import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from './supabase.adapter';
import { UserProfile } from '@app/common/users';

@Injectable()
export class UsersService {
  constructor(private readonly supabase: SupabaseAdapter) {}

  async getCurrentUser(jwt: string): Promise<UserProfile> {
    return await this.supabase.getCurrentUser(jwt);
  }
}
