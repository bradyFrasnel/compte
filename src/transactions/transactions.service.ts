import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction, TransactionType, TransactionStatus, Role } from '@prisma/client';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async createDeposit(userId: string, amount: number): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: {
        amount,
        type: TransactionType.DEPOT,
        status: TransactionStatus.PENDING,
        userId,
      },
    });
  }

  // Methode pour créer un retrait
  async createWithdrawal(userId: string, amount: number): Promise<Transaction> {
    const balance = await this.getBalance();
    if (balance < amount) {
      throw new BadRequestException('Insufficient approved balance');
    }

    return this.prisma.transaction.create({
      data: {
        amount,
        type: TransactionType.RETRAIT,
        status: TransactionStatus.APPROVED, 
        userId,
      },
    });
  }

  // Methode pour créer un retrait avec justification
  async createWithdrawalWithJustification(userId: string, amount: number, justification: string): Promise<Transaction> {
    const balance = await this.getBalance();
    if (balance < amount) {
      throw new BadRequestException('Solde approuvé insuffisant');
    }

    return this.prisma.transaction.create({
      data: {
        amount,
        type: TransactionType.RETRAIT,
        status: TransactionStatus.APPROVED,
        justification,
        userId,
      },
    });
  }

  // Methode pour vérifier le solde
  async getBalance(): Promise<number> {
    const deposits = await this.prisma.transaction.aggregate({
      where: {
        type: TransactionType.DEPOT,
        status: TransactionStatus.APPROVED,
      },
      _sum: {
        amount: true,
      },
    });

    const withdrawals = await this.prisma.transaction.aggregate({
      where: {
        type: TransactionType.RETRAIT,
        status: TransactionStatus.APPROVED,
      },
      _sum: {
        amount: true,
      },
    });

    const totalDeposits = deposits._sum.amount ? Number(deposits._sum.amount) : 0;
    const totalWithdrawals = withdrawals._sum.amount ? Number(withdrawals._sum.amount) : 0;

    return totalDeposits - totalWithdrawals;
  }

  // Methode pour valider une transaction
  async validateTransaction(id: string, status: TransactionStatus): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.type !== TransactionType.DEPOT) {
      throw new BadRequestException('Only deposits can be validated');
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status },
    });
  }

  // Methode pour valider une transaction (admin pur - sans restrictions)
  async adminValidateTransaction(id: string, status: TransactionStatus): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Uniquement les dépôts peuvent être validés/rejetés
    if (transaction.type !== TransactionType.DEPOT) {
      throw new BadRequestException('Only deposits can be validated');
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status },
    });
  }

  // Methode pour trouver toutes les transactions
  async findAll(): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Methode pour supprimer une transaction
  async deleteTransaction(id: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  // Methode pour mettre à jour une transaction
  async updateTransaction(id: string, userId: string, updateData: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Vérifier que l'utilisateur ne modifie que ses propres transactions
    if (transaction.userId !== userId) {
      throw new ForbiddenException('You can only update your own transactions');
    }

    // Vérifier que la transaction n'est pas encore validée/rejetée
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Cannot update a transaction that has already been processed');
    }

    // Empêcher la modification du type de transaction
    if (updateData.type && updateData.type !== transaction.type) {
      throw new BadRequestException('Cannot change transaction type');
    }

    return this.prisma.transaction.update({
      where: { id },
      data: updateData,
    });
  }
}
