import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { DeleteEntitytRequest, PaginationResponse } from '../dto';
import {
  CreateReservationRequest,
  GetReservationsRequest,
  Reservation,
} from './reservations.dto';

export interface IReservationsClient {
  GetReservations(
    data: GetReservationsRequest,
    metadata?: Metadata,
  ): Observable<PaginationResponse<Reservation>>;
  CreateReservation(
    data: CreateReservationRequest,
    metadata?: Metadata,
  ): Observable<Reservation>;
  DeleteReservation(
    data: DeleteEntitytRequest,
    metadata?: Metadata,
  ): Observable<void>;
}
