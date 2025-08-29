import { Observable } from 'rxjs';
import { UpdateUserRequest, UserProfile } from './users.dto';
import { Metadata } from '@grpc/grpc-js';

export interface IUsersClient {
  GetCurrentUser(data: {}, metadata: Metadata): Observable<UserProfile>;
  UpdateUser(data: UpdateUserRequest, metadata: Metadata): Observable<void>;
}
