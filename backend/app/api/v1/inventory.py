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
