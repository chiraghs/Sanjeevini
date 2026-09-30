from sqlalchemy import Column, Integer, String, Float, Boolean
from app.db.session import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), index=True, nullable=False)
    generic_name = Column(String(200), nullable=False)
    category = Column(String(100), index=True, nullable=False)  # Antibiotic, Antivenom, Maternal, Vaccine, IV Fluid, Analgesic
    dosage_form = Column(String(50), default="Tablet")  # Tablet, Injection, Syrup, Vial, Infusion
    strength = Column(String(50), default="500mg")
    unit = Column(String(30), default="Strip")  # Strip, Vial, Ampoule, Bottle
    critical_days_threshold = Column(Integer, default=14)
    storage_temp_c = Column(Float, default=25.0)  # 2-8C for cold chain, 25C room temp
    requires_cold_chain = Column(Boolean, default=False)
    is_vital = Column(Boolean, default=True)  # NLEM V-E-D Classification (Vital, Essential, Desirable)
