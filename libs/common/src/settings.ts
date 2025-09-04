export class Settings {
  static get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  static get usersUrl(): string {
    return process.env.USERS_URL || 'users:50051';
  }

  static get facilitiesUrl(): string {
    return process.env.FACILITIES_URL || 'facilities:50051';
  }

  static get supabaseUrl(): string {
    if (!process.env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL is not set');
    }
    return process.env.SUPABASE_URL || '';
  }

  static get supabaseSecretKey(): string {
    if (!process.env.SUPABASE_SECRET_KEY) {
      throw new Error('SUPABASE_SECRET_KEY is not set');
    }
    return process.env.SUPABASE_SECRET_KEY || '';
  }

  static get dbConnectionString(): string {
    if (!process.env.DB_CONNECTION_STRING) {
      throw new Error('DB_CONNECTION_STRING is not set');
    }
    return process.env.DB_CONNECTION_STRING || '';
  }
}
