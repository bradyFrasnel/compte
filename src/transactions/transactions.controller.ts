import { Controller, Post, Body, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ValidateTransactionDto } from './dto/validate-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  // Methode pour effectuer des depots
  @Post('deposit')
  async deposit(@Request() req, @Body() createDepositDto: CreateDepositDto) {
    return this.transactionsService.createDeposit(req.user.userId, createDepositDto.amount);
  }

  // Methode pour l'affiche des données
  @Get('all')
  async findAll() {
    return this.transactionsService.findAll();
  }

  // Methode pour l'affiche du solde
  @Get('balance')
  async getBalance() {
    return { balance: await this.transactionsService.getBalance() };
  }

  // Methode pour valider les transactions
  @Patch('admin/validate/:id')
  @Roles(Role.ADMIN)
  async validate(@Param('id') id: string, @Body() validateDto: ValidateTransactionDto) {
    return this.transactionsService.validateTransaction(id, validateDto.status);
  }

  // Methode pour
  @Post('admin/withdraw')
  @Roles(Role.ADMIN)
  async withdraw(@Request() req, @Body() createWithdrawalDto: CreateWithdrawalDto) {
    return this.transactionsService.createWithdrawal(req.user.userId, createWithdrawalDto.amount);
  }
}
