#!/usr/bin/env python3
"""
LE TATCHE BOIS - Professional Document Generator
Facture, Devis, and Papier En-Tête conforming to Moroccan CGI (art. 145-146)
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Table, TableStyle
from PIL import Image
import copy

# ─── COMPANY INFO ────────────────────────────────────────────────
COMPANY = {
    "name": "LE TATCHE BOIS",
    "type": "S.A.R.L A.U",
    "activity": "Menuiserie Artisanat - Décoration",
    "address": "LOT HAMANE EL FETOUAKI N° 365",
    "city": "LAMHAMID - MARRAKECH",
    "rc": "120511",
    "if_num": "50628346",
    "ice": "002942117000021",
    "pat": "64601859",
    "email": "letatchebois@gmail.com",
    "tel1": "0687 44 184",
    "tel2": "0698 01 34 68",
}

# ─── COLORS (Gold/Brown branding) ───────────────────────────────
GOLD_DARK = HexColor("#8B6914")
GOLD = HexColor("#C5961A")
GOLD_LIGHT = HexColor("#D4A843")
GOLD_PALE = HexColor("#F5E6C0")
BROWN_DARK = HexColor("#3D1F00")
BROWN = HexColor("#5C2E00")
BROWN_MEDIUM = HexColor("#7A3B11")
WHITE = white
BLACK = black
GRAY_LIGHT = HexColor("#F5F5F0")
GRAY = HexColor("#888888")
GRAY_DARK = HexColor("#444444")
LINE_COLOR = HexColor("#C5961A")

# ─── PATHS ───────────────────────────────────────────────────────
LOGO_HEADER = "/home/claude/logo_cropped_final.png"
LOGO_FOOTER = "/mnt/user-data/uploads/logo_tatchebois_footer_2.png"
LOGO_WATERMARK = "/home/claude/logo_watermark.png"
BORDER_FRAME = "/home/claude/border_frame.png"
WOOD_BG = "/mnt/user-data/uploads/Screenshot_at_Feb_06_21-28-21.png"
OUTPUT_DIR = "/home/claude"

W, H = A4  # 595.27 x 841.89 points


WOOD_BAR_TEXTURE = "/mnt/user-data/uploads/Screenshot_at_Feb_06_20-59-22.png"
WOOD_HEADER_TEXTURE = "/mnt/user-data/uploads/Screenshot_at_Feb_06_21-08-04.png"


def _draw_wood_header_bg(c, x, y, width, height):
    """Draw wood texture clipped to a rectangular area (for badges, table headers)"""
    try:
        c.saveState()
        p = c.beginPath()
        p.rect(x, y, width, height)
        c.clipPath(p, stroke=0)
        c.drawImage(WOOD_HEADER_TEXTURE, x, y, width=width, height=height, preserveAspectRatio=False)
        c.restoreState()
    except:
        # Fallback brown
        c.saveState()
        c.setFillColor(BROWN_DARK)
        c.rect(x, y, width, height, fill=1, stroke=0)
        c.restoreState()


def draw_gold_gradient_bar(c, x, y, width, height):
    """Draw a wood texture bar instead of gold gradient"""
    try:
        c.saveState()
        c.clipPath(c.beginPath())  # reset
        # Clip to bar area
        p = c.beginPath()
        p.rect(x, y, width, height)
        c.clipPath(p, stroke=0)
        c.drawImage(WOOD_BAR_TEXTURE, x, y, width=width, height=height, preserveAspectRatio=False)
        c.restoreState()
    except:
        # Fallback to gold gradient
        c.saveState()
        steps = 60
        step_w = width / steps
        for i in range(steps):
            ratio = i / steps
            r = GOLD_DARK.red + (GOLD_LIGHT.red - GOLD_DARK.red) * ratio
            g = GOLD_DARK.green + (GOLD_LIGHT.green - GOLD_DARK.green) * ratio
            b = GOLD_DARK.blue + (GOLD_LIGHT.blue - GOLD_DARK.blue) * ratio
            c.setFillColor(Color(r, g, b))
            c.rect(x + i * step_w, y, step_w + 0.5, height, fill=1, stroke=0)
        c.restoreState()


def draw_decorative_border(c, x, y, width, height, color=GOLD):
    """Draw a thin decorative double-line border"""
    c.setStrokeColor(color)
    c.setLineWidth(1.5)
    c.rect(x, y, width, height, fill=0, stroke=1)
    c.setLineWidth(0.5)
    c.rect(x + 2, y + 2, width - 4, height - 4, fill=0, stroke=1)


def draw_wood_background(c):
    """Draw wood texture as full page background with subtle opacity"""
    try:
        c.saveState()
        c.drawImage(WOOD_BG, 0, 0, width=W, height=H, preserveAspectRatio=False)
        # Semi-transparent white overlay so content is readable
        c.setFillColor(Color(1, 1, 1, alpha=0.80))
        c.rect(0, 0, W, H, fill=1, stroke=0)
        c.restoreState()
    except:
        pass


def draw_center_watermark(c, opacity=0.06):
    """Draw centered logo watermark - big, subtle, professional"""
    try:
        center_logo = ImageReader(LOGO_WATERMARK)
        logo_w = 180 * mm
        logo_h = 130 * mm
        c.saveState()
        c.setFillAlpha(opacity)
        c.drawImage(center_logo, (W - logo_w) / 2, (H - logo_h) / 2 - 15 * mm,
                     width=logo_w, height=logo_h,
                     preserveAspectRatio=True, mask='auto')
        c.restoreState()
    except:
        pass


def draw_border_frame(c):
    """Draw ornate carved wood frame border - thin but with visible wood sculpture"""
    try:
        t = 4 * mm  # enough to see carved wood detail
        
        # Top strip
        c.saveState()
        top_img = ImageReader("/home/claude/frame_top.png")
        c.drawImage(top_img, 0, H - t, width=W, height=t, preserveAspectRatio=False, mask='auto')
        c.restoreState()
        
        # Bottom strip
        c.saveState()
        bottom_img = ImageReader("/home/claude/frame_bottom.png")
        c.drawImage(bottom_img, 0, 0, width=W, height=t, preserveAspectRatio=False, mask='auto')
        c.restoreState()
        
        # Left strip
        c.saveState()
        left_img = ImageReader("/home/claude/frame_left.png")
        c.drawImage(left_img, 0, 0, width=t, height=H, preserveAspectRatio=False, mask='auto')
        c.restoreState()
        
        # Right strip
        c.saveState()
        right_img = ImageReader("/home/claude/frame_right.png")
        c.drawImage(right_img, W - t, 0, width=t, height=H, preserveAspectRatio=False, mask='auto')
        c.restoreState()
    except:
        pass


def draw_header(c, doc_type="", doc_number="", doc_date=""):
    """Draw the professional header with logo and company info"""
    margin = 25 * mm

    # ── Header background area (no top bar) ──
    header_top = H - 5 * mm
    header_bottom = H - 50 * mm
    header_height = header_top - header_bottom

    # ── Logo (left side) - drawn at FULL opacity ──
    try:
        logo = ImageReader(LOGO_HEADER)
        logo_w = 35 * mm
        logo_h = 35 * mm
        c.saveState()
        c.drawImage(logo, 5 * mm, header_bottom + 5 * mm, 
                     width=logo_w, height=logo_h, 
                     preserveAspectRatio=True, mask='auto')
        c.restoreState()
    except:
        pass

    # ── Company name and info (right of logo) ──
    text_x = 5 * mm + 40 * mm
    name_y = header_top - 12 * mm

    # Company name
    c.setFillColor(BROWN_DARK)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(text_x, name_y, "LE TATCHE BOIS")

    # Type + Activity on same line
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(GOLD_DARK)
    type_text = COMPANY["type"]
    c.drawString(text_x, name_y - 15, type_text)
    type_w = c.stringWidth(type_text, "Helvetica-Bold", 10)
    c.setFont("Helvetica", 8)
    c.setFillColor(BROWN_MEDIUM)
    c.drawString(text_x + type_w + 5, name_y - 15, f"•  {COMPANY['activity']}")

    # Contact info below
    c.setFont("Helvetica", 8.5)
    c.setFillColor(GRAY_DARK)
    c.drawString(text_x, name_y - 30, f"Tél : {COMPANY['tel1']}  /  {COMPANY['tel2']}")
    c.drawString(text_x, name_y - 41, f"Email : {COMPANY['email']}")

    # ── Address (right aligned) ──
    right_x = W - margin
    c.setFont("Helvetica", 9)
    c.setFillColor(GRAY_DARK)
    c.drawRightString(right_x, name_y - 30, COMPANY["address"])
    c.drawRightString(right_x, name_y - 41, COMPANY["city"])

    # ── Bottom gold gradient line (separator) ──
    draw_gold_gradient_bar(c, 0, header_bottom + 1 * mm, W, 3 * mm)

    # ── Document type title (if specified) ──
    if doc_type:
        title_y = header_bottom - 6 * mm  # moved up 1cm

        # Auto-scale font - reduced 30% (was 16, now 11)
        title_text = doc_type.upper()
        if doc_number:
            title_text += f"  N° : {doc_number}"
        
        font_size = 11.5
        while font_size > 8 and c.stringWidth(title_text, "Helvetica-Bold", font_size) > W - 2 * margin:
            font_size -= 0.5

        # All elements start at same left X
        left_x = margin

        c.setFillColor(BROWN_DARK)
        c.setFont("Helvetica-Bold", font_size)
        c.drawString(left_x, title_y, title_text)

        # Date - same left_x start, bold
        date_y = title_y - 16
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(BROWN_DARK)
        if doc_date:
            c.drawString(left_x, date_y, f"Date :  {doc_date}")

        fields_y = date_y - 16  # start for additional fields
        return (title_y, fields_y, left_x)  # tuple: title_y, fields_start, left_x

    return (header_bottom - 10 * mm, header_bottom - 20 * mm, margin)


def draw_footer(c):
    """Draw the professional footer with legal info"""
    margin = 25 * mm
    footer_top = 22 * mm

    # ── Gold gradient bar (separator at top of footer) ──
    draw_gold_gradient_bar(c, 0, footer_top, W, 3 * mm)

    # ── Footer background ──
    c.setFillColor(Color(1, 0.98, 0.95, alpha=0.6))
    c.rect(0, 0, W, footer_top, fill=1, stroke=0)

    # ── Legal identifiers ──
    y = footer_top - 5 * mm
    c.setFont("Helvetica", 7.5)
    c.setFillColor(GRAY_DARK)
    c.drawCentredString(W / 2, y, f"{COMPANY['address']} - {COMPANY['city']}")

    # Line 2: Legal identifiers with bold labels
    y -= 8
    items = [
        ("RC : ", COMPANY["rc"]),
        ("  |  IF : ", COMPANY["if_num"]),
        ("  |  ICE : ", COMPANY["ice"]),
        ("  |  PAT : ", COMPANY["pat"]),
    ]
    
    # Calculate total width
    total_w = 0
    for label, value in items:
        total_w += c.stringWidth(label, "Helvetica-Bold", 7)
        total_w += c.stringWidth(value, "Helvetica", 7)
    
    x_pos = (W - total_w) / 2
    for label, value in items:
        c.setFont("Helvetica-Bold", 7)
        c.setFillColor(BROWN_DARK)
        c.drawString(x_pos, y, label)
        x_pos += c.stringWidth(label, "Helvetica-Bold", 7)
        c.setFont("Helvetica", 7)
        c.setFillColor(GRAY_DARK)
        c.drawString(x_pos, y, value)
        x_pos += c.stringWidth(value, "Helvetica", 7)

    # Line 3: Contact
    y -= 8
    c.setFont("Helvetica", 7)
    c.setFillColor(GRAY_DARK)
    c.drawCentredString(W / 2, y, f"Email : {COMPANY['email']}  |  contact@letatchebois.com  |  Tél : {COMPANY['tel1']} / {COMPANY['tel2']}")
    y -= 8
    c.setFont("Helvetica-Bold", 7)
    c.setFillColor(GOLD_DARK)
    c.drawCentredString(W / 2, y, "www.letatchebois.com")


def draw_client_box(c, y_start, client_info, is_facture=True):
    """Draw client information box - clean style, compact"""
    margin = 20 * mm
    box_w = 75 * mm
    box_x = W - margin - box_w
    box_h = 28 * mm
    box_y = y_start - box_h

    # Box border only - clear background
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.rect(box_x, box_y, box_w, box_h, fill=0, stroke=1)

    # "Client :" label
    c.setFillColor(BROWN_DARK)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(box_x + 3 * mm, box_y + box_h - 5 * mm, "Client :")

    # Client name
    text_x = box_x + 3 * mm
    text_y = box_y + box_h - 12 * mm
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(BLACK)
    c.drawString(text_x, text_y, client_info.get("name", "[Nom du client]"))

    c.setFont("Helvetica", 8)
    c.setFillColor(GRAY_DARK)
    text_y -= 11
    c.drawString(text_x, text_y, client_info.get("address", "[Adresse du client]"))
    text_y -= 10
    c.drawString(text_x, text_y, client_info.get("city", "[Ville]"))

    if client_info.get("ice"):
        text_y -= 10
        c.setFont("Helvetica-Bold", 7.5)
        c.setFillColor(BROWN_DARK)
        c.drawString(text_x, text_y, f"ICE : {client_info['ice']}")

    return box_y


def number_to_french(n):
    """Convert number to French words for invoice total"""
    units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
             'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
             'dix-sept', 'dix-huit', 'dix-neuf']
    tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante',
            'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt']

    if n == 0:
        return 'zéro'

    def _convert_below_1000(num):
        if num == 0:
            return ''
        if num < 20:
            return units[num]
        if num < 100:
            t, u = divmod(num, 10)
            if t == 7 or t == 9:
                t -= 1
                u += 10
            if u == 0:
                if t == 8:
                    return 'quatre-vingts'
                return tens[t]
            if u == 1 and t not in [8, 9]:
                return f"{tens[t]} et {units[u]}"
            return f"{tens[t]}-{units[u]}"
        h, rest = divmod(num, 100)
        if h == 1:
            prefix = 'cent'
        else:
            prefix = f"{units[h]} cent"
        if rest == 0:
            if h > 1:
                return f"{prefix}s"
            return prefix
        return f"{prefix} {_convert_below_1000(rest)}"

    parts = []
    if n >= 1000000:
        m = n // 1000000
        n %= 1000000
        if m == 1:
            parts.append('un million')
        else:
            parts.append(f"{_convert_below_1000(m)} millions")
    if n >= 1000:
        k = n // 1000
        n %= 1000
        if k == 1:
            parts.append('mille')
        else:
            parts.append(f"{_convert_below_1000(k)} mille")
    if n > 0:
        parts.append(_convert_below_1000(n))

    return ' '.join(parts)


def amount_in_french(amount):
    """Convert amount like 156180.00 to French: 'Cent cinquante-six mille cent quatre-vingts Dirhams ; 00 Cts TTC'"""
    integer_part = int(amount)
    cents = int(round((amount - integer_part) * 100))
    words = number_to_french(integer_part).capitalize()
    cents_str = f"{cents:02d}"
    return f"{words} Dirhams ; {cents_str} Cts TTC"


def draw_items_table(c, y_start, items, tva_rate=0.20, show_tva=True):
    """Draw the items table - compact, clear headers, handles 15-20+ items with page overflow"""
    margin = 20 * mm
    table_w = W - 2 * margin
    footer_limit = 28 * mm  # Don't draw below this

    # Table headers - matching old invoice style
    headers = ["N°", "DÉSIGNATION", "U", "QTÉ", "P.U. HT", "TOTAL HT"]
    col_widths = [8 * mm, table_w - 68 * mm, 10 * mm, 12 * mm, 19 * mm, 19 * mm]

    # Build table data
    table_data = [headers]
    subtotal = 0
    for i, item in enumerate(items):
        total = item["qty"] * item["price"]
        subtotal += total
        row = [
            str(i + 1),
            item["desc"],
            item.get("unit", "U"),
            str(item["qty"]),
            f"{item['price']:,.2f}",
            f"{total:,.2f}",
        ]
        table_data.append(row)

    # Row height: compact (header 7mm, data 5.5mm)
    header_row_h = 7 * mm
    data_row_h = 5.5 * mm

    row_heights = [header_row_h] + [data_row_h] * (len(table_data) - 1)

    # Create table
    table = Table(table_data, colWidths=col_widths, rowHeights=row_heights)

    # Style - clear, bold, centered headers
    style = TableStyle([
        # Header row - TRANSPARENT bg (wood texture drawn separately), WHITE text
        ('BACKGROUND', (0, 0), (-1, 0), Color(0, 0, 0, alpha=0)),  # transparent
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, 0), 2),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 2),

        # Data rows - compact
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 7.5),
        ('TEXTCOLOR', (0, 1), (-1, -1), BROWN_DARK),
        ('TOPPADDING', (0, 1), (-1, -1), 1.5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 1.5),

        # Alignment
        ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # N°
        ('ALIGN', (2, 1), (3, -1), 'CENTER'),   # U + Qté
        ('ALIGN', (4, 1), (-1, -1), 'RIGHT'),   # Prices

        # Grid
        ('GRID', (0, 0), (-1, -1), 0.4, GOLD),
        ('LINEBELOW', (0, 0), (-1, 0), 1.5, GOLD_DARK),
        ('LINEABOVE', (0, 0), (-1, 0), 1.5, GOLD_DARK),
    ])

    # Alternating rows - transparent
    for i in range(1, len(table_data)):
        if i % 2 == 0:
            style.add('BACKGROUND', (0, i), (-1, i), Color(0.98, 0.96, 0.92, alpha=0.35))
        else:
            style.add('BACKGROUND', (0, i), (-1, i), Color(1, 1, 1, alpha=0.35))

    table.setStyle(style)

    # Calculate table height
    table_height = sum(row_heights)
    table.wrap(table_w, H)  # Initialize internal attributes
    table_y = y_start - table_height

    # Check if table overflows into footer zone
    if table_y < footer_limit + 45 * mm:  # Need space for totals + payment + signature
        # Split: draw what fits on page 1, continue on page 2
        available_h = y_start - footer_limit - 45 * mm
        rows_that_fit = max(1, int(available_h / data_row_h))

        # Page 1 table - draw wood texture behind header
        p1_data = table_data[:1 + rows_that_fit]
        p1_heights = row_heights[:1 + rows_that_fit]
        p1_table = Table(p1_data, colWidths=col_widths, rowHeights=p1_heights)
        p1_style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), Color(0, 0, 0, alpha=0)),
            ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, 0), 2),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 2),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 7.5),
            ('TEXTCOLOR', (0, 1), (-1, -1), BROWN_DARK),
            ('TOPPADDING', (0, 1), (-1, -1), 1.5),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 1.5),
            ('ALIGN', (0, 1), (0, -1), 'CENTER'),
            ('ALIGN', (2, 1), (3, -1), 'CENTER'),  # U + Qté
            ('ALIGN', (4, 1), (-1, -1), 'RIGHT'),  # Prices
            ('GRID', (0, 0), (-1, -1), 0.4, GOLD),
            ('LINEBELOW', (0, 0), (-1, 0), 1.5, GOLD_DARK),
            ('LINEABOVE', (0, 0), (-1, 0), 1.5, GOLD_DARK),
        ])
        for i in range(1, len(p1_data)):
            if i % 2 == 0:
                p1_style.add('BACKGROUND', (0, i), (-1, i), Color(0.98, 0.96, 0.92, alpha=0.35))
            else:
                p1_style.add('BACKGROUND', (0, i), (-1, i), Color(1, 1, 1, alpha=0.35))
        p1_table.setStyle(p1_style)
        p1_h = sum(p1_heights)
        # Draw wood texture behind header row
        _draw_wood_header_bg(c, margin, y_start - header_row_h, table_w, header_row_h)
        p1_table.wrap(table_w, H)
        p1_table.drawOn(c, margin, y_start - p1_h)

        # "Suite page suivante" mention
        c.setFont("Helvetica-Oblique", 7)
        c.setFillColor(GRAY)
        c.drawRightString(W - margin, y_start - p1_h - 4 * mm, ">>> Suite page suivante")

        draw_footer(c)
        draw_border_frame(c)
        c.showPage()

        # Page 2
        draw_wood_background(c)
        draw_header(c)
        draw_center_watermark(c, opacity=0.06)
        p2_start = H - 55 * mm

        p2_data = [headers] + table_data[1 + rows_that_fit:]
        p2_heights = [header_row_h] + [data_row_h] * (len(p2_data) - 1)
        p2_table = Table(p2_data, colWidths=col_widths, rowHeights=p2_heights)
        p2_style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), Color(0, 0, 0, alpha=0)),
            ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, 0), 2),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 2),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 7.5),
            ('TEXTCOLOR', (0, 1), (-1, -1), BROWN_DARK),
            ('TOPPADDING', (0, 1), (-1, -1), 1.5),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 1.5),
            ('ALIGN', (0, 1), (0, -1), 'CENTER'),
            ('ALIGN', (2, 1), (3, -1), 'CENTER'),  # U + Qté
            ('ALIGN', (4, 1), (-1, -1), 'RIGHT'),  # Prices
            ('GRID', (0, 0), (-1, -1), 0.4, GOLD),
            ('LINEBELOW', (0, 0), (-1, 0), 1.5, GOLD_DARK),
            ('LINEABOVE', (0, 0), (-1, 0), 1.5, GOLD_DARK),
        ])
        for i in range(1, len(p2_data)):
            if i % 2 == 0:
                p2_style.add('BACKGROUND', (0, i), (-1, i), Color(0.98, 0.96, 0.92, alpha=0.35))
            else:
                p2_style.add('BACKGROUND', (0, i), (-1, i), Color(1, 1, 1, alpha=0.35))
        p2_table.setStyle(p2_style)
        p2_h = sum(p2_heights)
        # Draw wood texture behind page 2 header row
        _draw_wood_header_bg(c, margin, p2_start - header_row_h, table_w, header_row_h)
        p2_table.wrap(table_w, H)
        p2_table.drawOn(c, margin, p2_start - p2_h)
        table_y = p2_start - p2_h
    else:
        # Draw wood texture behind header row
        _draw_wood_header_bg(c, margin, y_start - header_row_h, table_w, header_row_h)
        table.drawOn(c, margin, table_y)

    # ── Totals section (compact) ──
    totals_y = table_y - 5 * mm
    totals_x = W - margin - 60 * mm
    totals_w = 60 * mm

    tva_amount = subtotal * tva_rate if show_tva else 0
    total_ttc = subtotal + tva_amount

    # Totals box
    box_h = 25 * mm if show_tva else 15 * mm
    c.setFillColor(Color(1, 0.99, 0.96, alpha=0.5))
    c.roundRect(totals_x, totals_y - box_h, totals_w, box_h, 2, fill=1, stroke=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.5)
    c.roundRect(totals_x, totals_y - box_h, totals_w, box_h, 2, fill=0, stroke=1)

    label_x = totals_x + 3 * mm
    value_x = totals_x + totals_w - 3 * mm
    row_y = totals_y - 4 * mm

    # Total HT
    c.setFont("Helvetica", 8)
    c.setFillColor(GRAY_DARK)
    c.drawString(label_x, row_y, "Total HT")
    c.drawRightString(value_x, row_y, f"{subtotal:,.2f} DH")

    if show_tva:
        row_y -= 9
        c.drawString(label_x, row_y, f"TVA ({int(tva_rate * 100)}%)")
        c.drawRightString(value_x, row_y, f"{tva_amount:,.2f} DH")

        row_y -= 4
        c.setStrokeColor(GOLD)
        c.setLineWidth(0.5)
        c.line(label_x, row_y, value_x, row_y)

        row_y -= 9
        c.setFillColor(BROWN_DARK)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(label_x, row_y, "Total TTC")
        c.drawRightString(value_x, row_y, f"{total_ttc:,.2f} DH")
    else:
        row_y -= 4
        c.setStrokeColor(GOLD)
        c.line(label_x, row_y, value_x, row_y)
        row_y -= 9
        c.setFont("Helvetica-Oblique", 7.5)
        c.setFillColor(GRAY)
        c.drawString(label_x, row_y, "TVA non applicable")

    return totals_y - box_h - 3 * mm, total_ttc


def draw_payment_section(c, y_start, payment_info=None):
    """Draw payment method and conditions"""
    margin = 25 * mm

    if payment_info is None:
        payment_info = {
            "mode": "Virement bancaire / Espèces / Chèque",
            "bank": "[Banque]",
            "rib": "[RIB]",
        }

    y = y_start

    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(BROWN_DARK)
    c.drawString(margin, y, "Mode de paiement :")

    c.setFont("Helvetica", 8.5)
    c.setFillColor(GRAY_DARK)
    c.drawString(margin + 40 * mm, y, payment_info["mode"])

    return y - 8 * mm


def draw_signature_section(c, y_start):
    """Draw signature boxes - compact"""
    margin = 20 * mm

    y = y_start
    box_w = 55 * mm
    box_h = 18 * mm

    # Vendor signature
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(BROWN_DARK)
    c.drawString(margin, y, "Cachet et signature du vendeur")
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.5)
    c.setDash(2, 2)
    c.rect(margin, y - box_h, box_w, box_h - 3, fill=0, stroke=1)
    c.setDash()

    # Client signature
    client_x = W - margin - box_w
    c.drawString(client_x, y, "Cachet et signature du client")
    c.setDash(2, 2)
    c.rect(client_x, y - box_h, box_w, box_h - 3, fill=0, stroke=1)
    c.setDash()


def create_letterhead(filename="papier_entete.pdf"):
    """Create blank letterhead"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    c = canvas.Canvas(filepath, pagesize=A4)
    c.setTitle("LE TATCHE BOIS - Papier En-Tête")
    c.setAuthor("LE TATCHE BOIS")

    draw_wood_background(c)
    draw_header(c)
    draw_footer(c)
    draw_border_frame(c)

    # ── Centered logo watermark ──
    draw_center_watermark(c, opacity=0.06)

    c.save()
    return filepath


