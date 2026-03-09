import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, Role } from '@prisma/client';

// Service d'authentification
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Methode pour s'inscrire
  async register(username: string, email: string, password: string, role: Role = Role.USER) {
    const existingUser = await this.usersService.findOne(email);
    if (existingUser) {
      throw new ConflictException('Cet email est deja utilisé');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    const { password: _, ...result } = user;
    return result;
  }

  // Methode pour valider l'utilisateur par email
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Methode pour valider l'utilisateur par username
  async validateUserByUsername(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Methode universelle qui gère email et username
  async validateUserByIdentifier(identifier: string, pass: string): Promise<any> {
    // Vérifier si c'est un email
    const isEmail = identifier.includes('@');
    
    if (isEmail) {
      return this.validateUser(identifier, pass);
    } else {
      return this.validateUserByUsername(identifier, pass);
    }
  }

  // Methode pour se connecter
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Methode pour demander la réinitialisation de mot de passe
  async forgotPassword(email: string): Promise<{ message: string; token: string }> {
    const resetToken = await this.usersService.generateResetToken(email);
    
    // Dans un vrai projet, vous enverriez un email ici
    // Pour l'instant, nous retournons le token pour le développement
    return {
      message: 'Un email de réinitialisation a été envoyé',
      token: resetToken, // Retiré en production
    };
  }

  // Methode pour réinitialiser le mot de passe
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    await this.usersService.resetPassword(token, newPassword);
    return {
      message: 'Mot de passe réinitialisé avec succès',
    };
  }
}
