import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import {
  CreateEstablishmentRequest,
  GetEstablishmentsRequest,
  UpdateEstablishmentRequest,
  Establishment,
} from './establishments.dto';
import {
  CreateUnitRequest,
  GetUnitsRequest,
  UpdateUnitRequest,
  Unit,
} from './units.dto';
import {
  CreateSlotRequest,
  GetSlotsRequest,
  UpdateSlotRequest,
  Slot,
} from './slots.dto';
import { PaginationResponse } from '../dto';

export interface IEstablishmentsClient {
  GetEstablishments(
    data: GetEstablishmentsRequest,
    metadata?: Metadata,
  ): Observable<PaginationResponse<Establishment>>;
  CreateEstablishment(
    data: CreateEstablishmentRequest,
    metadata?: Metadata,
  ): Observable<Establishment>;
  UpdateEstablishment(
    data: UpdateEstablishmentRequest,
    metadata?: Metadata,
  ): Observable<Establishment>;
  DeleteEstablishment(
    data: { id: number },
    metadata?: Metadata,
  ): Observable<void>;
}

export interface IUnitsClient {
  GetUnits(
    data: GetUnitsRequest,
    metadata?: Metadata,
  ): Observable<PaginationResponse<Unit>>;
  CreateUnit(data: CreateUnitRequest, metadata?: Metadata): Observable<Unit>;
  UpdateUnit(data: UpdateUnitRequest, metadata?: Metadata): Observable<Unit>;
  DeleteUnit(data: { id: number }, metadata?: Metadata): Observable<void>;
}

export interface ISlotsClient {
  GetSlots(
    data: GetSlotsRequest,
    metadata?: Metadata,
  ): Observable<PaginationResponse<Slot>>;
  CreateSlot(data: CreateSlotRequest, metadata?: Metadata): Observable<Slot>;
  UpdateSlot(data: UpdateSlotRequest, metadata?: Metadata): Observable<Slot>;
  DeleteSlot(data: { id: number }, metadata?: Metadata): Observable<void>;
}
