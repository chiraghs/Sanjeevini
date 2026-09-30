import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class RedistributionTransfer(Base):
    __tablename__ = "redistribution_transfers"

    id = Column(Integer, primary_key=True, index=True)
    transfer_code = Column(String(50), unique=True, index=True, nullable=False)
    
    source_facility_id = Column(Integer, ForeignKey("facilities.id"), index=True, nullable=False)
    destination_facility_id = Column(Integer, ForeignKey("facilities.id"), index=True, nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), index=True, nullable=False)
    
    quantity = Column(Integer, nullable=False)
    batch_no = Column(String(50), nullable=True)
    
    urgency = Column(String(20), default="URGENT")  # ROUTINE, URGENT, EMERGENCY
    status = Column(String(20), default="PROPOSED", index=True)  # PROPOSED, APPROVED, IN_TRANSIT, DELIVERED, REJECTED
    
    distance_km = Column(Float, default=24.5)
    estimated_transit_hours = Column(Float, default=1.5)
    cold_chain_required = Column(Boolean, default=False)
    
    # Logistics Tracking
    vehicle_no = Column(String(30), nullable=True)
    driver_name = Column(String(100), nullable=True)
    driver_phone = Column(String(20), nullable=True)
    temp_log_c = Column(Float, nullable=True)
    
    ai_recommendation_reason = Column(Text, nullable=True)
    approval_notes = Column(Text, nullable=True)
    approved_by = Column(String(100), nullable=True)
    
    dispatch_date = Column(DateTime, nullable=True)
    delivery_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    source_facility = relationship("Facility", foreign_keys=[source_facility_id])
    destination_facility = relationship("Facility", foreign_keys=[destination_facility_id])
    medicine = relationship("Medicine")
