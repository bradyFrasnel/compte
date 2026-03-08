import { IsNumber, IsPositive, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateWithdrawalWithJustificationDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  justification: string;
}
