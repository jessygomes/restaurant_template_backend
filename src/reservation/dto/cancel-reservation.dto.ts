/* eslint-disable prettier/prettier */
export class CancelReservationDto {
  reservationId: string;
  reason?: string; // Optionnel, pour le mail
}
