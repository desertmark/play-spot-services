import {
  CreateReservationRequest,
  GetReservationsRequest,
  Reservation,
  ReservationStatus,
} from '@app/common/reservations';

describe('Reservations DTOs', () => {
  describe('CreateReservationRequest', () => {
    it('should create a valid CreateReservationRequest', () => {
      const request: CreateReservationRequest = {
        reservationDate: new Date('2023-12-01'),
        slotIds: [1, 2, 3],
      };

      expect(request.reservationDate).toBeInstanceOf(Date);
      expect(request.slotIds).toEqual([1, 2, 3]);
    });
  });

  describe('GetReservationsRequest', () => {
    it('should create a valid GetReservationsRequest', () => {
      const request: GetReservationsRequest = {
        userId: 'test-user-id',
        reservationDate: '2023-12-01',
        status: ReservationStatus.CONFIRMED,
        pagination: { limit: 10, offset: 0 },
      };

      expect(request.userId).toBe('test-user-id');
      expect(request.reservationDate).toBe('2023-12-01');
      expect(request.status).toBe(ReservationStatus.CONFIRMED);
    });
  });

  describe('Reservation', () => {
    it('should create a Reservation from object', () => {
      const reservationData = {
        id: 1,
        userId: 'test-user-id',
        reservationDate: new Date('2023-12-01'),
        status: ReservationStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservationSlots: [{ id: 1, reservationId: 1, slotId: 1 }],
      };

      const reservation = Reservation.fromObject(reservationData);

      expect(reservation).toBeDefined();
      expect(reservation.id).toBe(1);
      expect(reservation.userId).toBe('test-user-id');
      expect(reservation.status).toBe(ReservationStatus.CONFIRMED);
    });
  });
});
