import datetime
from sqlalchemy import Column, Integer, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

class Footfall(Base):
    __tablename__ = "footfalls"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), index=True, nullable=False)
    record_date = Column(Date, default=datetime.date.today, index=True, nullable=False)
    
    opd_count = Column(Integer, default=45)
    ipd_admissions = Column(Integer, default=3)
    emergency_cases = Column(Integer, default=2)
    
    # Epidemiological syndromic breakdown
    fever_cases = Column(Integer, default=12)
    diarrhea_cases = Column(Integer, default=5)
    respiratory_cases = Column(Integer, default=8)
    snakebite_cases = Column(Integer, default=0)
    maternal_deliveries = Column(Integer, default=1)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    facility = relationship("Facility")
