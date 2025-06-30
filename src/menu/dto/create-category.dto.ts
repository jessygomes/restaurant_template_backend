/* eslint-disable prettier/prettier */
export class CreateCategoryDto {
  userId: string;
  name: string;
  type: 'Saisonnier' | 'Suggestion' | 'Signature';
}
