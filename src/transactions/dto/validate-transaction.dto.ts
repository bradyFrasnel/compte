import { IsEnum, IsNotEmpty } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class ValidateTransactionDto {
  @IsEnum(TransactionStatus)
  @IsNotEmpty()
  status: TransactionStatus;
}
