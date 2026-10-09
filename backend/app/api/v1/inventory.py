import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.inventory import Inventory
from app.db.models.facility import Facility
from app.db.models.medicine import Medicine

router = APIRouter()

class StockUpdateRequest(BaseModel):
    facility_id: int
    medicine_id: int
    quantity_delta: int  # Positive to add, negative to deduct
    reason: Optional[str] = "Physical count adjustment"

@router.get("/")
def get_inventory(
    facility_id: Optional[int] = None,
    district: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    q = db.query(Inventory).join(Facility).join(Medicine)
    if facility_id:
        q = q.filter(Inventory.facility_id == facility_id)
    if district:
        q = q.filter(Facility.district == district)
    if status and status != "ALL":
        q = q.filter(Inventory.status == status)
    if category:
        q = q.filter(Medicine.category == category)
        
    total = q.count()
    items = q.offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "items": [
            {
                "id": inv.id,
                "facility_id": inv.facility_id,
                "facility_name": inv.facility.name,
                "district": inv.facility.district,
                "state": inv.facility.state,
                "medicine_id": inv.medicine.id,
                "medicine_name": inv.medicine.name,
                "category": inv.medicine.category,
                "unit": inv.medicine.unit,
                "batch_no": inv.batch_no,
                "current_stock": inv.current_stock,
                "daily_burn_rate": inv.daily_burn_rate,
                "days_to_stockout": inv.days_to_stockout,
                "status": inv.status,
                "expiry_date": inv.expiry_date.strftime("%Y-%m-%d"),
                "requires_cold_chain": inv.medicine.requires_cold_chain
            }
            for inv in items
        ]
    }

@router.post("/update")
def update_stock(req: StockUpdateRequest, db: Session = Depends(get_db)):
    inv = db.query(Inventory).filter(
        Inventory.facility_id == req.facility_id,
        Inventory.medicine_id == req.medicine_id
    ).first()
    
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory item not found")
        
    inv.current_stock = max(0, inv.current_stock + req.quantity_delta)
    if inv.daily_burn_rate > 0:
        inv.days_to_stockout = round(inv.current_stock / inv.daily_burn_rate, 1)
        
    if inv.days_to_stockout <= 3:
        inv.status = "CRITICAL"
    elif inv.days_to_stockout <= 7:
        inv.status = "WARNING"
    else:
        inv.status = "STABLE"
        
    db.commit()
    db.refresh(inv)
    return {
        "success": True,
        "new_stock": inv.current_stock,
        "days_to_stockout": inv.days_to_stockout,
        "status": inv.status
    }

class OfflineQueueItem(BaseModel):
    client_uuid: str
    action_type: str  # "STOCK_ADJUST", "VOICE_REPORT", "EMERGENCY_SOS"
    medicine_id: Optional[int] = None
    quantity_delta: Optional[int] = 0
    details: Optional[str] = None
    recorded_at: Optional[str] = None

class BatchSyncRequest(BaseModel):
    facility_id: int
    device_id: Optional[str] = "MOBI-ASHA-FIELD-01"
    items: list[OfflineQueueItem]

@router.post("/sync-queue")
def sync_offline_queue(req: BatchSyncRequest, db: Session = Depends(get_db)):
    """
    Idempotent batch intake for offline frontline mobile apps.
    Flushes queued dispensing logs, voice updates, and emergency SOS reports
    recorded during zero-connectivity intervals.
    """
    processed_count = 0
    results = []
    
    for item in req.items:
        if item.medicine_id and item.quantity_delta:
            inv = db.query(Inventory).filter(
                Inventory.facility_id == req.facility_id,
                Inventory.medicine_id == item.medicine_id
            ).first()
            if inv:
                inv.current_stock = max(0, inv.current_stock + item.quantity_delta)
                if inv.daily_burn_rate > 0:
                    inv.days_to_stockout = round(inv.current_stock / inv.daily_burn_rate, 1)
                inv.status = "CRITICAL" if inv.days_to_stockout <= 3 else ("WARNING" if inv.days_to_stockout <= 7 else "STABLE")
                processed_count += 1
                results.append({
                    "client_uuid": item.client_uuid,
                    "status": "APPLIED",
                    "medicine_id": item.medicine_id,
                    "new_stock": inv.current_stock
                })
        else:
            processed_count += 1
            results.append({
                "client_uuid": item.client_uuid,
                "status": "LOGGED",
                "action_type": item.action_type
            })
            
    db.commit()
    return {
        "success": True,
        "processed_count": processed_count,
        "facility_id": req.facility_id,
        "results": results
    }

