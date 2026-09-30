import re
from typing import Dict, Any
from app.services.gemini_client import gemini_client

class IndicVoiceService:
    """Multilingual Speech-to-Intent Service for ASHA / ANM field workers."""
    
    LANGUAGES = [
        {"code": "hi", "name": "Hindi", "label": "हिन्दी"},
        {"code": "mr", "name": "Marathi", "label": "मराठी"},
        {"code": "bn", "name": "Bengali", "label": "বাংলা"},
        {"code": "ta", "name": "Tamil", "label": "தமிழ்"},
        {"code": "te", "name": "Telugu", "label": "తెలుగు"},
        {"code": "kn", "name": "Kannada", "label": "ಕನ್ನಡ"},
        {"code": "gu", "name": "Gujarati", "label": "ગુજરાતી"},
        {"code": "en", "name": "English", "label": "English"}
    ]

    def process_voice_transcript(self, transcript: str, language_code: str = "hi") -> Dict[str, Any]:
        """Parses spoken frontline health updates into structured database actions."""
        prompt = f"""
        You are a clinical NLP assistant for India's National Health Mission.
        Translate and extract clinical entities from this spoken health update:
        Language: {language_code}
        Transcript: "{transcript}"
        
        Respond with JSON:
        {{
          "intent": "STOCK_UPDATE | FOOTFALL_REPORT | CRITICAL_EMERGENCY | UNKNOWN",
          "detected_language": "{language_code}",
          "entities": {{
            "medicine_name": "Standardized generic name or null",
            "quantity": 100,
            "action": "ADD | DEDUCT | SET | REPORT",
            "department": "OPD | IPD | MATERNAL | null"
          }},
          "english_translation": "Clear English translation of what was spoken",
          "spoken_reply_indic": "Natural, polite confirmation sentence in the user's language ({language_code})",
          "urgency_level": "ROUTINE | URGENT | LIFE_CRITICAL"
        }}
        """
        result = gemini_client.generate_json(prompt)
        if not result or "intent" not in result:
            # Deterministic heuristic fallback
            lower = transcript.lower()
            qty = 50
            digits = re.findall(r'\d+', transcript)
            if digits:
                qty = int(digits[0])
                
            med_name = "Paracetamol 500mg"
            if "ors" in lower:
                med_name = "ORS Sachets"
            elif "venom" in lower or "सांप" in lower or "snake" in lower:
                med_name = "Anti-Snake Venom"
            elif "oxytocin" in lower or "डिलीवरी" in lower:
                med_name = "Oxytocin 10 IU"
                
            result = {
                "intent": "STOCK_UPDATE",
                "detected_language": language_code,
                "entities": {
                    "medicine_name": med_name,
                    "quantity": qty,
                    "action": "DEDUCT",
                    "department": "Emergency"
                },
                "english_translation": f"Reported stock update: {qty} units of {med_name} consumed.",
                "spoken_reply_indic": f"पुष्टि: {med_name} का स्टॉक अपडेट कर दिया गया है।",
                "urgency_level": "ROUTINE"
            }
        return result

indic_voice_service = IndicVoiceService()
