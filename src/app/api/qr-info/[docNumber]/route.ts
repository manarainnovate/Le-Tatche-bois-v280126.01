/**
 * QR Info Display Endpoint
 * GET /api/qr-info/[docNumber] - Returns HTML page with company & bank info
 * This is what the QR code links to
 */

import { NextRequest, NextResponse } from 'next/server';
import { COMPANY } from '@/lib/pdf/base-layout';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docNumber: string }> }
) {
  try {
    const { docNumber } = await params;

    // Extract query params for amount and client
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get('amount');
    const client = searchParams.get('client');

    // Build beautiful HTML page
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LE TATCHE BOIS - Info Document</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #f5f5f0 0%, #e8e4d8 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #6B3A22 0%, #4A2511 100%);
      color: white;
      padding: 24px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    .subtitle {
      font-size: 13px;
      opacity: 0.9;
      font-weight: 500;
    }
    .section {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
    }
    .section:last-child {
      border-bottom: none;
    }
    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #C4973B;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .info-label {
      color: #666;
      font-weight: 500;
    }
    .info-value {
      color: #222;
      font-weight: 600;
      text-align: right;
      word-break: break-word;
    }
    .highlight {
      background: #FFF9E6;
      padding: 16px;
      border-radius: 8px;
      border-left: 3px solid #C4973B;
      margin-top: 8px;
    }
    .doc-number {
      font-size: 18px;
      font-weight: bold;
      color: #4A2511;
      text-align: center;
      padding: 16px;
      background: #FFF9E6;
      border-radius: 8px;
    }
    .amount {
      font-size: 28px;
      font-weight: bold;
      color: #2D5016;
      text-align: center;
      padding: 16px;
      background: #F0F8E8;
      border-radius: 8px;
      margin-top: 8px;
    }
    .copy-btn {
      background: #C4973B;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      margin-top: 8px;
      transition: background 0.2s;
    }
    .copy-btn:active {
      background: #8B6914;
    }
    .footer {
      padding: 16px 24px;
      text-align: center;
      font-size: 12px;
      color: #888;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">LE TATCHE BOIS</div>
      <div class="subtitle">${COMPANY.type} • ${COMPANY.activity}</div>
    </div>

    <div class="section">
      <div class="doc-number">📄 ${docNumber}</div>
      ${amount ? `<div class="amount">${amount} DH</div>` : ''}
      ${client ? `<div style="text-align: center; margin-top: 12px; color: #666; font-size: 14px;">Client: ${client}</div>` : ''}
    </div>

    <div class="section">
      <div class="section-title">🏦 Coordonnées Bancaires</div>
      <div class="highlight">
        <div class="info-row">
          <div class="info-label">Titulaire</div>
          <div class="info-value">${COMPANY.bank.holder}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Banque</div>
          <div class="info-value">${COMPANY.bank.name} ${COMPANY.bank.branch}</div>
        </div>
        <div class="info-row">
          <div class="info-label">RIB</div>
          <div class="info-value" id="rib">${COMPANY.bank.rib}</div>
        </div>
        <button class="copy-btn" onclick="copyText('${COMPANY.bank.rib}', 'RIB')">📋 Copier RIB</button>
        <div class="info-row" style="margin-top: 12px;">
          <div class="info-label">IBAN</div>
          <div class="info-value" id="iban">${COMPANY.bank.iban}</div>
        </div>
        <button class="copy-btn" onclick="copyText('${COMPANY.bank.iban}', 'IBAN')">📋 Copier IBAN</button>
        <div class="info-row" style="margin-top: 12px;">
          <div class="info-label">SWIFT</div>
          <div class="info-value">${COMPANY.bank.swift}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📞 Contact</div>
      <div class="info-row">
        <div class="info-label">Téléphone</div>
        <div class="info-value">
          <a href="tel:${COMPANY.tel1}" style="color: #C4973B; text-decoration: none;">${COMPANY.tel1}</a>
        </div>
      </div>
      <div class="info-row">
        <div class="info-label">Email</div>
        <div class="info-value">
          <a href="mailto:${COMPANY.email2}" style="color: #C4973B; text-decoration: none;">${COMPANY.email2}</a>
        </div>
      </div>
      <div class="info-row">
        <div class="info-label">Web</div>
        <div class="info-value">
          <a href="http://${COMPANY.website}" style="color: #C4973B; text-decoration: none;" target="_blank">${COMPANY.website}</a>
        </div>
      </div>
      <div class="info-row">
        <div class="info-label">ICE</div>
        <div class="info-value">${COMPANY.ice}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📍 Adresse</div>
      <div class="info-value" style="line-height: 1.6;">
        ${COMPANY.address}<br>
        ${COMPANY.city}
      </div>
    </div>

    <div class="footer">
      Scannez le QR code pour accéder à ces informations
    </div>
  </div>

  <script>
    function copyText(text, label) {
      navigator.clipboard.writeText(text).then(() => {
        alert(label + ' copié dans le presse-papiers!');
      }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert(label + ' copié!');
      });
    }
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('[QR Info] Error:', error);
    return new NextResponse('Error loading info', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
