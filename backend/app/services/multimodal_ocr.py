from typing import Dict, Any
from app.services.gemini_client import gemini_client

def process_register_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """Extract medicine ledger table from camera photo using Gemini 1.5 Flash Vision."""
    prompt = """
    You are an expert AI medical supply auditor for India's Ministry of Health and Family Welfare (MoHFW).
    Examine this photo of a Primary Health Centre (PHC) physical stock ledger register or medicine packaging.
    
    Extract each row of handwritten or printed inventory into a JSON object:
    {
      "document_type": "PHC_DAILY_STOCK_REGISTER",
      "confidence_score": 0.95,
      "detected_facility": "Identified facility or null",
      "register_date": "YYYY-MM-DD or null",
      "extracted_items": [
        {
          "drug_name": "Generic or brand name",
          "nlem_code": "Approximate NLEM drug code",
          "batch_no": "Batch identifier",
          "expiry_date": "YYYY-MM-DD",
          "quantity_recorded": 100,
          "unit": "Strip/Vial/Ampoule/Bottle",
          "status": "STABLE | STOCK_WARNING | CRITICAL_DEFICIT | IMMINENT_STOCKOUT",
          "verified": true
        }
      ],
      "ai_auditor_notes": "Clinical summary of urgent stock vulnerabilities detected"
    }
    """
    return gemini_client.generate_multimodal_json(prompt, image_bytes, mime_type)
