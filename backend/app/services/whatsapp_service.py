"""
WhatsApp Officer Alert Gateway Service
Dispatches structured early-warning alerts to District and Inspection Officers.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from backend.app.models.entities import WhatsAppMessage, TrainingCentre

def send_officer_whatsapp_alert(
    db: Session,
    centre_id: str,
    recipient_phone: str,
    anomaly_title: str,
    severity: str,
    action_url: Optional[str] = "https://sentinel.gov.in/interventions"
) -> WhatsAppMessage:
    centre = db.query(TrainingCentre).filter(TrainingCentre.id == centre_id).first()
    centre_name = centre.name if centre else "Training Centre"
    centre_code = centre.centre_code if centre else centre_id

    body = (
        f"🚨 *SKILL-SENTINEL COMPLIANCE ALERT* 🚨\n\n"
        f"*Centre:* {centre_name} ({centre_code})\n"
        f"*Severity:* {severity.upper()}\n"
        f"*Issue:* {anomaly_title}\n"
        f"*Current Risk Score:* {centre.current_risk_score if centre else 'N/A'}/100\n"
        f"*Immediate Action Required:* Please review discrepancy evidence and initiate protocol.\n\n"
        f"Portal Review: {action_url}"
    )

    msg = WhatsAppMessage(
        recipient_phone=recipient_phone,
        message_body=body,
        centre_id=centre_id,
        status="DELIVERED",
        dispatched_at=datetime.utcnow()
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
