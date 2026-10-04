from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.entities import Asset, AssetCategory, QRCode, TrainingCentre

router = APIRouter(prefix="/assets", tags=["Asset Registry"])

@router.get("")
def list_assets(centre_id: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Asset)
    if centre_id:
        query = query.filter(Asset.centre_id == centre_id)
    if status and status != "ALL":
        query = query.filter(Asset.status == status)

    assets = query.all()
    results = []
    for a in assets:
        cat = db.query(AssetCategory).filter(AssetCategory.id == a.category_id).first()
        qr = db.query(QRCode).filter(QRCode.asset_id == a.id).first()
        results.append({
            "id": a.id,
            "asset_tag": a.asset_tag,
            "category_name": cat.name if cat else "General",
            "model_name": a.model_name,
            "status": a.status,
            "qr_payload": qr.qr_payload if qr else None,
            "digital_signature": qr.digital_signature if qr else None
        })
    return results
