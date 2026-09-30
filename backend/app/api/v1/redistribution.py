import uuid
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.redistribution import RedistributionTransfer
from app.db.models.facility import Facility
from app.db.models.medicine import Medicine
from app.services.redistribution_engine import generate_redistribution_recommendations

router = APIRouter()

class DispatchApprovalRequest(BaseModel):
    source_facility_id: int
    destination_facility_id: int
    medicine_id: int
    quantity: int
    batch_no: Optional[str] = "BATCH-AUTO"
    driver_name: Optional[str] = "Ramesh Kumar"
    driver_phone: Optional[str] = "+91 98765 43210"
    vehicle_no: Optional[str] = "DL-01-AX-9942"
    urgency: Optional[str] = "URGENT"
    notes: Optional[str] = "Approved via DMO Fast-Track Emergency Redistribution"

@router.get("/recommendations")
def get_recommendations(district: Optional[str] = None, db: Session = Depends(get_db)):
    recs = generate_redistribution_recommendations(db, district)
    return {"count": len(recs), "recommendations": recs}

@router.post("/dispatch")
def approve_dispatch(req: DispatchApprovalRequest, db: Session = Depends(get_db)):
    code = f"TRF-{datetime.date.today().strftime('%Y%m%d')}-{uuid.uuid4().hex[:5].upper()}"
    transfer = RedistributionTransfer(
        transfer_code=code,
        source_facility_id=req.source_facility_id,
        destination_facility_id=req.destination_facility_id,
        medicine_id=req.medicine_id,
        quantity=req.quantity,
        batch_no=req.batch_no,
        urgency=req.urgency,
        status="IN_TRANSIT",
        driver_name=req.driver_name,
        driver_phone=req.driver_phone,
        vehicle_no=req.vehicle_no,
        approval_notes=req.notes,
        dispatch_date=datetime.datetime.utcnow()
    )
    db.add(transfer)
    db.commit()
    db.refresh(transfer)
    
    return {
        "success": True,
        "transfer_code": transfer.transfer_code,
        "status": transfer.status,
        "e_challan_url": f"/api/v1/redistribution/e-challan/{transfer.transfer_code}"
    }

@router.get("/active-transfers")
def get_active_transfers(db: Session = Depends(get_db)):
    transfers = db.query(RedistributionTransfer).order_by(RedistributionTransfer.created_at.desc()).limit(20).all()
    return {
        "transfers": [
            {
                "id": t.id,
                "code": t.transfer_code,
                "source": t.source_facility.name,
                "destination": t.destination_facility.name,
                "medicine": t.medicine.name,
                "quantity": t.quantity,
                "status": t.status,
                "urgency": t.urgency,
                "distance_km": t.distance_km,
                "vehicle_no": t.vehicle_no,
                "driver_name": t.driver_name,
                "dispatch_date": t.dispatch_date.strftime("%Y-%m-%d %H:%M") if t.dispatch_date else None
            }
            for t in transfers
        ]
    }
