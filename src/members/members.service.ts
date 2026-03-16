import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async addMember(adminUser: User, userId: string, nom: string) {
    // Vérifier que l'utilisateur est admin
    if (adminUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Seul un administrateur peut ajouter un membre');
    }

    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const existingMember = await this.prisma.membersShaba.findUnique({
      where: { userId },
    });

    if (existingMember) {
      throw new ForbiddenException('Cet utilisateur est déjà membre');
    }

    // Ajouter le membre
    const member = await this.prisma.membersShaba.create({
      data: {
        userId,
        nom,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return member;
  }

  async getAllMembers() {
    return this.prisma.membersShaba.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async removeMember(adminUser: User, userId: string) {
    if (adminUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Seul un administrateur peut supprimer un membre');
    }

    const member = await this.prisma.membersShaba.findUnique({
      where: { userId },
    });

    if (!member) {
      throw new NotFoundException('Membre non trouvé');
    }

    await this.prisma.membersShaba.delete({
      where: { userId },
    });

    return { message: 'Membre supprimé avec succès' };
  }

  async isMember(userId: string): Promise<boolean> {
    const member = await this.prisma.membersShaba.findUnique({
      where: { userId },
    });

    return !!member;
  }
}
