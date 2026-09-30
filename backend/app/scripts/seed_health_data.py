import random
import datetime
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.db.models.facility import Facility
from app.db.models.medicine import Medicine
from app.db.models.inventory import Inventory
from app.db.models.footfall import Footfall
from app.db.models.attendance import StaffAttendance
from app.db.models.alert import HealthAlert
from app.db.models.redistribution import RedistributionTransfer
from app.db.models.federated import FederatedRound

MEDICINES_DATA = [
    {"code": "MED-PCM-500", "name": "Paracetamol 500mg", "generic": "Paracetamol", "category": "Analgesic & Antipyretic", "dosage": "Tablet", "unit": "Strip", "critical": 14, "temp": 25.0, "cold": False, "vital": True},
    {"code": "MED-AMX-500", "name": "Amoxicillin 500mg", "generic": "Amoxicillin", "category": "Antibiotic", "dosage": "Capsule", "unit": "Strip", "critical": 14, "temp": 25.0, "cold": False, "vital": True},
    {"code": "MED-ORS-21G", "name": "ORS (Oral Rehydration Salts)", "generic": "Oral Rehydration Salts", "category": "Electrolyte", "dosage": "Powder", "unit": "Sachet", "critical": 10, "temp": 25.0, "cold": False, "vital": True},
    {"code": "MED-ASV-10ML", "name": "Anti-Snake Venom (ASV) Polyvalent", "generic": "Anti-Snake Venom", "category": "Antivenom", "dosage": "Injection", "unit": "Vial", "critical": 21, "temp": 4.0, "cold": True, "vital": True},
    {"code": "MED-OXY-10IU", "name": "Oxytocin Injection 10 IU/ml", "generic": "Oxytocin", "category": "Maternal Health", "dosage": "Ampoule", "unit": "Ampoule", "critical": 21, "temp": 4.0, "cold": True, "vital": True},
    {"code": "MED-INS-100U", "name": "Insulin Regular 100 IU/ml", "generic": "Human Insulin", "category": "Endocrine", "dosage": "Vial", "unit": "Vial", "critical": 14, "temp": 4.0, "cold": True, "vital": True},
    {"code": "MED-NS-500ML", "name": "Normal Saline (0.9% NaCl) 500ml", "generic": "Sodium Chloride", "category": "IV Fluid", "dosage": "Infusion", "unit": "Bottle", "critical": 7, "temp": 25.0, "cold": False, "vital": True},
    {"code": "MED-RL-500ML", "name": "Ringer Lactate (RL) 500ml", "generic": "Compound Sodium Lactate", "category": "IV Fluid", "dosage": "Infusion", "unit": "Bottle", "critical": 7, "temp": 25.0, "cold": False, "vital": True},
    {"code": "MED-AZI-500", "name": "Azithromycin 500mg", "generic": "Azithromycin", "category": "Antibiotic", "dosage": "Tablet", "unit": "Strip", "critical": 14, "temp": 25.0, "cold": False, "vital": True},
    {"code": "MED-IFA-100", "name": "Iron & Folic Acid (IFA)", "generic": "Ferrous Sulphate + Folic Acid", "category": "Nutritional", "dosage": "Tablet", "unit": "Strip", "critical": 14, "temp": 25.0, "cold": False, "vital": False},
    {"code": "MED-RAB-05ML", "name": "Anti-Rabies Vaccine (ARV)", "generic": "Rabies Vaccine", "category": "Vaccine", "dosage": "Injection", "unit": "Vial", "critical": 21, "temp": 4.0, "cold": True, "vital": True}
]

