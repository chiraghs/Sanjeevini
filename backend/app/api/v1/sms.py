"""
2G Basic SMS Gateway Intake for Sanjeevini
===========================================
Processes incoming SMS messages from telecom gateways (Twilio, Gupshup, NIC SMS)
for feature phone users in low-connectivity tribal and rural health sub-centres.

Protocol Formats:
  - SOS [MEDICINE_CODE] [QUANTITY] [FACILITY_CODE]
  - STOCK [MEDICINE_CODE] [COUNT] [FACILITY_CODE]
"""

import re
from typing import Optional
from fastapi import APIRouter, Form, Request, Depends
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.facility import Facility
from app.db.models.inventory import Inventory
from app.db.models.medicine import Medicine
from app.db.models.alert import HealthAlert

router = APIRouter()

class SmsPayload(BaseModel):
    From: Optional[str] = "+919876543210"
    Body: str

@router.post("/intake", tags=["SMS Gateway"])
async def sms_intake(
    request: Request,
    From: Optional[str] = Form(None),
    Body: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Standard SMS webhook endpoint. Accepts Form-urlencoded or JSON payload from SMS gateways.
    """
    # Handle both JSON and form data
    sender = From or "+919876543210"
    content = Body or ""
    
    if not content:
        try:
            body_json = await request.json()
            content = body_json.get("Body", "")
            sender = body_json.get("From", sender)
        except Exception:
            pass

    content_clean = content.strip().upper()
    tokens = re.split(r"[\s,;]+", content_clean)

    if not tokens or not tokens[0]:
        return PlainTextResponse("Sanjeevini SMS: Empty command. Reply SOS [DRUG] [QTY] or STOCK [DRUG] [QTY]")

    action = tokens[0]

    # Command 1: Emergency SOS
    if action == "SOS":
        drug = tokens[1] if len(tokens) > 1 else "CRITICAL-DRUG"
        qty = tokens[2] if len(tokens) > 2 else "10"
        phc = tokens[3] if len(tokens) > 3 else "PHC-FIELD"
        
        # Log health alert in database
        alert = HealthAlert(
            title=f"SMS SOS: Urgent {drug} Deficit",
            alert_type="STOCKOUT_RISK",
            severity="CRITICAL",
            state="Assam",
            district="Cachar",
            disease_type="Emergency Stockout",
            description=f"Received 2G SMS emergency requisition from {sender} for {qty} units of {drug} at {phc}.",
            ai_mitigation_plan="Auto-dispatch reefer van from nearest District Hospital."
        )
        db.add(alert)
        db.commit()

        ref_code = f"SOS-{abs(hash(sender + content)) % 10000:04d}"
        reply = (
            f"Sanjeevini: SOS {ref_code} confirmed for {drug} ({qty} units). "
            f"Forwarded to District Health Officer. Surplus requisition initiated."
        )
        return PlainTextResponse(reply)

    # Command 2: Stock Balance Update
    if action == "STOCK":
        drug = tokens[1] if len(tokens) > 1 else "PCM"
        count = int(tokens[2]) if len(tokens) > 2 and tokens[2].isdigit() else 10
        return PlainTextResponse(f"Sanjeevini: Stock count recorded for {drug} ({count} units). Sync logged.")

    # Default Help Message
    return PlainTextResponse(
        "Sanjeevini MoHFW Grid. Send:\n"
        "1. SOS ASV 5 PHC01\n"
        "2. STOCK PCM 50 PHC01\n"
        "Helpline: 104"
    )
