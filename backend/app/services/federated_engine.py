import random
import datetime
from typing import Dict, Any, List

class FederatedCoordinator:
    """Simulates multi-state federated predictive modeling preserving health data sovereignty."""
    
    STATES = [
        {"code": "MH", "name": "Maharashtra", "phc_count": 1824, "samples": 42000},
        {"code": "UP", "name": "Uttar Pradesh", "phc_count": 3120, "samples": 68000},
        {"code": "AS", "name": "Assam", "phc_count": 1014, "samples": 21000},
        {"code": "KL", "name": "Kerala", "phc_count": 912, "samples": 34000},
        {"code": "RJ", "name": "Rajasthan", "phc_count": 2180, "samples": 49000},
        {"code": "BR", "name": "Bihar", "phc_count": 2240, "samples": 53000}
    ]

    BRICS_NODES = [
        {
            "country_code": "IN",
            "country_name": "India",
            "flag": "🇮🇳",
            "institution": "MoHFW Sanjeevini National Federated Core",
            "active_centers": 160000,
            "samples": 267000,
            "focus_area": "Monsoon Outbreaks, Snakebite & Maternal NLEM Supply",
            "privacy_model": "Differential Privacy (ε=0.85, δ=1e-5)"
        },
        {
            "country_code": "BR",
            "country_name": "Brazil",
            "flag": "🇧🇷",
            "institution": "SUS - Fiocruz Global Arboviral Logistics Hub",
            "active_centers": 42800,
            "samples": 145000,
            "focus_area": "Dengue & Chikungunya Seasonal Stock-Out Prediction",
            "privacy_model": "Differential Privacy (ε=0.85, δ=1e-5)"
        },
        {
            "country_code": "RU",
            "country_name": "Russia",
            "flag": "🇷🇺",
            "institution": "Minzdrav Federal Primary Care Grid",
            "active_centers": 14200,
            "samples": 82000,
            "focus_area": "Arctic Cold-Chain & Viral Respiratory Demand Forecasting",
            "privacy_model": "Differential Privacy (ε=0.85, δ=1e-5)"
        },
        {
            "country_code": "CN",
            "country_name": "China",
            "flag": "🇨🇳",
            "institution": "NHC Rural Health Consortium & Township Dispensaries",
            "active_centers": 36500,
            "samples": 194000,
            "focus_area": "Epidemiological Early Warning & Antimicrobial Reserve Balancing",
            "privacy_model": "Differential Privacy (ε=0.85, δ=1e-5)"
        },
        {
            "country_code": "ZA",
            "country_name": "South Africa",
            "flag": "🇿🇦",
            "institution": "NDoH National Health Insurance (NHI) Gateway",
            "active_centers": 3820,
            "samples": 51000,
            "focus_area": "Antiretroviral & TB Emergency Requisition Balancing",
            "privacy_model": "Differential Privacy (ε=0.85, δ=1e-5)"
        }
    ]

    def __init__(self):
        self.current_round = 14
        self.global_loss = 0.174
        self.global_accuracy = 0.938
        self.epsilon_privacy = 0.85

    def get_federated_status(self) -> Dict[str, Any]:
        """Returns the current state of federated model learning across India and BRICS partners."""
        state_nodes = []
        for s in self.STATES:
            local_loss = round(self.global_loss + random.uniform(-0.02, 0.03), 4)
            local_acc = round(self.global_accuracy + random.uniform(-0.015, 0.015), 3)
            state_nodes.append({
                "state_code": s["code"],
                "state_name": s["name"],
                "active_phcs": s["phc_count"],
                "samples_trained": s["samples"],
                "local_loss": local_loss,
                "local_accuracy": local_acc,
                "privacy_budget_consumed": round(self.epsilon_privacy + random.uniform(-0.05, 0.05), 2),
                "last_gradient_sync": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "status": "ONLINE_SYNCED"
            })

        brics_nodes = []
        for b in self.BRICS_NODES:
            b_loss = round(self.global_loss + random.uniform(-0.015, 0.025), 4)
            b_acc = round(self.global_accuracy + random.uniform(-0.01, 0.01), 3)
            brics_nodes.append({
                "country_code": b["country_code"],
                "country_name": b["country_name"],
                "flag": b["flag"],
                "institution": b["institution"],
                "active_centers": b["active_centers"],
                "samples_trained": b["samples"],
                "focus_area": b["focus_area"],
                "privacy_model": b["privacy_model"],
                "local_loss": b_loss,
                "local_accuracy": b_acc,
                "status": "SOVEREIGN_CONNECTED",
                "last_sync": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            })
            
        # 10-round historical convergence curve
        history = []
        loss_val = 0.42
        acc_val = 0.78
        for r in range(1, self.current_round + 1):
            loss_val = max(0.15, loss_val * 0.93)
            acc_val = min(0.96, acc_val + 0.012)
            history.append({
                "round": r,
                "global_loss": round(loss_val, 3),
                "global_accuracy": round(acc_val, 3),
                "participating_nodes": 6
            })
            
        return {
            "current_round": self.current_round,
            "global_model_version": f"v{self.current_round // 5 + 1}.{self.current_round % 5}.0",
            "global_loss": self.global_loss,
            "global_accuracy": self.global_accuracy,
            "differential_privacy_epsilon": self.epsilon_privacy,
            "state_nodes": state_nodes,
            "brics_nodes": brics_nodes,
            "training_history": history,
            "data_sovereignty_compliance": "100% Sovereign (No patient records leave jurisdictional boundaries; only gradient weights shared via FedAvg)"
        }

    def trigger_training_round(self) -> Dict[str, Any]:
        """Advances a federated training round, performing FedAvg gradient aggregation."""
        self.current_round += 1
        self.global_loss = round(max(0.12, self.global_loss * 0.95), 4)
        self.global_accuracy = round(min(0.975, self.global_accuracy + 0.006), 3)
        return self.get_federated_status()

federated_coordinator = FederatedCoordinator()
