/* eslint-disable prettier/prettier */
export class CreateReservationAdminDto {
  date: string;
  arrivalTime: string;
  guests: number;
  tableIds: string[];
  userId: string;
  status: string;

  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}
