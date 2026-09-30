from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.inventory import Inventory
from app.db.models.facility import Facility
from app.db.models.medicine import Medicine
from app.services.demand_forecasting import calculate_stockout_forecast

router = APIRouter()

@router.get("/facility/{facility_id}/medicine/{medicine_id}")
def get_single_forecast(facility_id: int, medicine_id: int, db: Session = Depends(get_db)):
    result = calculate_stockout_forecast(db, facility_id, medicine_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.get("/critical-watchlist")
def get_critical_watchlist(
    state: Optional[str] = None,
    district: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Returns top facilities and drugs at imminent risk of stockout."""
    q = db.query(Inventory).join(Facility).join(Medicine).filter(Inventory.days_to_stockout <= 14)
    if state:
        q = q.filter(Facility.state == state)
    if district:
        q = q.filter(Facility.district == district)
        
    q = q.order_by(Inventory.days_to_stockout.asc())
    items = q.limit(limit).all()
    
    return {
        "count": len(items),
        "watchlist": [
            {
                "facility_id": inv.facility_id,
                "facility_name": inv.facility.name,
                "facility_type": inv.facility.facility_type,
                "district": inv.facility.district,
                "state": inv.facility.state,
                "medicine_id": inv.medicine_id,
                "medicine_name": inv.medicine.name,
                "category": inv.medicine.category,
                "current_stock": inv.current_stock,
                "daily_burn": inv.daily_burn_rate,
                "days_to_stockout": inv.days_to_stockout,
                "status": inv.status,
                "requires_cold_chain": inv.medicine.requires_cold_chain
            }
            for inv in items
        ]
    }
