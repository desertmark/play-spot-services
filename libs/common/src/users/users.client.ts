import { Observable } from 'rxjs';

export interface UsersClient {
  GetHello(data: {}): Observable<{ message: string }>;
}
