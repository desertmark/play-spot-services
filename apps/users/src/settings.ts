export class Settings {
  static get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  static get usersUrl(): string {
    return process.env.USERS_URL || 'localhost:50051';
  }

  static get supabaseUrl(): string {
    return process.env.SUPABASE_URL || '';
  }

  static get supabaseSecretKey(): string {
    return process.env.SUPABASE_SECRET_KEY || '';
  }

  static get dbConnectionString(): string {
    return (
      process.env.DB_CONNECTION_STRING ||
      'postgresql://postgres:password@localhost:5432/postgres'
    );
  }
}
