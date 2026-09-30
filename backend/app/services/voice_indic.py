import re
from typing import Dict, Any, List
from app.services.gemini_client import gemini_client

class IndicVoiceService:
    """Multilingual Speech-to-Intent Service for ASHA / ANM field workers supporting all 22 official scheduled languages of India."""
    
    LANGUAGES = [
        {"code": "hi", "name": "Hindi", "label": "हिन्दी", "script": "Devanagari", "region": "Northern / Central India"},
        {"code": "bn", "name": "Bengali", "label": "বাংলা", "script": "Bengali", "region": "West Bengal / Tripura / Assam"},
        {"code": "te", "name": "Telugu", "label": "తెలుగు", "script": "Telugu", "region": "Andhra Pradesh / Telangana"},
        {"code": "mr", "name": "Marathi", "label": "मराठी", "script": "Devanagari", "region": "Maharashtra / Goa"},
        {"code": "ta", "name": "Tamil", "label": "தமிழ்", "script": "Tamil", "region": "Tamil Nadu / Puducherry"},
        {"code": "ur", "name": "Urdu", "label": "اردو", "script": "Perso-Arabic", "region": "Pan-India / J&K / UP / Telangana"},
        {"code": "gu", "name": "Gujarati", "label": "ગુજરાતી", "script": "Gujarati", "region": "Gujarat"},
        {"code": "kn", "name": "Kannada", "label": "ಕನ್ನಡ", "script": "Kannada", "region": "Karnataka"},
        {"code": "ml", "name": "Malayalam", "label": "മലയാളം", "script": "Malayalam", "region": "Kerala / Lakshadweep"},
        {"code": "or", "name": "Odia", "label": "ଓଡ଼ିଆ", "script": "Odia", "region": "Odisha"},
        {"code": "pa", "name": "Punjabi", "label": "ਪੰਜਾਬੀ", "script": "Gurmukhi", "region": "Punjab / Delhi / Haryana"},
        {"code": "as", "name": "Assamese", "label": "অসমীয়া", "script": "Bengali-Assamese", "region": "Assam"},
        {"code": "mai", "name": "Maithili", "label": "मैथिली", "script": "Devanagari", "region": "Bihar / Jharkhand"},
        {"code": "sat", "name": "Santali", "label": "ᱥᱟᱱᱛᱟᱲᱤ", "script": "Ol Chiki", "region": "Jharkhand / Odisha / WB"},
        {"code": "ks", "name": "Kashmiri", "label": "कॉशुर / كٲشُر", "script": "Perso-Arabic / Devanagari", "region": "Jammu & Kashmir"},
        {"code": "ne", "name": "Nepali", "label": "नेपाली", "script": "Devanagari", "region": "Sikkim / West Bengal"},
        {"code": "kok", "name": "Konkani", "label": "कोंकणी", "script": "Devanagari / Roman", "region": "Goa / Coastal Karnataka"},
        {"code": "sd", "name": "Sindhi", "label": "सिंधी / سنڌي", "script": "Perso-Arabic / Devanagari", "region": "Western India"},
        {"code": "doi", "name": "Dogri", "label": "डोगरी", "script": "Devanagari", "region": "Jammu"},
        {"code": "mni", "name": "Manipuri (Meitei)", "label": "মণিপুরী / ꯃꯤꯇꯩꯂꯣꯟ", "script": "Meitei Mayek / Bengali", "region": "Manipur"},
        {"code": "brx", "name": "Bodo", "label": "बर'", "script": "Devanagari", "region": "Assam / Bodoland"},
        {"code": "sa", "name": "Sanskrit", "label": "संस्कृतम्", "script": "Devanagari", "region": "Classical / AYUSH"},
        {"code": "en", "name": "English", "label": "English", "script": "Latin", "region": "National Coordination"}
    ]

    def process_voice_transcript(self, transcript: str, language_code: str = "hi") -> Dict[str, Any]:
        """Parses spoken frontline health updates into structured database actions."""
        prompt = f"""
        You are a clinical NLP assistant for India's National Health Mission.
        Translate and extract clinical entities from this spoken health update from an ASHA/ANM worker:
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
            if "ors" in lower or "ओआरएस" in lower:
                med_name = "ORS Sachets"
            elif "venom" in lower or "सांप" in lower or "snake" in lower or "சாம்பு" in lower or "పాము" in lower or "হাপ" in lower:
                med_name = "Anti-Snake Venom"
            elif "oxytocin" in lower or "डिलीवरी" in lower or "प्रसूति" in lower or "பிரசவம்" in lower:
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
                "spoken_reply_indic": f"पुष्टि: {med_name} का स्टॉक सफलतापूर्वक अपडेट कर दिया गया है।",
                "urgency_level": "ROUTINE"
            }
        return result

indic_voice_service = IndicVoiceService()
