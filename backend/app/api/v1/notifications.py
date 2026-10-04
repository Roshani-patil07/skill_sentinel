from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.entities import Notification, WhatsAppMessage

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])

@router.get("")
def list_notifications(db: Session = Depends(get_db)):
    notifications = db.query(Notification).order_by(Notification.created_at.desc()).limit(20).all()
    whatsapp_logs = db.query(WhatsAppMessage).order_by(WhatsAppMessage.dispatched_at.desc()).limit(10).all()

    return {
        "notifications": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "level": n.level,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat()
            } for n in notifications
        ],
        "whatsapp_logs": [
            {
                "id": w.id,
                "recipient": w.recipient_phone,
                "body": w.message_body,
                "status": w.status,
                "dispatched_at": w.dispatched_at.isoformat()
            } for w in whatsapp_logs
        ]
    }
