/* eslint-disable prettier/prettier */
export class CreateClientDto {
  userId: string; // Optional, for admin-created clients
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
