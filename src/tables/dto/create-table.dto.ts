/* eslint-disable prettier/prettier */
import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  capacity: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
