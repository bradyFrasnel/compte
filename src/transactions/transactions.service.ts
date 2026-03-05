import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction, TransactionType, TransactionStatus, Role } from '@prisma/client';

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
}
