import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.db.session import Base

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    facility_type = Column(String(20), default="PHC")  # PHC, CHC, DH, SC (Sub-Centre)
    state = Column(String(100), index=True, nullable=False)
    district = Column(String(100), index=True, nullable=False)
    sub_district = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Capacity & Infrastructure
    total_beds = Column(Integer, default=6)
    occupied_beds = Column(Integer, default=2)
    icu_beds = Column(Integer, default=0)
    occupied_icu = Column(Integer, default=0)
    oxygen_points = Column(Integer, default=2)
    has_power_backup = Column(Boolean, default=True)
    has_cold_chain = Column(Boolean, default=True)
    cold_chain_functional = Column(Boolean, default=True)
    cold_chain_temp_c = Column(Float, default=4.0)
    
    # Contact
    contact_person = Column(String(100), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
