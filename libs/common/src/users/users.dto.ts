export class UserProfile {
  constructor(
    public id: string,
    public email: string,
    public firstName?: string,
    public lastName?: string,
  ) {}
}

export type UpdateUserRequest = Omit<UserProfile, 'email' | 'id'>;
