import { IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class CreateDepositDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
