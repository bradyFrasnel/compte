require('dotenv').config();
console.log('📋 Contenu du .env chargé :');
console.log('BREVO_SMTP_USER =', process.env.BREVO_SMTP_USER);
console.log('BREVO_SMTP_KEY =', process.env.BREVO_SMTP_KEY ? '[KEY PRESENTE]' : '[KEY MANQUANTE]');
console.log('JWT_SECRET =', process.env.JWT_SECRET ? '[JWT PRESENT]' : '[JWT MANQUANT]');
