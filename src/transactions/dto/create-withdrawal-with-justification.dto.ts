import { IsNumber, IsPositive, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateWithdrawalWithJustificationDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  justification: string;
}
