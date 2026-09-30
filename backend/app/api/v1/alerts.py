from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.alert import HealthAlert

router = APIRouter()

@router.get("/")
def get_alerts(active_only: bool = True, db: Session = Depends(get_db)):
    q = db.query(HealthAlert)
    if active_only:
        q = q.filter(HealthAlert.is_active == True)
    alerts = q.order_by(HealthAlert.created_at.desc()).all()
    return {
        "alerts": [
            {
                "id": a.id,
                "title": a.title,
                "type": a.alert_type,
                "severity": a.severity,
                "state": a.state,
                "district": a.district,
                "disease": a.disease_type,
                "description": a.description,
                "ai_mitigation": a.ai_mitigation_plan,
                "created_at": a.created_at.strftime("%Y-%m-%d %H:%M")
            }
            for a in alerts
        ]
    }
