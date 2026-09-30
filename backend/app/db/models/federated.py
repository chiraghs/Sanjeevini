import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.db.session import Base

class FederatedRound(Base):
    __tablename__ = "federated_rounds"

    id = Column(Integer, primary_key=True, index=True)
    round_number = Column(Integer, index=True, nullable=False)
    state_code = Column(String(10), index=True, nullable=False)
    state_name = Column(String(100), nullable=False)
    
    samples_count = Column(Integer, default=5000)
    local_loss = Column(Float, default=0.245)
    global_loss = Column(Float, default=0.182)
    epsilon_privacy = Column(Float, default=0.85)  # Differential privacy budget
    model_version = Column(String(50), default="v1.2.0")
    parameters_summary = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
