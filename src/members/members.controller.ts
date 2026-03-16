import { Controller, Post, Get, Delete, UseGuards, Request, Body, Param } from '@nestjs/common';
import { MembersService } from './members.service';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Post('add')
  @Roles(Role.ADMIN)
  async addMember(@Request() req, @Body() addMemberDto: AddMemberDto) {
    return this.membersService.addMember(req.user, addMemberDto.userId, addMemberDto.nom);
  }

  @Get('all')
  @Roles(Role.ADMIN)
  async getAllMembers() {
    return this.membersService.getAllMembers();
  }

  @Delete('remove/:userId')
  @Roles(Role.ADMIN)
  async removeMember(@Request() req, @Param('userId') userId: string) {
    return this.membersService.removeMember(req.user, userId);
  }

  @Get('check/:userId')
  async checkMembership(@Param('userId') userId: string) {
    const isMember = await this.membersService.isMember(userId);
    return { isMember, userId };
  }
}
