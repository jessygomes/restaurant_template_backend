/* eslint-disable prettier/prettier */
export class ConfirmReservationDto {
  reservationId: string;
  tableIds: string[];
  status: 'Confirmée' | 'Attente' | 'Annulée';
}
