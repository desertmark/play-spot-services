import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Settings } from './settings';
import { UserProfile } from '@app/common/users';

@Injectable()
export class SupabaseAdapter {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      Settings.supabaseUrl,
      Settings.supabaseSecretKey,
    );
  }

  async getCurrentUser(jwt: string): Promise<UserProfile> {
    const res = await this.client.auth.getUser(jwt);
    return new UserProfile(res.data.user?.id!, res.data.user?.email!);
  }
}
