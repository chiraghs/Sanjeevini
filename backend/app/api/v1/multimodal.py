from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.multimodal_ocr import process_register_image

router = APIRouter()

@router.post("/scan-register")
async def scan_register(
    file: UploadFile = File(...),
    facility_id: int = Form(1),
    db: Session = Depends(get_db)
):
    """Processes uploaded photo of paper stock register using Gemini 1.5 Flash Vision."""
    contents = await file.read()
    result = process_register_image(contents, file.content_type or "image/jpeg")
    return {
        "success": True,
        "facility_id": facility_id,
        "filename": file.filename,
        "data": result
    }
