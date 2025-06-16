/* eslint-disable prettier/prettier */
export class UpdateReservationDto {
  reservationId: string;
  date?: string; // Format ISO
  arrivalTime?: string; // Format ISO
  guests?: number;
  tableIds?: string[];
}
