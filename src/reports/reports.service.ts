import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction, CategorieDepot } from '@prisma/client';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateWeeklyReport(weekNumber: number, year: number): Promise<Buffer> {
    // Calculer les dates de la semaine
    const startDate = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Lundi
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Dimanche

    // Récupérer les transactions de la semaine
    const transactions = await this.prisma.transaction.findMany({
      where: {
        type: 'DEPOT',
        categorie: CategorieDepot.SEMAINE,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'APPROVED',
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Récupérer les membres
    const members = await this.prisma.membersShaba.findMany({
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

    // Générer le PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const html = this.generateReportHTML(transactions, members, weekNumber, year, startDate, endDate);
    
    await page.setContent(html);
    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    await browser.close();
    return Buffer.from(pdfUint8Array);
  }

  private generateReportHTML(
    transactions: any[], 
    members: any[], 
    weekNumber: number, 
    year: number,
    startDate: Date,
    endDate: Date
  ): string {
    const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rapport Hebdomadaire SharedVault</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #0066ff; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #0066ff; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f0f8ff; font-weight: bold; }
          .total { font-weight: bold; background-color: #f0f8ff; }
          .footer { margin-top: 40px; text-align: center; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Rapport Financier Hebdomadaire</h1>
          <h2>Semaine ${weekNumber} - ${year}</h2>
          <p>Du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}</p>
        </div>

        <div class="section">
          <h2>💰 Résumé des Dépôts</h2>
          <table>
            <tr>
              <th>Nombre de transactions</th>
              <td>${transactions.length}</td>
            </tr>
            <tr>
              <th>Montant total</th>
              <td class="total">${totalAmount.toFixed(2)} €</td>
            </tr>
            <tr>
              <th>Moyenne par transaction</th>
              <td>${transactions.length > 0 ? (totalAmount / transactions.length).toFixed(2) : '0.00'} €</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>📋 Détail des Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Montant</th>
                <th>Catégorie</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => `
                <tr>
                  <td>${new Date(t.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>${t.user.username}</td>
                  <td>${t.user.email}</td>
                  <td>${parseFloat(t.amount.toString()).toFixed(2)} €</td>
                  <td>${t.categorie}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>👥 Liste des Membres Actifs</h2>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Username</th>
                <th>Email</th>
                <th>Date d'ajout</th>
              </tr>
            </thead>
            <tbody>
              ${members.map(m => `
                <tr>
                  <td>${m.nom}</td>
                  <td>${m.user.username}</td>
                  <td>${m.user.email}</td>
                  <td>${new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p>© ${new Date().getFullYear()} SharedVault – Système de Gestion Financière</p>
        </div>
      </body>
      </html>
    `;
  }
}
