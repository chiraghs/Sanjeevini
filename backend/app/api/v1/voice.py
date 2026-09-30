from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.voice_indic import indic_voice_service

router = APIRouter()

class VoiceQueryRequest(BaseModel):
    transcript: str
    language_code: Optional[str] = "hi"
    facility_id: Optional[int] = 1

@router.post("/process")
def process_voice(req: VoiceQueryRequest):
    result = indic_voice_service.process_voice_transcript(req.transcript, req.language_code)
    return {
        "success": True,
        "processed": result
    }

@router.get("/languages")
def get_supported_languages():
    return {"languages": indic_voice_service.LANGUAGES}
