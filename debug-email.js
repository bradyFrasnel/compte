// Script de test pour diagnostiquer Brevo
require('dotenv').config(); // ← Charger .env
const nodemailer = require('nodemailer');

async function testBrevo() {
  console.log('🔍 Variables chargées :');
  console.log('BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER ? '✅' : '❌');
  console.log('BREVO_SMTP_KEY:', process.env.BREVO_SMTP_KEY ? '✅' : '❌');

  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_KEY) {
    console.error('❌ Variables Brevo manquantes dans .env');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });

  try {
    // Test de connexion
    await transporter.verify();
    console.log('✅ Connexion Brevo réussie');

    // Test email simple
    const info = await transporter.sendMail({
      from: `"Test SharedVault" <${process.env.BREVO_SMTP_USER}>`,
      to: 'mokumabrady13@gmail.com',
      subject: 'TEST SIMPLE - SharedVault',
      text: 'Ceci est un test simple pour vérifier la réception.',
      html: '<p>Ceci est un <strong>test simple</strong> pour vérifier la réception.</p>',
    });

    console.log('✅ Email simple envoyé - Message ID:', info.messageId);
    console.log('📧 Vérifiez votre boîte mail et spam');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testBrevo();
