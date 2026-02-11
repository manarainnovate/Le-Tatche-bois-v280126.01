import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

/**
 * GET /api/test-email
 *
 * Test SMTP configuration and send a test email.
 * Returns SMTP config (masked password) and result.
 *
 * Usage: curl http://localhost:3000/api/test-email
 */
export async function GET() {
  // Show current SMTP configuration (mask password)
  const config = {
    host: process.env.SMTP_HOST || 'NOT SET',
    port: process.env.SMTP_PORT || 'NOT SET',
    user: process.env.SMTP_USER || 'NOT SET',
    from: process.env.SMTP_FROM || 'NOT SET',
    admin: process.env.ADMIN_EMAIL || 'NOT SET',
    passVar: process.env.SMTP_PASSWORD ? 'SMTP_PASSWORD' : process.env.SMTP_PASS ? 'SMTP_PASS' : 'NONE',
    passLen: (process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '').length,
  };

  try {
    // Check if required variables are set
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      return NextResponse.json({
        success: false,
        error: 'SMTP not configured - missing SMTP_HOST or SMTP_USER',
        config,
      }, { status: 500 });
    }

    const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
    if (!pass) {
      return NextResponse.json({
        success: false,
        error: 'SMTP password not configured - set SMTP_PASSWORD or SMTP_PASS',
        config,
      }, { status: 500 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT || '465') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass,
      },
    });

    // Verify SMTP connection
    console.log('[Test Email] Verifying SMTP connection...');
    await transporter.verify();
    console.log('[Test Email] ✅ SMTP connection verified');

    // Send test email
    const recipient = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    console.log(`[Test Email] Sending test email to ${recipient}...`);

    await transporter.sendMail({
      from: `"LE TATCHE BOIS" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: recipient,
      subject: '✅ Test Email - Le Tatche Bois SMTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d97706;">🎉 SMTP Working!</h1>
          <p>Your SMTP configuration is working correctly.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <h2 style="color: #374151;">Configuration:</h2>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Host:</strong> ${config.host}</li>
            <li><strong>Port:</strong> ${config.port}</li>
            <li><strong>User:</strong> ${config.user}</li>
            <li><strong>From:</strong> ${config.from}</li>
            <li><strong>Password Var:</strong> ${config.passVar}</li>
          </ul>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Sent at: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })}
          </p>
        </div>
      `,
    });

    console.log('[Test Email] ✅ Test email sent successfully');

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${recipient}`,
      config,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Test Email] ❌ Error:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      code: error.code || 'UNKNOWN',
      config,
      details: {
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    }, { status: 500 });
  }
}
