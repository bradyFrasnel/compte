import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { TransactionStatus, TransactionType } from '@prisma/client';

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
