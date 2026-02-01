const nodemailer = require('nodemailer');

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Función para enviar correo de confirmación de reporte
const sendReportConfirmation = async (clientEmail, clientName, reportTitle, reportDescription) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: clientEmail,
      subject: `Confirmación de Reporte: ${reportTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .header {
              background-color: #4f46e5;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .report-details {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4f46e5;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Tech Consultoría</h1>
            </div>
            <div class="content">
              <h2>Hola ${clientName},</h2>
              <p>Hemos recibido tu reporte y nuestro equipo lo está revisando.</p>
              
              <div class="report-details">
                <h3>📋 Detalles del Reporte:</h3>
                <p><strong>Título:</strong> ${reportTitle}</p>
                <p><strong>Descripción:</strong> ${reportDescription}</p>
              </div>

              <h3>📝 Necesitamos más información</h3>
              <p>Para poder ayudarte de la mejor manera, por favor proporciona los siguientes detalles adicionales:</p>
              
              <ul>
                <li>¿Cuándo comenzó a ocurrir este problema?</li>
                <li>¿Has notado algún patrón o situación específica que lo desencadene?</li>
                <li>¿Tienes capturas de pantalla o archivos que puedan ayudar?</li>
                <li>¿Qué navegador o dispositivo estás utilizando?</li>
              </ul>

              <p><strong>Por favor responde a este correo con la información solicitada.</strong></p>

              <p>Nuestro equipo técnico se pondrá en contacto contigo lo antes posible.</p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p>Si tienes alguna pregunta urgente, no dudes en contactarnos.</p>
                <p><strong>Email:</strong> soporte@techconsultoria.com</p>
                <p><strong>Teléfono:</strong> +52 123 456 7890</p>
              </div>
            </div>
            <div class="footer">
              <p>© 2026 Tech Consultoría - Todos los derechos reservados</p>
              <p>Este es un correo automático, por favor no respondas a esta dirección.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return { success: false, error: error.message };
  }
};

// Función para enviar notificación al admin
const sendAdminNotification = async (reportTitle, clientName, clientEmail) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `Nuevo Reporte Recibido: ${reportTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .alert {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin-bottom: 20px;
            }
            .info {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 6px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="alert">
              <h2> Nuevo Reporte Recibido</h2>
            </div>
            
            <div class="info">
              <h3>Información del Cliente:</h3>
              <p><strong>Nombre:</strong> ${clientName}</p>
              <p><strong>Email:</strong> ${clientEmail}</p>
              <p><strong>Título del Reporte:</strong> ${reportTitle}</p>
            </div>

            <p style="margin-top: 20px;">
              Se ha enviado un correo automático al cliente solicitando más detalles.
            </p>
            
            <p>
              <a href="http://localhost:3000/admin" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px;">
                Ver en Dashboard
              </a>
            </p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Notificación enviada al admin');
  } catch (error) {
    console.error('Error al enviar notificación al admin:', error);
  }
};

module.exports = {
  sendReportConfirmation,
  sendAdminNotification
};