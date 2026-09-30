import math
import uuid
import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.db.models.facility import Facility
from app.db.models.medicine import Medicine
from app.db.models.inventory import Inventory
from app.db.models.redistribution import RedistributionTransfer

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km between two geo-coordinates."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c * 1.25, 1)  # 1.25 road winding factor

def generate_redistribution_recommendations(db: Session, district: str = None) -> List[Dict[str, Any]]:
    """Identifies critical deficit PHCs and pairs them with optimal surplus facilities."""
    # Find all inventories with critical or warning stock levels
    query = db.query(Inventory).join(Facility).join(Medicine)
    if district:
        query = query.filter(Facility.district == district)
        
    deficit_items = query.filter(Inventory.days_to_stockout <= 7).all()
    recommendations = []
    
    for def_inv in deficit_items:
        rec_fac = def_inv.facility
        med = def_inv.medicine
        needed_quantity = int((def_inv.daily_burn_rate * 21) - def_inv.current_stock)
        if needed_quantity <= 0:
            needed_quantity = 50
            
        # Search candidate donor facilities in the same state
        surplus_candidates = db.query(Inventory).join(Facility).filter(
            Facility.state == rec_fac.state,
            Facility.id != rec_fac.id,
            Inventory.medicine_id == med.id,
            Inventory.days_to_stockout > 35,
            Inventory.current_stock > (needed_quantity * 1.5)
        ).all()
        
        if not surplus_candidates:
            # Expand to state district hospital / medical college depot
            surplus_candidates = db.query(Inventory).join(Facility).filter(
                Facility.state == rec_fac.state,
                Facility.facility_type.in_(["DH", "CHC"]),
                Facility.id != rec_fac.id,
                Inventory.medicine_id == med.id,
                Inventory.current_stock > needed_quantity
            ).all()
            
        if not surplus_candidates:
            continue
            
        # Score candidates based on distance + expiry date (prioritize batches nearing expiry to prevent waste)
        best_candidate = None
        best_score = -999999.0
        best_distance = 0.0
        
        now = datetime.datetime.utcnow()
        for cand in surplus_candidates:
            dist = haversine_distance(rec_fac.latitude, rec_fac.longitude, cand.facility.latitude, cand.facility.longitude)
            days_to_expiry = max(1, (cand.expiry_date - now).days)
            
            # Optimization objective: minimize distance (negative weight) + penalize expiry past 180 days (prefer stocks expiring in 60-120 days)
            expiry_urgency = 200.0 / days_to_expiry if days_to_expiry < 120 else 0.0
            distance_penalty = dist * 1.5
            score = 1000.0 - distance_penalty + (expiry_urgency * 10.0)
            
            if score > best_score:
                best_score = score
                best_candidate = cand
                best_distance = dist
                
        if best_candidate:
            transfer_qty = min(needed_quantity, int(best_candidate.current_stock * 0.4))
            transit_hours = round(best_distance / 35.0, 1)  # 35 km/h rural road avg speed
            
            rec = {
                "recommendation_id": f"REC-{uuid.uuid4().hex[:6].upper()}",
                "medicine_id": med.id,
                "medicine_name": med.name,
                "medicine_category": med.category,
                "requires_cold_chain": med.requires_cold_chain,
                "quantity": transfer_qty,
                "recipient_facility": {
                    "id": rec_fac.id,
                    "name": rec_fac.name,
                    "district": rec_fac.district,
                    "state": rec_fac.state,
                    "current_stock": def_inv.current_stock,
                    "days_to_stockout": def_inv.days_to_stockout
                },
                "donor_facility": {
                    "id": best_candidate.facility.id,
                    "name": best_candidate.facility.name,
                    "district": best_candidate.facility.district,
                    "state": best_candidate.facility.state,
                    "current_stock": best_candidate.current_stock,
                    "days_to_stockout": best_candidate.days_to_stockout,
                    "batch_no": best_candidate.batch_no,
                    "expiry_date": best_candidate.expiry_date.strftime("%Y-%m-%d")
                },
                "distance_km": best_distance,
                "estimated_transit_hours": transit_hours,
                "urgency": "EMERGENCY" if def_inv.days_to_stockout <= 2 else "URGENT",
                "ai_rationale": f"Recipient faces zero stock within {def_inv.days_to_stockout} days. Donor facility has surplus {best_candidate.current_stock} units. Transfer resolves deficit with minimal transit time ({transit_hours} hrs)."
            }
            recommendations.append(rec)
            
    return recommendations
