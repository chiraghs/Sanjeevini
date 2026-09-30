from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models.facility import Facility
from app.db.models.inventory import Inventory
from app.db.models.attendance import StaffAttendance

router = APIRouter()

@router.get("/")
def get_facilities(
    state: Optional[str] = None,
    district: Optional[str] = None,
    facility_type: Optional[str] = None,
    query: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    q = db.query(Facility)
    if state:
        q = q.filter(Facility.state == state)
    if district:
        q = q.filter(Facility.district == district)
    if facility_type:
        q = q.filter(Facility.facility_type == facility_type)
    if query:
        q = q.filter(Facility.name.ilike(f"%{query}%"))
        
    total = q.count()
    items = q.offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "items": [
            {
                "id": f.id,
                "code": f.code,
                "name": f.name,
                "type": f.facility_type,
                "state": f.state,
                "district": f.district,
                "latitude": f.latitude,
                "longitude": f.longitude,
                "total_beds": f.total_beds,
                "occupied_beds": f.occupied_beds,
                "bed_occupancy_pct": round((f.occupied_beds / max(1, f.total_beds)) * 100, 1),
                "icu_beds": f.icu_beds,
                "oxygen_points": f.oxygen_points,
                "cold_chain_functional": f.cold_chain_functional,
                "contact_phone": f.contact_phone
            }
            for f in items
        ]
    }

@router.get("/map-markers")
def get_map_markers(
    state: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Returns compact geo markers for high-performance Leaflet clustering."""
    q = db.query(Facility)
    if state:
        q = q.filter(Facility.state == state)
    if district:
        q = q.filter(Facility.district == district)
        
    facilities = q.all()
    markers = []
    
    # Pre-fetch critical inventory counts per facility
    crit_counts = dict(
        db.query(Inventory.facility_id, func.count(Inventory.id))
        .filter(Inventory.days_to_stockout <= 7)
        .group_by(Inventory.facility_id)
        .all()
    )
    
    for f in facilities:
        crit_count = crit_counts.get(f.id, 0)
        status = "STABLE"
        if crit_count >= 2:
            status = "CRITICAL"
        elif crit_count == 1:
            status = "WARNING"
            
        markers.append({
            "id": f.id,
            "name": f.name,
            "type": f.facility_type,
            "state": f.state,
            "district": f.district,
            "lat": f.latitude,
            "lng": f.longitude,
            "beds_total": f.total_beds,
            "beds_occupied": f.occupied_beds,
            "status": status,
            "critical_stockouts_count": crit_count,
            "cold_chain": f.cold_chain_functional
        })
        
    return {"markers": markers}

@router.get("/{facility_id}")
def get_facility_detail(facility_id: int, db: Session = Depends(get_db)):
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
        
    inventory = (
        db.query(Inventory)
        .filter(Inventory.facility_id == facility_id)
        .all()
    )
    attendance = (
        db.query(StaffAttendance)
        .filter(StaffAttendance.facility_id == facility_id)
        .order_by(StaffAttendance.record_date.desc())
        .first()
    )
    
    return {
        "facility": {
            "id": facility.id,
            "code": facility.code,
            "name": facility.name,
            "type": facility.facility_type,
            "state": facility.state,
            "district": facility.district,
            "sub_district": facility.sub_district,
            "latitude": facility.latitude,
            "longitude": facility.longitude,
            "total_beds": facility.total_beds,
            "occupied_beds": facility.occupied_beds,
            "icu_beds": facility.icu_beds,
            "oxygen_points": facility.oxygen_points,
            "has_cold_chain": facility.has_cold_chain,
            "cold_chain_temp_c": facility.cold_chain_temp_c,
            "contact_person": facility.contact_person,
            "contact_phone": facility.contact_phone
        },
        "inventory": [
            {
                "id": inv.id,
                "medicine_id": inv.medicine.id,
                "medicine_name": inv.medicine.name,
                "category": inv.medicine.category,
                "batch_no": inv.batch_no,
                "current_stock": inv.current_stock,
                "minimum_safety_stock": inv.minimum_safety_stock,
                "daily_burn_rate": inv.daily_burn_rate,
                "days_to_stockout": inv.days_to_stockout,
                "status": inv.status,
                "expiry_date": inv.expiry_date.strftime("%Y-%m-%d"),
                "requires_cold_chain": inv.medicine.requires_cold_chain
            }
            for inv in inventory
        ],
        "attendance": {
            "doctors_present": attendance.doctors_present if attendance else 1,
            "doctors_sanctioned": attendance.doctors_sanctioned if attendance else 2,
            "nurses_present": attendance.nurses_present if attendance else 3,
            "pharmacists_present": attendance.pharmacists_present if attendance else 1,
            "status": attendance.status if attendance else "ADEQUATE"
        } if attendance else None
    }
