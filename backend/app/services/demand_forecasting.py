import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.db.models.inventory import Inventory
from app.db.models.facility import Facility
from app.db.models.medicine import Medicine
from app.db.models.footfall import Footfall
from app.db.models.alert import HealthAlert
from app.services.gemini_client import gemini_client

def calculate_stockout_forecast(db: Session, facility_id: int, medicine_id: int) -> Dict[str, Any]:
    """Computes hybrid statistical + epidemiological demand forecasting."""
    inv = db.query(Inventory).filter(
        Inventory.facility_id == facility_id,
        Inventory.medicine_id == medicine_id
    ).first()
    
    if not inv:
        return {"error": "Inventory record not found"}
        
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    
    # Check active alerts for this district
    active_alerts = db.query(HealthAlert).filter(
        HealthAlert.district == facility.district,
        HealthAlert.is_active == True
    ).all()
    
    surge_multiplier = 1.0
    active_factors = []
    
    for alert in active_alerts:
        if "dengue" in alert.title.lower() or "malaria" in alert.title.lower():
            if "paracetamol" in medicine.name.lower() or "iv fluid" in medicine.name.lower():
                surge_multiplier += 1.8
                active_factors.append(f"Vector outbreak alert: {alert.title} (+180% surge)")
        elif "flood" in alert.title.lower() or "water" in alert.title.lower():
            if "ors" in medicine.name.lower() or "antibiotic" in medicine.category.lower():
                surge_multiplier += 2.2
                active_factors.append(f"Monsoon flood alert: {alert.title} (+220% surge)")
        elif "snakebite" in alert.title.lower() and "venom" in medicine.name.lower():
            surge_multiplier += 3.0
            active_factors.append("Agricultural harvesting snakebite season (+300% surge)")
            
    effective_burn_rate = round(inv.daily_burn_rate * surge_multiplier, 1)
    if effective_burn_rate <= 0:
        effective_burn_rate = 1.0
        
    days_to_stockout = round(inv.current_stock / effective_burn_rate, 1)
    depletion_date = (datetime.date.today() + datetime.timedelta(days=int(days_to_stockout))).isoformat()
    
    # 30-day projection trajectory
    timeline = []
    running_stock = inv.current_stock
    for day in range(1, 31):
        running_stock = max(0, int(running_stock - effective_burn_rate))
        proj_date = (datetime.date.today() + datetime.timedelta(days=day)).isoformat()
        timeline.append({
            "day": day,
            "date": proj_date,
            "projected_stock": running_stock,
            "critical_threshold": inv.minimum_safety_stock
        })
        
    status = "STABLE"
    if days_to_stockout <= 3:
        status = "CRITICAL"
    elif days_to_stockout <= 7:
        status = "WARNING"
        
    return {
        "facility_name": facility.name,
        "district": facility.district,
        "state": facility.state,
        "medicine_name": medicine.name,
        "current_stock": inv.current_stock,
        "base_daily_burn": inv.daily_burn_rate,
        "effective_burn_rate": effective_burn_rate,
        "surge_multiplier": round(surge_multiplier, 2),
        "days_to_stockout": days_to_stockout,
        "projected_stockout_date": depletion_date,
        "status": status,
        "surge_factors": active_factors,
        "timeline_30d": timeline
    }
