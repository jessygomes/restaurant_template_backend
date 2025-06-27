/* eslint-disable prettier/prettier */
export class UpdateReservationDto {
  reservationId: string;
  date?: string; // Format ISO
  arrivalTime?: string; // Format ISO
  guests?: number;
  status?: 'Attente' | 'Confirmée' | 'Annulée';
  tableIds?: string[];
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}
