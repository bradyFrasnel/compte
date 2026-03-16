import { IsString, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { CategorieDepot } from '@prisma/client';

export class CreateDepositWithCategoryDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(CategorieDepot)
  @IsNotEmpty()
  categorie: CategorieDepot;
}
