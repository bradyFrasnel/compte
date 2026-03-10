import { Controller, Post, Body, Get, Patch, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { CreateWithdrawalWithJustificationDto } from './dto/create-withdrawal-with-justification.dto';
import { ValidateTransactionDto } from './dto/validate-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
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

  // Methode pour l'affichage des données
  @Get('all')
  async findAll() {
    return this.transactionsService.findAll();
  }

  // Methode pour l'affiche du solde
  @Get('balance')
  async getBalance() {
    return { balance: await this.transactionsService.getBalance() };
  }

  // Methode pour supprimer une transaction
  @Delete('admin/delete/:id')
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    return this.transactionsService.deleteTransaction(id);
  }

  // Methode pour updater une transaction
  @Patch('admin/update/:id')
  @Roles(Role.ADMIN, Role.USER)
  async update(@Param('id') id: string, @Request() req, @Body() updateDto: UpdateTransactionDto) {
    return this.transactionsService.updateTransaction(id, req.user.userId, updateDto);
  }

  // Methode pour updater ses propres transactions (utilisateurs)
  @Patch('update/:id')
  @Roles(Role.USER)
  async updateOwnTransaction(@Param('id') id: string, @Request() req, @Body() updateDto: UpdateTransactionDto) {
    return this.transactionsService.updateTransaction(id, req.user.userId, updateDto);
  }

  // Methode pour valider les transactions
  @Patch('admin/validate/:id')
  @Roles(Role.ADMIN)
  async validate(@Param('id') id: string, @Body() validateDto: ValidateTransactionDto) {
    return this.transactionsService.adminValidateTransaction(id, validateDto.status);
  }

  // Methode pour les retraits
  @Post('admin/withdraw')
  @Roles(Role.ADMIN)
  async withdraw(@Request() req, @Body() createWithdrawalDto: CreateWithdrawalDto) {
    return this.transactionsService.createWithdrawal(req.user.userId, createWithdrawalDto.amount);
  }

  // Methode pour les retraits avec justification
  @Post('admin/withdraw-with-justification')
  @Roles(Role.ADMIN)
  async withdrawWithJustification(@Request() req, @Body() createWithdrawalWithJustificationDto: CreateWithdrawalWithJustificationDto) {
    return this.transactionsService.createWithdrawalWithJustification(
      req.user.userId,
      createWithdrawalWithJustificationDto.amount,
      createWithdrawalWithJustificationDto.justification
    );
  }
}
