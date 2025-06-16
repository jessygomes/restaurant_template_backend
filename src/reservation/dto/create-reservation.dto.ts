/* eslint-disable prettier/prettier */
// import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReservationDto {
  date: string; // ex: "2025-06-10"

  arrivalTime: string; // ex: "2025-06-10T12:30:00.000Z"

  guests: number;

  userId: string;

  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}
