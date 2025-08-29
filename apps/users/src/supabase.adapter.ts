import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Settings } from './settings';
import { UpdateUserRequest, UserProfile } from '@app/common/users';

@Injectable()
export class SupabaseAdapter {
  private client: SupabaseClient;
  private logger = new Logger(SupabaseAdapter.name);
  constructor() {
    this.client = createClient(
      Settings.supabaseUrl,
      Settings.supabaseSecretKey,
    );
  }

  async validateJwt(jwt: string) {
    const res = await this.client.auth.getClaims(jwt);
    this.logger.debug(`validateJwt`, res?.data?.claims?.email);
    return res;
  }

  async getCurrentUser(jwt: string): Promise<UserProfile> {
    const res = await this.client.auth.getUser(jwt);
    this.logger.debug(`getCurrentUser: ${JSON.stringify(res)}`);
    return new UserProfile(
      res.data.user?.id!,
      res.data.user?.email!,
      res.data.user?.user_metadata?.firstName,
      res.data.user?.user_metadata?.lastName,
    );
  }

  async updateUser(id: string, user: UpdateUserRequest): Promise<void> {
    this.logger.debug(`updateUser: ${JSON.stringify(user)}`);
    this.client.auth.admin.updateUserById(id, {
      user_metadata: {
        ...user,
      },
    });
  }
}
