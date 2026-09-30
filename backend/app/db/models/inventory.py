import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.session import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), index=True, nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), index=True, nullable=False)
    batch_no = Column(String(50), index=True, nullable=False)
    
    current_stock = Column(Integer, default=0, nullable=False)
    minimum_safety_stock = Column(Integer, default=50, nullable=False)
    daily_burn_rate = Column(Float, default=5.0, nullable=False)  # Average daily consumption
    
    mfg_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, index=True, nullable=False)
    unit_cost_inr = Column(Float, default=10.0)
    
    # Status: STABLE, WARNING, CRITICAL, STOCKOUT
    status = Column(String(20), default="STABLE", index=True)
    days_to_stockout = Column(Float, default=30.0)
    
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    facility = relationship("Facility")
    medicine = relationship("Medicine")

    __table_args__ = (
        Index("idx_facility_medicine", "facility_id", "medicine_id"),
    )
