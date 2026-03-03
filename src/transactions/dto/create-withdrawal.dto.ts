import { IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class CreateWithdrawalDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
