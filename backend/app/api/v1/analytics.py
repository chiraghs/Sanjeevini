from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models.facility import Facility
from app.db.models.inventory import Inventory
from app.db.models.alert import HealthAlert
from app.db.models.redistribution import RedistributionTransfer

router = APIRouter()

@router.get("/national-summary")
def get_national_summary(db: Session = Depends(get_db)):
    total_facilities = db.query(Facility).count()
    phc_count = db.query(Facility).filter(Facility.facility_type == "PHC").count()
    chc_count = db.query(Facility).filter(Facility.facility_type == "CHC").count()
    dh_count = db.query(Facility).filter(Facility.facility_type == "DH").count()
    
    total_beds = db.query(func.sum(Facility.total_beds)).scalar() or 0
    occupied_beds = db.query(func.sum(Facility.occupied_beds)).scalar() or 0
    
    critical_stockouts = db.query(Inventory).filter(Inventory.days_to_stockout <= 3).count()
    warning_stockouts = db.query(Inventory).filter(Inventory.days_to_stockout > 3, Inventory.days_to_stockout <= 7).count()
    
    active_alerts = db.query(HealthAlert).filter(HealthAlert.is_active == True).count()
    active_transfers = db.query(RedistributionTransfer).filter(RedistributionTransfer.status == "IN_TRANSIT").count()
    
    return {
        "total_facilities": total_facilities,
        "facility_breakdown": {
            "PHC": phc_count,
            "CHC": chc_count,
            "DH": dh_count
        },
        "beds": {
            "total": total_beds,
            "occupied": occupied_beds,
            "available": total_beds - occupied_beds,
            "occupancy_rate_pct": round((occupied_beds / max(1, total_beds)) * 100, 1)
        },
        "inventory_health": {
            "critical_stockouts": critical_stockouts,
            "warning_stockouts": warning_stockouts,
            "national_resilience_score": round(max(60.0, 100.0 - (critical_stockouts * 0.8)), 1)
        },
        "active_alerts_count": active_alerts,
        "active_transfers_count": active_transfers
    }
