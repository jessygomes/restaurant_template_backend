/* eslint-disable prettier/prettier */
export class CreateBannerDto {
  userId: string;
  title: string;
  image?: string;
  link?: string;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean; // Indique si la bannière est active ou non, par défaut true
}
