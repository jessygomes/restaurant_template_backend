/* eslint-disable prettier/prettier */
export class CreateMenuDto {
  userId: string;
  title: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  available: boolean;
  categoryId: string;
}
