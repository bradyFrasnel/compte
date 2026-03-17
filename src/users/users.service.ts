import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Methode pour trouver un utilisateur par email
  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Methode pour trouver un utilisateur par nom d'utilisateur
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  // Methode pour créer un utilisateur
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  // Methode pour trouver un utilisateur par id
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // Methode pour générer et sauvegarder le token de réinitialisation
  async generateResetToken(email: string): Promise<string> {
    const user = await this.findOne(email);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Générer un token de 6 chiffres
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    await this.prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    return resetToken;
  }

  // Methode pour trouver un utilisateur par token de réinitialisation
  async findByResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });
  }

  // Methode pour réinitialiser le mot de passe
  async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await this.findByResetToken(token);
    if (!user) {
      throw new Error('Token invalide ou expiré');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return updatedUser;
  }

  // Methode pour obtenir le profil utilisateur connecté
  async getUserProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Ajouter les dates manuellement car elles ne sont pas dans le modèle User de base
    return {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Methode pour lister tous les utilisateurs (réservé aux admins)
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }
}