def create_facture(filename="facture_template.pdf"):
    """Create invoice template conforming to Moroccan CGI art. 145"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    c = canvas.Canvas(filepath, pagesize=A4)
    c.setTitle("LE TATCHE BOIS - Facture")
    c.setAuthor("LE TATCHE BOIS")

    draw_wood_background(c)
    draw_center_watermark(c, opacity=0.06)

    # Sample data - 15 items to demo space handling
    sample_items = [
        {"desc": "Porte en bois massif sur mesure (chêne)", "qty": 2, "price": 3500.00},
        {"desc": "Fenêtre en bois avec vitrage double", "qty": 4, "price": 2200.00},
        {"desc": "Meuble TV en noyer - Design moderne", "qty": 1, "price": 4800.00},
        {"desc": "Étagère murale en cèdre (200x80cm)", "qty": 3, "price": 1500.00},
        {"desc": "Cuisine complète en bois massif", "qty": 1, "price": 18000.00},
        {"desc": "Plan de travail en noyer (300x65cm)", "qty": 1, "price": 4500.00},
        {"desc": "Placards muraux sur mesure", "qty": 6, "price": 2800.00},
        {"desc": "Table à manger en chêne (240x100cm)", "qty": 1, "price": 7500.00},
        {"desc": "Chaises assorties en bois", "qty": 8, "price": 850.00},
        {"desc": "Bibliothèque murale sur mesure", "qty": 1, "price": 5200.00},
        {"desc": "Parquet en bois massif (salon 35m²)", "qty": 35, "price": 450.00},
        {"desc": "Escalier en bois avec rampe sculptée", "qty": 1, "price": 12000.00},
        {"desc": "Dressing chambre principale", "qty": 1, "price": 9500.00},
        {"desc": "Finition et vernissage - Ensemble", "qty": 1, "price": 5000.00},
        {"desc": "Transport et installation complète", "qty": 1, "price": 4000.00},
    ]

    sample_client = {
        "name": "[Nom / Raison sociale du client]",
        "address": "[Adresse du client]",
        "city": "[Ville]",
        "ice": "[ICE du client]",
    }

    # Draw elements
    title_y, fields_y, left_x = draw_header(c, doc_type="FACTURE", doc_number="F-2026/0001", doc_date="__/__/2026")
    
    # Left side: reference fields - same left_x, 16pt spacing
    LINE_H = 16
    fy = fields_y
    c.setFont("Helvetica", 9)
    c.setFillColor(GRAY_DARK)
    c.drawString(left_x, fy, "Réf. Bon de commande :  ____________________")
    fy -= LINE_H
    c.drawString(left_x, fy, "Réf. Bon de livraison :    ____________________")
    left_bottom = fy
    
    # Right side: client box top aligned with title
    client_bottom = draw_client_box(c, title_y + 3, sample_client)

    # Table starts below whichever is lower
    table_y = min(left_bottom, client_bottom) - 4 * mm
    after_table_y, total_ttc = draw_items_table(c, table_y, sample_items, tva_rate=0.20, show_tva=True)

    # Amount in letters
    margin = 20 * mm
    arr_y = after_table_y + 1 * mm
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(BROWN_DARK)
    c.drawString(margin, arr_y, "*****Arrêté la présente facture à la somme de : ******")
    arr_y -= 10
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(margin, arr_y, f"*** {amount_in_french(total_ttc)} ***")

    # Payment (compact)
    payment_y = draw_payment_section(c, arr_y - 5 * mm)

    # Signatures (compact)
    draw_signature_section(c, payment_y + 3 * mm)

    # Footer
    draw_footer(c)
    draw_border_frame(c)

    # ── "Acquittée" watermark area (small text at bottom left) ──
    margin = 25 * mm
    c.setFont("Helvetica-Oblique", 7)
    c.setFillColor(GRAY)
    c.drawString(margin, 27 * mm, "Mention « Acquittée » + date si paiement reçu")

    c.save()
    return filepath


def create_devis(filename="devis_template.pdf"):
    """Create quotation template"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    c = canvas.Canvas(filepath, pagesize=A4)
    c.setTitle("LE TATCHE BOIS - Devis")
    c.setAuthor("LE TATCHE BOIS")

    draw_wood_background(c)

    draw_center_watermark(c, opacity=0.06)
    # Sample data
    sample_items = [
        {"desc": "Cuisine complète en bois massif (chêne)", "qty": 1, "price": 25000.00},
        {"desc": "Plan de travail en noyer (300x65cm)", "qty": 1, "price": 4500.00},
        {"desc": "Placards muraux sur mesure (x6)", "qty": 6, "price": 2800.00},
        {"desc": "Îlot central avec rangements", "qty": 1, "price": 8500.00},
        {"desc": "Finition et vernissage", "qty": 1, "price": 3500.00},
        {"desc": "Transport et installation", "qty": 1, "price": 2500.00},
    ]

    sample_client = {
        "name": "[Nom / Raison sociale du client]",
        "address": "[Adresse du client]",
        "city": "[Ville]",
        "ice": "[ICE du client si professionnel]",
    }

    # Draw elements
    title_y, fields_y, left_x = draw_header(c, doc_type="DEVIS", doc_number="D-2026/0001", doc_date="__/__/2026")
    
    # Left side fields
    LINE_H = 16
    fy = fields_y
    c.setFont("Helvetica", 9)
    c.setFillColor(GRAY_DARK)
    c.drawString(left_x, fy, "Validité :  30 jours")
    fy -= LINE_H
    c.drawString(left_x, fy, "Nature :    Menuiserie bois")
    left_bottom = fy
    
    # Client box
    client_bottom = draw_client_box(c, title_y + 3, sample_client)

    # Items table
    table_y = min(left_bottom, client_bottom) - 4 * mm
    after_table_y, _ttc = draw_items_table(c, table_y, sample_items, tva_rate=0.20, show_tva=True)

    # Validity & conditions
    margin = 25 * mm
    cond_y = after_table_y

    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(BROWN_DARK)
    c.drawString(margin, cond_y, "Conditions :")

    c.setFont("Helvetica", 8)
    c.setFillColor(GRAY_DARK)
    conditions = [
        "• Validité du devis : 30 jours à compter de la date d'émission",
        "• Acompte de 50% à la commande, solde à la livraison",
        "• Délai de réalisation : à convenir après confirmation",
        "• Garantie : 1 an sur les travaux de menuiserie",
    ]
    for i, cond in enumerate(conditions):
        c.drawString(margin, cond_y - 12 - (i * 10), cond)

    # Signatures
    draw_signature_section(c, cond_y - 60)

    # Mention bon pour accord
    c.setFont("Helvetica-Oblique", 7.5)
    c.setFillColor(GRAY)
    c.drawString(W - margin - 60 * mm, cond_y - 85, 'Mention manuscrite "Bon pour accord"')

    # Footer
    draw_footer(c)
    draw_border_frame(c)

    c.save()
    return filepath


