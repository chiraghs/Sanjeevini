import datetime
from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

class StaffAttendance(Base):
    __tablename__ = "staff_attendance"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), index=True, nullable=False)
    record_date = Column(Date, default=datetime.date.today, index=True, nullable=False)
    
    doctors_sanctioned = Column(Integer, default=2)
    doctors_present = Column(Integer, default=1)
    
    nurses_sanctioned = Column(Integer, default=3)
    nurses_present = Column(Integer, default=3)
    
    pharmacists_present = Column(Integer, default=1)
    anm_workers_present = Column(Integer, default=2)
    lab_techs_present = Column(Integer, default=1)
    
    # Status: ADEQUATE, SHORTAGE, CRITICAL
    status = Column(String(20), default="ADEQUATE")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    facility = relationship("Facility")
