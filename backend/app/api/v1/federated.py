from fastapi import APIRouter
from app.services.federated_engine import federated_coordinator

router = APIRouter()

@router.get("/status")
def get_federated_status():
    return federated_coordinator.get_federated_status()

@router.post("/train-round")
def run_round():
    return federated_coordinator.trigger_training_round()
