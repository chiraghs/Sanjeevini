import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class HealthAlert(Base):
    __tablename__ = "health_alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(250), nullable=False)
    alert_type = Column(String(50), default="STOCKOUT_RISK", index=True)  # STOCKOUT_RISK, OUTBREAK_SURGE, WEATHER_FLOOD, STAFF_SHORTAGE
    severity = Column(String(20), default="HIGH", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    
    state = Column(String(100), index=True, nullable=False)
    district = Column(String(100), index=True, nullable=False)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=True)
    
    disease_type = Column(String(100), nullable=True)  # Dengue, Malaria, Acute Diarrhea, Snakebite, Heatstroke
    description = Column(Text, nullable=False)
    ai_mitigation_plan = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    facility = relationship("Facility")
