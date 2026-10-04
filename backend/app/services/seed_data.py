"""
Comprehensive Database Seeder for SKILL-SENTINEL
Generates a complete, realistic national dataset:
- 10 States
- 30 Districts (3 per state)
- 120 Training Centres (103 Healthy, 11 Watchlist, 4 High Risk, 2 Critical)
- Realistic PMKK / SSDM infrastructure, assets, cameras, attendance records, and risk scores
- Dedicated controlled SIH demonstration scenario centre: Centre Pune-047 (initial risk = 54)
"""

import hashlib
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from backend.app.core.security import hash_password
from backend.app.models.entities import (
    State, District, TrainingCentre, Role, User, Course,
    TrainingBatch, Trainee, AttendanceRecord, CameraDevice, CameraStream,
    AssetCategory, Asset, QRCode, AttendanceAnomaly, InfrastructureAnomaly,
    RiskScore, RiskFactor, Intervention, WhatsAppMessage, SystemAlert,
    Inspection, InspectionEvidence, InspectionAssignment, AssetVerification
)

def seed_database(db: Session, force_reseed: bool = False):
    centre_count = db.query(TrainingCentre).count()
    if not force_reseed and centre_count >= 50:
        return

    if force_reseed:
        db.query(InspectionEvidence).delete()
        db.query(InspectionAssignment).delete()
        db.query(Inspection).delete()
        db.query(Intervention).delete()
        db.query(AssetVerification).delete()
        db.query(QRCode).delete()
        db.query(Asset).delete()
        db.query(AttendanceAnomaly).delete()
        db.query(InfrastructureAnomaly).delete()
        db.query(RiskFactor).delete()
        db.query(RiskScore).delete()
        db.query(WhatsAppMessage).delete()
        db.query(SystemAlert).delete()
        db.query(CameraStream).delete()
        db.query(CameraDevice).delete()
        db.query(AttendanceRecord).delete()
        db.query(Trainee).delete()
        db.query(TrainingBatch).delete()
        db.query(Course).delete()
        db.query(User).delete()
        db.query(TrainingCentre).delete()
        db.query(District).delete()
        db.query(State).delete()
        db.query(Role).delete()
        db.query(AssetCategory).delete()
        db.commit()

    # 1. Seed Roles
    if not db.query(Role).first():
        roles = [
            Role(id="SUPER_ADMIN", description="National System Super Administrator", level=100),
            Role(id="NATIONAL_OFFICER", description="Ministry of Skill Development & Entrepreneurship National Officer", level=80),
            Role(id="STATE_OFFICER", description="State Skill Development Mission (SSDM) Director", level=60),
            Role(id="DISTRICT_OFFICER", description="District Skill Officer (DSO)", level=40),
            Role(id="INSPECTION_OFFICER", description="Field Inspection & Vigilance Officer", level=20),
            Role(id="CENTRE_ADMIN", description="Training Centre Operations Manager", level=10),
        ]
        db.add_all(roles)
        db.commit()

    # 2. Seed 10 States
    states_data = [
        ("IN-DL", "Delhi (NCT)", "DL"),
        ("IN-MH", "Maharashtra", "MH"),
        ("IN-KA", "Karnataka", "KA"),
        ("IN-UP", "Uttar Pradesh", "UP"),
        ("IN-TN", "Tamil Nadu", "TN"),
        ("IN-GJ", "Gujarat", "GJ"),
        ("IN-RJ", "Rajasthan", "RJ"),
        ("IN-WB", "West Bengal", "WB"),
        ("IN-TG", "Telangana", "TG"),
        ("IN-MP", "Madhya Pradesh", "MP"),
    ]
    for s_id, s_name, s_code in states_data:
        if not db.query(State).filter(State.id == s_id).first():
            db.add(State(id=s_id, name=s_name, code=s_code))
    db.commit()

    # 3. Seed 30 Districts (3 per state)
    districts_data = [
        # Delhi
        ("dist-dl-south", "IN-DL", "South Delhi", "DL-SD"),
        ("dist-dl-central", "IN-DL", "Central Delhi", "DL-CD"),
        ("dist-dl-west", "IN-DL", "West Delhi", "DL-WD"),
        # Maharashtra
        ("dist-mh-pune", "IN-MH", "Pune", "MH-PU"),
        ("dist-mh-mumbai", "IN-MH", "Mumbai Suburban", "MH-MS"),
        ("dist-mh-nagpur", "IN-MH", "Nagpur", "MH-NG"),
        # Karnataka
        ("dist-ka-blr", "IN-KA", "Bengaluru Urban", "KA-BU"),
        ("dist-ka-mys", "IN-KA", "Mysuru", "KA-MY"),
        ("dist-ka-dwd", "IN-KA", "Dharwad", "KA-DW"),
        # Uttar Pradesh
        ("dist-up-lko", "IN-UP", "Lucknow", "UP-LK"),
        ("dist-up-knp", "IN-UP", "Kanpur Nagar", "UP-KN"),
        ("dist-up-vns", "IN-UP", "Varanasi", "UP-VN"),
        # Tamil Nadu
        ("dist-tn-chn", "IN-TN", "Chennai", "TN-CH"),
        ("dist-tn-cbe", "IN-TN", "Coimbatore", "TN-CB"),
        ("dist-tn-mdu", "IN-TN", "Madurai", "TN-MD"),
        # Gujarat
        ("dist-gj-ahd", "IN-GJ", "Ahmedabad", "GJ-AH"),
        ("dist-gj-srt", "IN-GJ", "Surat", "GJ-SR"),
        ("dist-gj-brd", "IN-GJ", "Vadodara", "GJ-VD"),
        # Rajasthan
        ("dist-rj-jpr", "IN-RJ", "Jaipur", "RJ-JP"),
        ("dist-rj-jdh", "IN-RJ", "Jodhpur", "RJ-JD"),
        ("dist-rj-kta", "IN-RJ", "Kota", "RJ-KT"),
        # West Bengal
        ("dist-wb-kol", "IN-WB", "Kolkata", "WB-KL"),
        ("dist-wb-hwh", "IN-WB", "Howrah", "WB-HW"),
        ("dist-wb-n24", "IN-WB", "North 24 Parganas", "WB-N24"),
        # Telangana
        ("dist-tg-hyd", "IN-TG", "Hyderabad", "TG-HY"),
        ("dist-tg-rrd", "IN-TG", "Rangareddy", "TG-RR"),
        ("dist-tg-mdc", "IN-TG", "Medchal-Malkajgiri", "TG-MM"),
        # Madhya Pradesh
        ("dist-mp-bhp", "IN-MP", "Bhopal", "MP-BP"),
        ("dist-mp-ind", "IN-MP", "Indore", "MP-IN"),
        ("dist-mp-jbp", "IN-MP", "Jabalpur", "MP-JB"),
    ]
    for d_id, s_id, d_name, d_code in districts_data:
        if not db.query(District).filter(District.id == d_id).first():
            db.add(District(id=d_id, state_id=s_id, name=d_name, code=d_code))
    db.commit()

    # 4. Seed Asset Categories
    categories_data = [
        ("cat-pc", "Computer Workstation", "PC", 20),
        ("cat-cnc", "CNC Machine Trainer", "CNC", 2),
        ("cat-bio", "Biometric Terminal", "BIO", 1),
        ("cat-wld", "Welding Simulator", "WLD", 2),
        ("cat-cam", "Edge AI Camera Gateway", "CAM", 2),
    ]
    for c_id, c_name, c_code, c_min in categories_data:
        if not db.query(AssetCategory).filter(AssetCategory.id == c_id).first():
            db.add(AssetCategory(id=c_id, name=c_name, code=c_code, minimum_required_per_batch=c_min))
    db.commit()

    # 5. Seed Standard Courses
    courses_data = [
        ("crs-iot", "ELE-Q7201", "IoT Device Installation & Maintenance", "Electronics", 200),
        ("crs-solar", "SOL-Q0101", "Solar PV System Technical Lead", "Renewable Energy", 180),
        ("crs-cnc", "CAP-Q1902", "CNC Turning & Lathe Specialist", "Capital Goods", 240),
        ("crs-auto", "AUT-Q0102", "Automotive Mechatronics Technician", "Automotive", 300),
        ("crs-data", "SSC-Q8101", "Junior AI & Data Annotation Specialist", "IT-ITeS", 160),
    ]
    for cr_id, cr_code, cr_title, cr_sec, cr_dur in courses_data:
        if not db.query(Course).filter(Course.id == cr_id).first():
            db.add(Course(id=cr_id, course_code=cr_code, title=cr_title, sector=cr_sec, duration_hours=cr_dur))
    db.commit()

    # 6. Seed Key Featured Training Centres
    # To precisely match Section 12 national overview:
    # 120 Total = 103 Healthy (<40) + 11 Watchlist (40-69, incl. Pune-047 at 54) + 4 High Risk (70-84) + 2 Critical (>=85)
    featured_centres = [
        # 2 Critical Centres (Score >= 85)
        ("tc-vns-009", "TC-UP-VNS-009", "Varanasi Advanced Mechatronics PMKK", "dist-up-vns", 25.3176, 82.9739, 88.5, "CRITICAL", "vns.mecha@skillsentinel.gov.in"),
        ("tc-lko-077", "TC-UP-LKO-077", "Awadh Vocational Excellence Academy", "dist-up-lko", 26.8524, 81.0022, 91.0, "CRITICAL", "lko.awadh@skillsentinel.gov.in"),

        # 4 High Risk Centres (Score 70.0 - 84.9)
        ("tc-del-042", "DEL-OKH-042", "PMKK Okhla Industrial Skill Hub", "dist-dl-south", 28.5355, 77.2690, 78.5, "HIGH", "okhla.pmkk@skillsentinel.gov.in"),
        ("tc-knp-018", "TC-UP-KNP-018", "Kanpur Industrial Automation Academy", "dist-up-knp", 26.4499, 80.3319, 74.0, "HIGH", "kanpur.auto@skillsentinel.gov.in"),
        ("tc-kol-092", "TC-WB-KOL-092", "Kolkata Advanced Manufacturing Institute", "dist-wb-kol", 22.5726, 88.3639, 76.5, "HIGH", "kolkata.mfg@skillsentinel.gov.in"),
        ("tc-jpr-031", "TC-RJ-JPR-031", "Jaipur Solar & Renewable Skill Complex", "dist-rj-jpr", 26.9124, 75.7873, 72.0, "HIGH", "jaipur.solar@skillsentinel.gov.in"),

        # 11 Watchlist Centres (Score 40.0 - 69.9) - MUST include Pune-047 at 54.0
        ("tc-pune-047", "Pune-047", "PMKK Pune Precision Engineering Centre", "dist-mh-pune", 18.5204, 73.8567, 54.0, "MODERATE", "pune047@skillsentinel.gov.in"),
        ("tc-mum-108", "TC-MUM-108", "Mega Skill Training Centre Andheri", "dist-mh-mumbai", 19.1136, 72.8697, 48.0, "MODERATE", "andheri.skill@skillsentinel.gov.in"),
        ("tc-blr-021", "TC-BLR-021", "Karnataka Advanced Skill Center Electronic City", "dist-ka-blr", 12.8452, 77.6602, 45.0, "MODERATE", "blr.elcity@skillsentinel.gov.in"),
        ("tc-chn-034", "TC-CHN-034", "Tamil Nadu Maritime & Manufacturing Institute", "dist-tn-chn", 13.0067, 80.2023, 42.5, "MODERATE", "guindy.skill@skillsentinel.gov.in"),
        ("tc-ahd-055", "TC-GJ-AHD-055", "Sabarmati Technical & Apparel Institute", "dist-gj-ahd", 23.0225, 72.5714, 46.0, "MODERATE", "ahd.skill@skillsentinel.gov.in"),
        ("tc-hyd-083", "TC-TG-HYD-083", "Cyberabad IT & Hardware Vocational Institute", "dist-tg-hyd", 17.3850, 78.4867, 44.0, "MODERATE", "hyd.voc@skillsentinel.gov.in"),
        ("tc-bhp-061", "TC-MP-BHP-061", "Bhopal Electric Mobility Training Centre", "dist-mp-bhp", 23.2599, 77.4126, 47.0, "MODERATE", "bhopal.ev@skillsentinel.gov.in"),
        ("tc-del-088", "TC-DEL-088", "PMKK Rohini Advanced Technical Training", "dist-dl-west", 28.7041, 77.1025, 41.0, "MODERATE", "rohini.tech@skillsentinel.gov.in"),
        ("tc-srt-019", "TC-GJ-SRT-019", "Surat Diamond & Textile Skill Centre", "dist-gj-srt", 21.1702, 72.8311, 43.0, "MODERATE", "surat.skill@skillsentinel.gov.in"),
        ("tc-cbe-022", "TC-TN-CBE-022", "Coimbatore Mechatronics Training Hub", "dist-tn-cbe", 11.0168, 76.9558, 49.0, "MODERATE", "cbe.mech@skillsentinel.gov.in"),
        ("tc-ind-038", "TC-MP-IND-038", "Malwa Pharmaceutical & Lab Technician PMKK", "dist-mp-ind", 22.7196, 75.8577, 45.5, "MODERATE", "indore.pharma@skillsentinel.gov.in"),
    ]

    for cid, ccode, cname, did, lat, lon, rscore, rlvl, cemail in featured_centres:
        existing = db.query(TrainingCentre).filter(TrainingCentre.id == cid).first()
        if not existing:
            db.add(TrainingCentre(
                id=cid, centre_code=ccode, name=cname, district_id=did,
                latitude=lat, longitude=lon, current_risk_score=rscore, current_risk_level=rlvl,
                contact_email=cemail, address=f"{cname}, District {did}"
            ))
        else:
            existing.current_risk_score = rscore
            existing.current_risk_level = rlvl
    db.commit()

    # Generate remaining 103 Compliant/Healthy centres (risk between 10.0 and 24.5)
    existing_count = db.query(TrainingCentre).count()
    needed = 120 - existing_count
    if needed > 0:
        dist_ids = [d[0] for d in districts_data]
        prefixes = ["Skill India Pradhan Mantri Kaushal Kendra", "National Skill Training Institute", "Yuva Vikas Skill Centre", "Gramin Kaushal Vikas Kendra", "State Skill Academy"]
        sectors_names = ["Automotive", "Electronics", "Green Energy", "Healthcare", "Apparel", "Logistics", "IT-ITeS", "Capital Goods", "Construction", "Hospitality"]
        
        for i in range(needed):
            idx = existing_count + i + 1
            did = dist_ids[i % len(dist_ids)]
            prefix = prefixes[i % len(prefixes)]
            sec = sectors_names[i % len(sectors_names)]
            d_code = next(d[3] for d in districts_data if d[0] == did)
            
            c_code = f"TC-{d_code}-{idx:03d}"
            c_id = f"tc-{d_code.lower()}-{idx:03d}"
            c_name = f"{prefix} {sec} - {d_code} {idx:02d}"
            r_score = round(10.0 + ((i * 3.7) % 14.5), 1)
            
            db.add(TrainingCentre(
                id=c_id,
                centre_code=c_code,
                name=c_name,
                district_id=did,
                latitude=round(20.0 + (i % 8) * 1.1, 4),
                longitude=round(74.0 + (i % 10) * 0.9, 4),
                current_risk_score=r_score,
                current_risk_level="LOW",
                contact_email=f"centre.{d_code.lower()}{idx}@skillsentinel.gov.in",
                address=f"Plot {idx}, Industrial Estate, {did}"
            ))
        db.commit()

    # 7. Seed Users (All foreign keys are now fully present)
    pwd = hash_password("password123")
    users_data = [
        ("usr-super-admin", "admin@skillsentinel.gov.in", "Col. Arvind Verma (Retd.)", "SUPER_ADMIN", None, None, None, "+91-9900000001"),
        ("usr-nat-officer", "national@skillsentinel.gov.in", "Dr. Sunita Deshmukh (IAS)", "NATIONAL_OFFICER", None, None, None, "+91-9900000002"),
        ("usr-state-dl", "state.delhi@skillsentinel.gov.in", "Vikramaditya Roy", "STATE_OFFICER", "IN-DL", None, None, "+91-9900000003"),
        ("usr-dist-southdelhi", "district.southdelhi@skillsentinel.gov.in", "Meera Swaminathan", "DISTRICT_OFFICER", None, "dist-dl-south", None, "+91-9811554433"),
        ("usr-insp-delhi", "inspector.delhi@skillsentinel.gov.in", "Inspector Rakesh Gupta", "INSPECTION_OFFICER", None, "dist-dl-south", None, "+91-9877112233"),
        ("usr-insp-pune", "inspector.pune@skillsentinel.gov.in", "Inspector Anand Patil", "INSPECTION_OFFICER", None, "dist-mh-pune", None, "+91-9822334455"),
        ("usr-centre-admin-okhla", "centre.okhla@skillsentinel.gov.in", "Sanjay Bhargava", "CENTRE_ADMIN", None, None, "tc-del-042", "+91-9811023456"),
        ("usr-centre-admin-pune", "centre.pune@skillsentinel.gov.in", "Deepak Kulkarni", "CENTRE_ADMIN", None, None, "tc-pune-047", "+91-9822012345"),
    ]
    for u_id, u_email, u_name, u_role, u_st, u_dt, u_ct, u_ph in users_data:
        if not db.query(User).filter(User.id == u_id).first():
            db.add(User(
                id=u_id, email=u_email, hashed_password=pwd, full_name=u_name,
                role_id=u_role, state_id=u_st, district_id=u_dt, centre_id=u_ct, phone_number=u_ph
            ))
    db.commit()

    # 8. Seed Batches, Cameras & Assets for Pune-047 (The SIH Demo Hub)
    pune_centre = db.query(TrainingCentre).filter(TrainingCentre.id == "tc-pune-047").first()
    if pune_centre:
        if not db.query(TrainingBatch).filter(TrainingBatch.id == "batch-pune-cnc-01").first():
            db.add(TrainingBatch(
                id="batch-pune-cnc-01",
                centre_id=pune_centre.id,
                course_id="crs-cnc",
                batch_code="MH-PUN-CNC-047",
                sanctioned_strength=28,
                scheduled_start_time="09:00",
                scheduled_end_time="13:00",
                classroom_id="LAB-PUN-01",
                is_active=True
            ))

        if not db.query(CameraDevice).filter(CameraDevice.id == "cam-pune-lab-01").first():
            db.add(CameraDevice(
                id="cam-pune-lab-01",
                centre_id=pune_centre.id,
                device_name="Pune Precision Lab Cam 1",
                room_type="LAB",
                status="ONLINE"
            ))

        pune_assets = [
            ("asset-pune-cnc-01", "cat-cnc", "PUN-CNC-2026-001", "Haas VF-2 CNC Milling Trainer", "VERIFIED_PRESENT"),
            ("asset-pune-pc-047", "cat-pc", "PUN-PC-2026-047", "Dell OptiPlex 7090 Tower", "VERIFIED_PRESENT"),
            ("asset-pune-wld-02", "cat-wld", "PUN-WLD-2026-002", "Lincoln Electric VR Welding Simulator", "VERIFIED_PRESENT"),
        ]
        for aid, cat_id, atag, mname, astat in pune_assets:
            if not db.query(Asset).filter(Asset.id == aid).first():
                ass = Asset(
                    id=aid, centre_id=pune_centre.id, category_id=cat_id,
                    asset_tag=atag, model_name=mname, status=astat
                )
                db.add(ass)
                db.commit()
                if not db.query(QRCode).filter(QRCode.asset_id == aid).first():
                    db.add(QRCode(
                        id=f"qr-{aid}",
                        asset_id=aid,
                        qr_payload=f"SKILL-SENTINEL:{atag}:{pune_centre.id}",
                        digital_signature=f"SIG-{atag}-CRYPT-AUTH-OK"
                    ))
        db.commit()

    # 9. Seed Batches & Assets for Okhla
    okhla = db.query(TrainingCentre).filter(TrainingCentre.id == "tc-del-042").first()
    if okhla:
        if not db.query(TrainingBatch).filter(TrainingBatch.id == "batch-okhla-iot-morning").first():
            db.add(TrainingBatch(
                id="batch-okhla-iot-morning",
                centre_id=okhla.id,
                course_id="crs-iot",
                batch_code="DL-OKH-IOT-M1",
                sanctioned_strength=30,
                classroom_id="ROOM-101",
                is_active=True
            ))
        if not db.query(CameraDevice).filter(CameraDevice.id == "cam-okhla-lab-01").first():
            db.add(CameraDevice(
                id="cam-okhla-lab-01",
                centre_id=okhla.id,
                device_name="Okhla IoT Lab Cam",
                room_type="LAB",
                status="ONLINE"
            ))
        if not db.query(Asset).filter(Asset.id == "asset-okh-pc-004").first():
            ass_okh = Asset(
                id="asset-okh-pc-004",
                centre_id=okhla.id,
                category_id="cat-pc",
                asset_tag="OKH-PC-2026-004",
                model_name="Dell OptiPlex 7090",
                status="VERIFIED_PRESENT"
            )
            db.add(ass_okh)
            db.commit()
            db.add(QRCode(
                id="qr-okh-pc-004",
                asset_id=ass_okh.id,
                qr_payload=f"SKILL-SENTINEL:OKH-PC-2026-004:{okhla.id}",
                digital_signature="SIG-OKH-PC-2026-004-VERIFIED-HASH"
            ))
            db.commit()

        if not db.query(AttendanceAnomaly).filter(AttendanceAnomaly.centre_id == okhla.id).first():
            db.add(AttendanceAnomaly(
                id="anom-okhla-01",
                centre_id=okhla.id,
                batch_id="batch-okhla-iot-morning",
                reported_attendance=28,
                observed_headcount=8,
                discrepancy_percentage=-71.4,
                severity="CRITICAL",
                status="OPEN"
            ))
            db.commit()

    db.commit()
    final_count = db.query(TrainingCentre).count()
    print(f"Database successfully verified with {final_count} centres across 10 states and 30 districts.")
