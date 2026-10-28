import os
import math
from PIL import Image, ImageDraw, ImageFont

def generate_ledger_image(output_path: str):
    width = 1600
    height = 1100
    
    # Cream / aged ledger paper color
    img = Image.new("RGB", (width, height), color=(248, 246, 238))
    draw = ImageDraw.Draw(img)

    # Subtle paper texture lines (ruled ledger margins)
    margin_top = 180
    margin_left = 60
    margin_right = width - 60
    margin_bottom = height - 100

    # Draw faint horizontal ledger lines
    for y in range(margin_top, margin_bottom, 38):
        draw.line([(margin_left, y), (margin_right, y)], fill=(222, 228, 235), width=1)

    # Double red margin line on left
    draw.line([(100, 40), (100, height - 40)], fill=(220, 120, 120), width=2)
    draw.line([(106, 40), (106, height - 40)], fill=(220, 120, 120), width=1)

    # Double red margin line on top
    draw.line([(60, margin_top), (width - 60, margin_top)], fill=(180, 80, 80), width=2)
    draw.line([(60, margin_top + 4), (width - 60, margin_top + 4)], fill=(180, 80, 80), width=1)

    # Load default fonts or try system fonts
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        sub_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
        table_hdr_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 19)
        table_body_font = ImageFont.truetype("/System/Library/Fonts/Courier.dfont", 21)
        stamp_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
    except Exception:
        title_font = ImageFont.load_default()
        sub_font = ImageFont.load_default()
        table_hdr_font = ImageFont.load_default()
        table_body_font = ImageFont.load_default()
        stamp_font = ImageFont.load_default()

    # Government Header
    draw.text((width // 2, 50), "NATIONAL HEALTH MISSION • GOVERNMENT OF INDIA", fill=(30, 41, 59), font=title_font, anchor="mm")
    draw.text((width // 2, 85), "DEPARTMENT OF HEALTH & FAMILY WELFARE • PRIMARY HEALTH CENTRE DISPENSARY", fill=(71, 85, 105), font=sub_font, anchor="mm")
    draw.text((width // 2, 115), "FORM XVII: ESSENTIAL DRUG STOCK & DISPENSING REGISTER (NLEM)", fill=(15, 23, 42), font=table_hdr_font, anchor="mm")

    # Meta info
    draw.text((120, 150), "FACILITY: PHC Somwarpet / Outpost Dispensary", fill=(51, 65, 85), font=sub_font)
    draw.text((width - 450, 150), "DATE: 28-OCT-2026  |  PAGE NO: 42/B", fill=(51, 65, 85), font=sub_font)

    # Column definition
    cols = [
        {"name": "S.No", "x": 120, "w": 60},
        {"name": "Medicine Name & Formulation", "x": 180, "w": 420},
        {"name": "Batch No", "x": 600, "w": 220},
        {"name": "Expiry Date", "x": 820, "w": 180},
        {"name": "Stock Qty", "x": 1000, "w": 180},
        {"name": "Dispensary Status", "x": 1180, "w": 340},
    ]

    table_header_y = margin_top + 10
    table_header_h = 45

    # Header background band
    draw.rectangle([(110, table_header_y), (margin_right, table_header_y + table_header_h)], fill=(235, 240, 248), outline=(70, 90, 120), width=2)

    # Draw header text & vertical dividing lines
    for col in cols:
        draw.text((col["x"] + 10, table_header_y + 12), col["name"], fill=(15, 23, 42), font=table_hdr_font)
        draw.line([(col["x"] + col["w"], table_header_y), (col["x"] + col["w"], margin_bottom - 120)], fill=(140, 160, 180), width=1)

    # Left & right border of table
    draw.line([(110, table_header_y), (110, margin_bottom - 120)], fill=(70, 90, 120), width=2)
    draw.line([(margin_right, table_header_y), (margin_right, margin_bottom - 120)], fill=(70, 90, 120), width=2)

    # Data Rows
    rows = [
        ("1", "Paracetamol 500mg Tablets", "BCH-2024-098", "2027-04-30", "240 Strip", "STOCK_WARNING", (180, 83, 9)),
        ("2", "ORS (Oral Rehydration Salts)", "BCH-2024-311", "2026-11-30", "85 Sachet", "CRITICAL_DEFICIT", (220, 38, 38)),
        ("3", "Anti-Snake Venom (ASV) Polyvalent", "BCH-2024-042", "2026-12-31", "4 Vial", "IMMINENT_STOCKOUT", (185, 28, 28)),
        ("4", "Oxytocin Injection 10 IU/ml", "BCH-2024-519", "2027-08-31", "50 Ampoule", "STABLE", (5, 150, 105))
    ]

    current_y = table_header_y + table_header_h

    for idx, r in enumerate(rows):
        row_h = 75
        # Alternating faint row tint
        if idx % 2 == 1:
            draw.rectangle([(110, current_y), (margin_right, current_y + row_h)], fill=(244, 243, 236))
            
        draw.line([(110, current_y + row_h), (margin_right, current_y + row_h)], fill=(180, 190, 205), width=1)

        # Ink handwriting color (blue ballpoint pen #1e3a8a / dark navy)
        pen_color = (20, 45, 95)

        draw.text((cols[0]["x"] + 15, current_y + 24), r[0], fill=pen_color, font=table_body_font)
        draw.text((cols[1]["x"] + 10, current_y + 24), r[1], fill=pen_color, font=table_body_font)
        draw.text((cols[2]["x"] + 10, current_y + 24), r[2], fill=pen_color, font=table_body_font)
        draw.text((cols[3]["x"] + 10, current_y + 24), r[3], fill=pen_color, font=table_body_font)
        draw.text((cols[4]["x"] + 10, current_y + 24), r[4], fill=(15, 23, 42), font=table_body_font)
        
        # Status pill badge
        status_bg = r[6]
        draw.rectangle([(cols[5]["x"] + 10, current_y + 18), (cols[5]["x"] + 240, current_y + 54)], fill=status_bg)
        draw.text((cols[5]["x"] + 18, current_y + 24), r[5], fill=(255, 255, 255), font=table_hdr_font)

        current_y += row_h

    # Bottom border
    draw.line([(110, margin_bottom - 120), (margin_right, margin_bottom - 120)], fill=(70, 90, 120), width=2)

    # Footer Notes & Signatures
    draw.text((120, margin_bottom - 80), "• Discrepancies reported immediately to DMO & District Warehouse via Sanjeevini Telemetry", fill=(100, 116, 139), font=sub_font)
    draw.text((120, margin_bottom - 55), "• Cold Chain Items (ASV & Oxytocin) verified at +4.0°C in ILR Refrigerator Unit 01", fill=(100, 116, 139), font=sub_font)

    # Signature line
    draw.line([(width - 480, margin_bottom - 50), (width - 150, margin_bottom - 50)], fill=(71, 85, 105), width=2)
    draw.text((width - 460, margin_bottom - 42), "Signature: Medical Officer (MOIC)", fill=(51, 65, 85), font=sub_font)

    # Official Rubber Seal Stamp (Purple ink, rotated circle)
    stamp_center = (width - 320, margin_bottom - 140)
    stamp_color = (90, 30, 150, 220)
    
    # Draw circular stamp
    cx, cy = stamp_center
    draw.ellipse([(cx - 70, cy - 70), (cx + 70, cy + 70)], outline=(110, 45, 175), width=3)
    draw.ellipse([(cx - 62, cy - 62), (cx + 62, cy + 62)], outline=(110, 45, 175), width=1)
    draw.text((cx, cy - 24), "GOVT OF INDIA", fill=(110, 45, 175), font=stamp_font, anchor="mm")
    draw.text((cx, cy), "★ PHC VERIFIED ★", fill=(110, 45, 175), font=stamp_font, anchor="mm")
    draw.text((cx, cy + 24), "AUDIT CHECKED", fill=(110, 45, 175), font=stamp_font, anchor="mm")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "JPEG", quality=95)
    print(f"Generated sample ledger photo at: {output_path}")

if __name__ == "__main__":
    out_dir = "/Volumes/DiskD/HACKATHONS/smart-health"
    generate_ledger_image(os.path.join(out_dir, "sample_ledger.jpg"))
    generate_ledger_image(os.path.join(out_dir, "frontend/public/sample_ledger.jpg"))