FACILITIES_DATA = [
    # Assam
    {"name": "PHC Sonai", "code": "AS-CAC-PHC-01", "type": "PHC", "state": "Assam", "district": "Cachar", "lat": 24.7214, "lng": 92.8941, "beds": 6, "occ": 5, "icu": 0, "cold": True},
    {"name": "PHC Dholai", "code": "AS-CAC-PHC-02", "type": "PHC", "state": "Assam", "district": "Cachar", "lat": 24.5982, "lng": 92.8421, "beds": 6, "occ": 4, "icu": 0, "cold": True},
    {"name": "CHC Lakhipur", "code": "AS-CAC-CHC-01", "type": "CHC", "state": "Assam", "district": "Cachar", "lat": 24.7942, "lng": 93.0112, "beds": 30, "occ": 22, "icu": 2, "cold": True},
    {"name": "District Hospital Silchar (SMCH)", "code": "AS-CAC-DH-01", "type": "DH", "state": "Assam", "district": "Cachar", "lat": 24.8333, "lng": 92.7789, "beds": 250, "occ": 195, "icu": 24, "cold": True},
    {"name": "PHC Boko", "code": "AS-KAM-PHC-01", "type": "PHC", "state": "Assam", "district": "Kamrup", "lat": 25.9754, "lng": 91.2312, "beds": 6, "occ": 3, "icu": 0, "cold": True},

    # Maharashtra
    {"name": "PHC Paud", "code": "MH-PUN-PHC-01", "type": "PHC", "state": "Maharashtra", "district": "Pune", "lat": 18.5284, "lng": 73.6124, "beds": 8, "occ": 7, "icu": 0, "cold": True},
    {"name": "PHC Wagholi", "code": "MH-PUN-PHC-02", "type": "PHC", "state": "Maharashtra", "district": "Pune", "lat": 18.5793, "lng": 73.9812, "beds": 10, "occ": 6, "icu": 0, "cold": True},
    {"name": "CHC Shirur", "code": "MH-PUN-CHC-01", "type": "CHC", "state": "Maharashtra", "district": "Pune", "lat": 18.8251, "lng": 74.3789, "beds": 40, "occ": 28, "icu": 4, "cold": True},
    {"name": "Aundh District Hospital", "code": "MH-PUN-DH-01", "type": "DH", "state": "Maharashtra", "district": "Pune", "lat": 18.5612, "lng": 73.8091, "beds": 300, "occ": 240, "icu": 32, "cold": True},
    {"name": "PHC Dindori", "code": "MH-NAS-PHC-01", "type": "PHC", "state": "Maharashtra", "district": "Nashik", "lat": 20.2014, "lng": 73.8321, "beds": 8, "occ": 4, "icu": 0, "cold": True},
    {"name": "CHC Sinnar", "code": "MH-NAS-CHC-01", "type": "CHC", "state": "Maharashtra", "district": "Nashik", "lat": 19.8456, "lng": 74.0012, "beds": 35, "occ": 20, "icu": 2, "cold": True},
    {"name": "PHC Aheri Tribal Outpost", "code": "MH-GAD-PHC-01", "type": "PHC", "state": "Maharashtra", "district": "Gadchiroli", "lat": 19.4124, "lng": 80.0014, "beds": 6, "occ": 5, "icu": 0, "cold": True},

    # Bihar
    {"name": "PHC Danapur", "code": "BR-PAT-PHC-01", "type": "PHC", "state": "Bihar", "district": "Patna", "lat": 25.6321, "lng": 85.0421, "beds": 10, "occ": 9, "icu": 0, "cold": True},
    {"name": "PHC Phulwari Sharif", "code": "BR-PAT-PHC-02", "type": "PHC", "state": "Bihar", "district": "Patna", "lat": 25.5789, "lng": 85.0789, "beds": 8, "occ": 6, "icu": 0, "cold": True},
    {"name": "Nalanda Medical College & Hospital (NMCH)", "code": "BR-PAT-DH-01", "type": "DH", "state": "Bihar", "district": "Patna", "lat": 25.6012, "lng": 85.1845, "beds": 500, "occ": 460, "icu": 45, "cold": True},
    {"name": "PHC Kanti", "code": "BR-MUZ-PHC-01", "type": "PHC", "state": "Bihar", "district": "Muzaffarpur", "lat": 26.1982, "lng": 85.3124, "beds": 8, "occ": 7, "icu": 0, "cold": True},
    {"name": "Sri Krishna Medical College (SKMCH)", "code": "BR-MUZ-DH-01", "type": "DH", "state": "Bihar", "district": "Muzaffarpur", "lat": 26.1542, "lng": 85.4214, "beds": 400, "occ": 340, "icu": 30, "cold": True},

    # Uttar Pradesh
    {"name": "PHC Kashi Vidyapeeth", "code": "UP-VAR-PHC-01", "type": "PHC", "state": "Uttar Pradesh", "district": "Varanasi", "lat": 25.3124, "lng": 82.9784, "beds": 10, "occ": 8, "icu": 0, "cold": True},
    {"name": "CHC Cholapur", "code": "UP-VAR-CHC-01", "type": "CHC", "state": "Uttar Pradesh", "district": "Varanasi", "lat": 25.4412, "lng": 83.0512, "beds": 30, "occ": 21, "icu": 2, "cold": True},
    {"name": "Pandit Deendayal Upadhyay Hospital", "code": "UP-VAR-DH-01", "type": "DH", "state": "Uttar Pradesh", "district": "Varanasi", "lat": 25.3341, "lng": 82.9912, "beds": 350, "occ": 290, "icu": 28, "cold": True},
    {"name": "PHC Campierganj", "code": "UP-GOR-PHC-01", "type": "PHC", "state": "Uttar Pradesh", "district": "Gorakhpur", "lat": 26.9812, "lng": 83.2741, "beds": 8, "occ": 6, "icu": 0, "cold": True},

    # Kerala
    {"name": "FHC Vengola", "code": "KL-ERN-PHC-01", "type": "PHC", "state": "Kerala", "district": "Ernakulam", "lat": 10.0912, "lng": 76.4512, "beds": 12, "occ": 8, "icu": 0, "cold": True},
    {"name": "CHC Kothamangalam", "code": "KL-ERN-CHC-01", "type": "CHC", "state": "Kerala", "district": "Ernakulam", "lat": 10.0612, "lng": 76.6289, "beds": 45, "occ": 32, "icu": 4, "cold": True},
    {"name": "General Hospital Ernakulam", "code": "KL-ERN-DH-01", "type": "DH", "state": "Kerala", "district": "Ernakulam", "lat": 9.9784, "lng": 76.2841, "beds": 450, "occ": 390, "icu": 40, "cold": True},
    {"name": "FHC Meppadi", "code": "KL-WAY-PHC-01", "type": "PHC", "state": "Kerala", "district": "Wayanad", "lat": 11.5489, "lng": 76.1284, "beds": 10, "occ": 9, "icu": 0, "cold": True},

    # Rajasthan
    {"name": "PHC Sanganer", "code": "RJ-JAI-PHC-01", "type": "PHC", "state": "Rajasthan", "district": "Jaipur", "lat": 26.8142, "lng": 75.7712, "beds": 12, "occ": 9, "icu": 0, "cold": True},
    {"name": "CHC Bassi", "code": "RJ-JAI-CHC-01", "type": "CHC", "state": "Rajasthan", "district": "Jaipur", "lat": 26.8341, "lng": 76.0412, "beds": 40, "occ": 25, "icu": 3, "cold": True},
    {"name": "PHC Baytu Desert Outpost", "code": "RJ-BAR-PHC-01", "type": "PHC", "state": "Rajasthan", "district": "Barmer", "lat": 25.8941, "lng": 71.7712, "beds": 6, "occ": 5, "icu": 0, "cold": True}
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    # Check if already seeded
    if db.query(Facility).count() > 0:
        print("[seed] Database already contains facilities. Skipping seed.")
        db.close()
        return

    print("[seed] Seeding medicines...")
    med_map = {}
    for m in MEDICINES_DATA:
        med = Medicine(
            code=m["code"],
            name=m["name"],
            generic_name=m["generic"],
            category=m["category"],
            dosage_form=m["dosage"],
            unit=m["unit"],
            critical_days_threshold=m["critical"],
            storage_temp_c=m["temp"],
            requires_cold_chain=m["cold"],
            is_vital=m["vital"]
        )
        db.add(med)
        db.flush()
        med_map[m["code"]] = med

    print("[seed] Seeding facilities...")
    facilities = []
    for f in FACILITIES_DATA:
        fac = Facility(
            code=f["code"],
            name=f["name"],
            facility_type=f["type"],
            state=f["state"],
            district=f["district"],
            latitude=f["lat"],
            longitude=f["lng"],
            total_beds=f["beds"],
            occupied_beds=f["occ"],
            icu_beds=f.get("icu", 0),
            occupied_icu=max(0, f.get("icu", 0) - 1),
            oxygen_points=max(2, int(f["beds"] * 0.4)),
            has_power_backup=True,
            has_cold_chain=f["cold"],
            cold_chain_functional=True,
            cold_chain_temp_c=4.2 if f["cold"] else 24.0,
            contact_person="Medical Officer in Charge",
            contact_phone=f"+91 {random.randint(7000000000, 9999999999)}"
        )
        db.add(fac)
        db.flush()
        facilities.append(fac)

    print("[seed] Generating realistic inventory balances...")
    now = datetime.datetime.utcnow()
    for fac in facilities:
        for med in med_map.values():
            # Seed deliberate critical deficits in specific PHCs for live demo
            is_crisis_target = (
                (fac.name == "PHC Sonai" and "ORS" in med.name) or
                (fac.name == "PHC Paud" and "Anti-Snake" in med.name) or
                (fac.name == "PHC Kanti" and "Paracetamol" in med.name) or
                (fac.name == "PHC Baytu Desert Outpost" and "Saline" in med.name) or
                (fac.name == "FHC Meppadi" and "Oxytocin" in med.name)
            )
            
            is_surplus_depot = (
                fac.facility_type in ["DH", "CHC"]
            )

            if is_crisis_target:
                current_stock = random.randint(4, 18)
                burn_rate = round(random.uniform(5.0, 9.0), 1)
            elif is_surplus_depot:
                current_stock = random.randint(600, 2500)
                burn_rate = round(random.uniform(15.0, 45.0), 1)
            else:
                current_stock = random.randint(80, 450)
                burn_rate = round(random.uniform(3.0, 10.0), 1)

            days_to_stockout = round(current_stock / max(0.5, burn_rate), 1)
            
            status = "STABLE"
            if days_to_stockout <= 3:
                status = "CRITICAL"
            elif days_to_stockout <= 7:
                status = "WARNING"

            expiry = now + datetime.timedelta(days=random.randint(60, 450))
            if is_surplus_depot and random.random() < 0.3:
                # Some donor stocks nearing expiry within 90 days to test smart expiry priority
                expiry = now + datetime.timedelta(days=random.randint(45, 85))

            inv = Inventory(
                facility_id=fac.id,
                medicine_id=med.id,
                batch_no=f"BCH-2024-{random.randint(100, 999)}",
                current_stock=current_stock,
                minimum_safety_stock=int(burn_rate * med.critical_days_threshold),
                daily_burn_rate=burn_rate,
                mfg_date=now - datetime.timedelta(days=random.randint(60, 180)),
                expiry_date=expiry,
                unit_cost_inr=round(random.uniform(5.0, 250.0), 2),
                status=status,
                days_to_stockout=days_to_stockout
            )
            db.add(inv)

    print("[seed] Seeding active health alerts...")
    alerts = [
        HealthAlert(
            title="Post-Monsoon Dengue Vector Spike",
            alert_type="OUTBREAK_SURGE",
            severity="CRITICAL",
            state="Assam",
            district="Cachar",
            disease_type="Dengue Serotype-2",
            description="Barak Valley flash floods resulted in acute water stagnation. Cachar district reports 320% increase in weekly febrile cases.",
            ai_mitigation_plan="Mobilize 15,000 ORS sachets and 5,000 Paracetamol IV vials from Silchar Medical College to Sonai and Dholai PHCs. Deploy vector fogging units.",
            is_active=True
        ),
        HealthAlert(
            title="Agricultural Season Snakebite Alert",
            alert_type="STOCKOUT_RISK",
            severity="HIGH",
            state="Maharashtra",
            district="Pune",
            disease_type="Viper & Cobra Envenomation",
            description="Sugarcane harvesting has triggered heightened snakebite incidents in Mulshi and Paud blocks. PHC Paud ASV inventory depleted to 4 vials.",
            ai_mitigation_plan="Approve emergency cross-transfer of 25 ASV polyvalent vials from Aundh District Hospital via route NH-48 within 3 hours.",
            is_active=True
        ),
        HealthAlert(
            title="Acute Diarrheal Outbreak Warning",
            alert_type="OUTBREAK_SURGE",
            severity="HIGH",
            state="Bihar",
            district="Muzaffarpur",
            disease_type="Bacterial Gastroenteritis",
            description="Contaminated ground well water in Kanti block caused 48 acute admissions within 36 hours. IV Fluid reserves below critical threshold.",
            ai_mitigation_plan="Dispatch 400 bottles Normal Saline and 200 bottles RL from SKMCH Muzaffarpur.",
            is_active=True
        ),
        HealthAlert(
            title="Maternal Oxytocin Reserve Alert",
            alert_type="STOCKOUT_RISK",
            severity="CRITICAL",
            state="Kerala",
            district="Wayanad",
            disease_type="Post-Partum Hemorrhage Prevention",
            description="FHC Meppadi reports 5 ampoules remaining with 3 high-risk deliveries scheduled this weekend.",
            ai_mitigation_plan="Requisition 50 cold-chain ampoules from General Hospital Ernakulam / Sulthan Bathery CHC.",
            is_active=True
        )
    ]
    for a in alerts:
        db.add(a)

    print("[seed] Seeding sample in-transit redistribution transfer...")
    # Find PHC Paud and Aundh DH
    phc_paud = db.query(Facility).filter(Facility.name == "PHC Paud").first()
    aundh_dh = db.query(Facility).filter(Facility.name == "Aundh District Hospital").first()
    asv_med = db.query(Medicine).filter(Medicine.code == "MED-ASV-10ML").first()
    
    if phc_paud and aundh_dh and asv_med:
        sample_transfer = RedistributionTransfer(
            transfer_code="TRF-20260930-ASV91",
            source_facility_id=aundh_dh.id,
            destination_facility_id=phc_paud.id,
            medicine_id=asv_med.id,
            quantity=25,
            batch_no="BCH-2024-419",
            urgency="EMERGENCY",
            status="IN_TRANSIT",
            distance_km=34.2,
            estimated_transit_hours=1.1,
            cold_chain_required=True,
            vehicle_no="MH-12-RN-8812 (Cold Van)",
            driver_name="Sunil Shinde",
            driver_phone="+91 94220 18291",
            temp_log_c=4.1,
            approval_notes="Fast-track emergency clearance by DMO Pune.",
            dispatch_date=now - datetime.timedelta(minutes=35)
        )
        db.add(sample_transfer)

    db.commit()
    db.close()
    print("[seed] Seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