def create_bon_livraison(filename="bon_livraison_template.pdf"):
    """Create delivery note template"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    c = canvas.Canvas(filepath, pagesize=A4)
    c.setTitle("LE TATCHE BOIS - Bon de Livraison")
    c.setAuthor("LE TATCHE BOIS")

    draw_wood_background(c)

    draw_center_watermark(c, opacity=0.06)
    sample_items = [
        {"desc": "Porte en bois massif sur mesure (chêne)", "qty": 2, "price": 0},
        {"desc": "Fenêtre en bois avec vitrage double", "qty": 4, "price": 0},
        {"desc": "Meuble TV en noyer - Design moderne", "qty": 1, "price": 0},
    ]

    sample_client = {
        "name": "[Nom du client]",
        "address": "[Adresse de livraison]",
        "city": "[Ville]",
    }

    # Draw elements
    title_y, fields_y, left_x = draw_header(c, doc_type="BON DE LIVRAISON", doc_number="BL-2026/0001", doc_date="__/__/2026")
    
    # Reference fields
    line_h = 16
    fy = fields_y
    c.setFont("Helvetica", 9)
    c.setFillColor(GRAY_DARK)
    c.drawString(left_x, fy, "Réf. Facture :  ____________________")
    fy -= line_h
    c.drawString(left_x, fy, "Réf. Devis :     ____________________")
    left_bottom = fy
    
    client_bottom = draw_client_box(c, title_y + 3, sample_client, is_facture=False)

    # Simplified table (no prices)
    margin = 20 * mm
    table_y = min(left_bottom, client_bottom) - 4 * mm
    headers = ["N°", "Désignation", "Qté", "Observations"]
    col_widths = [12 * mm, 80 * mm, 15 * mm, 53 * mm]

    table_data = [headers]
    for i, item in enumerate(sample_items):
        table_data.append([str(i + 1), item["desc"], str(item["qty"]), ""])

    while len(table_data) < 8:
        table_data.append(["", "", "", ""])

    table = Table(table_data, colWidths=col_widths)
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BROWN_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), GOLD_LIGHT),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('TEXTCOLOR', (0, 1), (-1, -1), GRAY_DARK),
        ('ALIGN', (0, 1), (0, -1), 'CENTER'),
        ('ALIGN', (2, 1), (3, -1), 'CENTER'),  # U + Qté
        ('GRID', (0, 0), (-1, -1), 0.5, GOLD),
        ('LINEBELOW', (0, 0), (-1, 0), 1.5, GOLD_DARK),
    ])
    for i in range(1, len(table_data)):
        if i % 2 == 0:
            style.add('BACKGROUND', (0, i), (-1, i), Color(0.98, 0.96, 0.92, alpha=0.4))
        else:
            style.add('BACKGROUND', (0, i), (-1, i), Color(1, 1, 1, alpha=0.4))
    table.setStyle(style)

    table_height = table.wrap(W - 2 * margin, H)[1]
    table.drawOn(c, margin, table_y - table_height)

    # Signatures
    draw_signature_section(c, table_y - table_height - 20 * mm)

    # Footer
    draw_footer(c)
    draw_border_frame(c)

    c.save()
    return filepath


# ─── GENERATE ALL DOCUMENTS ─────────────────────────────────────

def create_attachement(filename="attachement_template.pdf"):
    """Create Attachement template - work progress tracking"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    c = canvas.Canvas(filepath, pagesize=A4)
    c.setTitle("LE TATCHE BOIS - Attachement")
    c.setAuthor("LE TATCHE BOIS")

    draw_wood_background(c)
    draw_center_watermark(c, opacity=0.06)

    sample_items = [
        {"desc": "Fourniture et pose portes intérieures en bois hêtre", "unit": "U", "qty": 12, "price": 1500.00},
        {"desc": "Fourniture et pose chambranles en bois", "unit": "ML", "qty": 48, "price": 120.00},
        {"desc": "Fourniture et pose plinthes en bois hêtre", "unit": "ML", "qty": 85, "price": 80.00},
        {"desc": "Fourniture et pose placards muraux cuisine", "unit": "ENS", "qty": 1, "price": 22000.00},
        {"desc": "Fourniture et pose plan de travail bois massif", "unit": "ML", "qty": 4, "price": 2500.00},
        {"desc": "Fourniture et pose étagères en bois cèdre", "unit": "U", "qty": 6, "price": 850.00},
        {"desc": "Fourniture vernis transparent mat - Application", "unit": "U", "qty": 12, "price": 380.00},
    ]

    sample_client = {
        "name": "[Nom du maître d'ouvrage]",
        "address": "[Adresse du chantier]",
        "city": "[Ville]",
        "ice": "[ICE du client]",
    }

    title_y, fields_y, left_x = draw_header(c, doc_type="ATTACHEMENT", doc_number="ATT-2026/0001", doc_date="__/__/2026")

    # Attachement-specific fields
    line_h = 16
    fy = fields_y
    c.setFont("Helvetica", 9)
    c.setFillColor(GRAY_DARK)
    c.drawString(left_x, fy, "Nature :          Menuiserie bois")
    fy -= line_h
    c.drawString(left_x, fy, "Marché N° :    ____________________")
    left_bottom = fy

    client_bottom = draw_client_box(c, title_y + 3, sample_client)

    table_y = min(left_bottom, client_bottom) - 4 * mm
    after_table_y, total_ttc = draw_items_table(c, table_y, sample_items, tva_rate=0.20, show_tva=True)

    margin = 20 * mm
    arr_y = after_table_y + 1 * mm
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(BROWN_DARK)
    c.drawString(margin, arr_y, "*****Arrêté le présent attachement à la somme de : ******")
    arr_y -= 10
    c.drawString(margin, arr_y, f"*** {amount_in_french(total_ttc)} ***")

    draw_signature_section(c, arr_y - 8 * mm)
    draw_footer(c)
    draw_border_frame(c)
    c.save()
    return filepath


