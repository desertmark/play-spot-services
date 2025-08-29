export class UserProfile {
  constructor(
    public id: string,
    public email: string,
    public firstName?: string,
    public lastName?: string,
  ) {}
}

export type UpdateUserRequest = Omit<UserProfile, 'email' | 'id'>;
export interface ValidateJwtRequest {
  jwt: string;
}
export interface ValidateJwtResponse {
  isValid: boolean;
  userId: string;
  error?: string;
}
