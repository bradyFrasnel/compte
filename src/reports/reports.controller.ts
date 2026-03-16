import { Controller, Get, Param, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { Response } from 'express';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('weekly/:weekNumber/:year')
  @Roles(Role.ADMIN)
  async getWeeklyReport(
    @Param('weekNumber') weekNumber: number,
    @Param('year') year: number,
    @Res() res: Response
  ) {
    try {
      const pdfBuffer = await this.reportsService.generateWeeklyReport(weekNumber, year);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rapport-semaine-${weekNumber}-${year}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Erreur lors de la génération du rapport',
        error: error.message,
      });
    }
  }

  @Get('current-week')
  @Roles(Role.ADMIN)
  async getCurrentWeekReport(@Res() res: Response) {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();

    return this.getWeeklyReport(weekNumber, year, res);
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  }
}