def create_situation_travaux(filename="situation_travaux_template.pdf"):
    """Create Situation de Travaux template - progress billing"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    c = canvas.Canvas(filepath, pagesize=A4)
    c.setTitle("LE TATCHE BOIS - Situation de Travaux")
    c.setAuthor("LE TATCHE BOIS")

    draw_wood_background(c)
    draw_center_watermark(c, opacity=0.06)

    sample_items = [
        {"desc": "Portes intérieures en bois hêtre (lot complet)", "unit": "U", "qty": 24, "price": 1500.00},
        {"desc": "Chambranles et finitions", "unit": "ML", "qty": 96, "price": 120.00},
        {"desc": "Cuisine complète en bois massif", "unit": "ENS", "qty": 1, "price": 35000.00},
        {"desc": "Dressing chambre principale", "unit": "ENS", "qty": 1, "price": 18000.00},
        {"desc": "Parquet bois massif - Salon + Chambres", "unit": "M²", "qty": 65, "price": 450.00},
        {"desc": "Vernissage et finition ensemble", "unit": "ENS", "qty": 1, "price": 8000.00},
    ]

    sample_client = {
        "name": "[Nom du maître d'ouvrage]",
        "address": "[Adresse du chantier]",
        "city": "[Ville]",
        "ice": "[ICE du client]",
    }

    title_y, fields_y, left_x = draw_header(c, doc_type="SITUATION DE TRAVAUX", doc_number="ST-2026/0001", doc_date="__/__/2026")

    # Left side fields
    # Left side fields
    line_h = 16
    fy = fields_y
    c.setFont("Helvetica", 9)
    c.setFillColor(GRAY_DARK)
    c.drawString(left_x, fy, "Nature :          Menuiserie bois")
    fy -= line_h
    c.drawString(left_x, fy, "Situation N° :  ___  /  Période : du __/__/___ au __/__/___")
    fy -= line_h
    c.drawString(left_x, fy, "Marché N° :    ____________________")
    left_bottom = fy

    client_bottom = draw_client_box(c, title_y + 3, sample_client)

    table_y = min(left_bottom, client_bottom) - 4 * mm
    after_table_y, total_ttc = draw_items_table(c, table_y, sample_items, tva_rate=0.20, show_tva=True)

    margin = 20 * mm
    arr_y = after_table_y + 1 * mm
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(BROWN_DARK)
    c.drawString(margin, arr_y, "*****Arrêté la présente situation à la somme de : ******")
    arr_y -= 10
    c.drawString(margin, arr_y, f"*** {amount_in_french(total_ttc)} ***")

    draw_signature_section(c, arr_y - 8 * mm)
    draw_footer(c)
    draw_border_frame(c)
    c.save()
    return filepath


def create_fin_travaux(filename="fin_travaux_template.pdf"):
    """Create PV de Réception / Fin de Travaux template"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    c = canvas.Canvas(filepath, pagesize=A4)
    c.setTitle("LE TATCHE BOIS - PV Fin de Travaux")
    c.setAuthor("LE TATCHE BOIS")

    draw_wood_background(c)
    draw_center_watermark(c, opacity=0.06)

    title_y, fields_y, left_x = draw_header(c, doc_type="PV DE RÉCEPTION — FIN DE TRAVAUX", doc_number="PV-2026/0001", doc_date="__/__/2026")

    line_h = 16
    label_x = left_x
    val_x = left_x + 44 * mm
    y = fields_y

    # Client / Project info - consistent 16pt spacing, aligned columns
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(BROWN_DARK)
    c.drawString(label_x, y, "Maître d'ouvrage :")
    c.setFont("Helvetica", 9)
    c.setFillColor(BLACK)
    c.drawString(val_x, y, "[Nom du client]")

    y -= line_h
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(BROWN_DARK)
    c.drawString(label_x, y, "Adresse du chantier :")
    c.setFont("Helvetica", 9)
    c.setFillColor(BLACK)
    c.drawString(val_x, y, "[Adresse]")

    y -= line_h
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(BROWN_DARK)
    c.drawString(label_x, y, "Nature des travaux :")
    c.setFont("Helvetica", 9)
    c.setFillColor(BLACK)
    c.drawString(val_x, y, "Menuiserie bois")

    y -= line_h
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(BROWN_DARK)
    c.drawString(label_x, y, "Réf. Devis / Marché :")
    c.setFont("Helvetica", 9)
    c.drawString(val_x, y, "____________________")

    y -= line_h
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(BROWN_DARK)
    c.drawString(label_x, y, "Date début travaux :")
    c.setFont("Helvetica", 9)
    c.drawString(val_x, y, "___/___/______")
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(BROWN_DARK)
    c.drawString(label_x + 80 * mm, y, "Date fin travaux :")
    c.setFont("Helvetica", 9)
    c.drawString(label_x + 80 * mm + 38 * mm, y, "___/___/______")

    # Body text
    y -= line_h * 2
    c.setFont("Helvetica", 9.5)
    c.setFillColor(BLACK)
    lines = [
        "En date de ce jour, nous soussignés :",
        "",
        "• L'entreprise LE TATCHE BOIS, représentée par ________________________________",
        "• Le maître d'ouvrage, représenté par ________________________________________",
        "",
        "Avons procédé à la réception des travaux de menuiserie bois décrits ci-dessus.",
        "",
        "Les travaux ont été exécutés conformément au devis / marché référencé ci-dessus.",
        "",
        "□  Réception SANS réserves",
        "□  Réception AVEC réserves (voir liste ci-dessous)",
        "",
        "Réserves éventuelles :",
        "___________________________________________________________________________",
        "___________________________________________________________________________",
        "___________________________________________________________________________",
        "",
        "Délai de levée des réserves : _______ jours",
        "",
        "Le présent procès-verbal est établi en deux exemplaires originaux.",
    ]
    for line in lines:
        c.drawString(left_x, y, line)
        y -= 13

    # Signatures
    margin = 20 * mm
    y -= 10
    sig_y = y
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(BROWN_DARK)
    c.drawString(margin, sig_y, "Pour l'entreprise")
    c.drawRightString(W - margin, sig_y, "Pour le maître d'ouvrage")

    sig_y -= 10
    c.setFont("Helvetica", 7.5)
    c.setFillColor(GRAY_DARK)
    c.drawString(margin, sig_y, "Cachet, signature et date")
    c.drawRightString(W - margin, sig_y, "Cachet, signature et date")

    # Signature boxes
    sig_y -= 5
    box_w = 60 * mm
    box_h = 22 * mm
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.5)
    c.setDash(3, 3)
    c.rect(margin, sig_y - box_h, box_w, box_h, fill=0, stroke=1)
    c.rect(W - margin - box_w, sig_y - box_h, box_w, box_h, fill=0, stroke=1)
    c.setDash()

    draw_footer(c)
    draw_border_frame(c)
    c.save()
    return filepath


if __name__ == "__main__":
    print("🔨 Generating LE TATCHE BOIS documents...")
    
    f1 = create_letterhead()
    print(f"✅ Papier en-tête: {f1}")
    
    f2 = create_facture()
    print(f"✅ Facture: {f2}")
    
    f3 = create_devis()
    print(f"✅ Devis: {f3}")
    
    f4 = create_bon_livraison()
    print(f"✅ Bon de livraison: {f4}")
    
    f5 = create_attachement()
    print(f"✅ Attachement: {f5}")
    
    f6 = create_situation_travaux()
    print(f"✅ Situation de travaux: {f6}")
    
    f7 = create_fin_travaux()
    print(f"✅ PV Fin de travaux: {f7}")
    
    print("\n🎉 All 7 documents generated successfully!")
