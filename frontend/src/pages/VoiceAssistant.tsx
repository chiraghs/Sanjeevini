import React, { useState } from 'react';
import { api } from '../services/api';
import { Mic, Volume2, Globe, Play, CheckCircle2, ShieldAlert } from 'lucide-react';

export const VoiceAssistant: React.FC = () => {
  const [language, setLanguage] = useState<string>('hi');
  const [transcript, setTranscript] = useState<string>('हमारे पास पेरासिटामोल के सिर्फ 15 स्ट्रिप बचे हैं और ओआरएस खत्म हो गया है');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<any>(null);

  const sampleQueries: { [key: string]: string[] } = {
    hi: [
      'हमारे पास पेरासिटामोल के सिर्फ 15 स्ट्रिप बचे हैं और ओआरएस खत्म हो गया है',
      'आज ओपीडी में 60 मरीज आए हैं जिनमें से 15 को तेज बुखार है',
      'सांप के काटने का एक गंभीर मरीज आया है, एंटीवेनम तुरंत चाहिए'
    ],
    bn: [
      'আমাদের এখানে প্যারাসিটামলের মাত্র ১০টি স্ট্রিপ বাকি আছে এবং ওআরএস শেষ',
      'আজকে ওপিডিতে ৫০ জন রোগী এসেছেন, অনেকেরই ডায়রিয়া',
      'সাপের কামড়ের জন্য অবিলম্বে অ্যান্টিভেনম প্রয়োজন'
    ],
    te: [
      'మా వద్ద పారాసిటమాల్ కేవలం 15 స్ట్రిప్పులు మాత్రమే మిగిలి ఉన్నాయి',
      'ఈ రోజు ఓపీడీకి 45 మంది రోగులు వచ్చారు',
      'పాము కాటుకు తక్షణమే యాంటీవీనమ్ అవసరం'
    ],
    mr: [
      'आमच्याकडे पॅरासिटामॉलचे फक्त 20 स्ट्रिप्स शिल्लक आहेत',
      'आज ओपीडीमध्ये 45 रुग्ण आले, ताप व अतिसाराचे प्रमाण जास्त आहे',
      'सापाच्या चावण्याचे 2 रुग्ण दाखल झाले आहेत, तातडीने अँटीव्हेनम पाठवा'
    ],
    ta: [
      'பாராசிட்டமால் 20 ஸ்ட்ரிப் மட்டுமே மீதமுள்ளது மற்றும் ஓஆர்எஸ் தீர்ந்துவிட்டது',
      'இன்று அவசர சிகிச்சையில் 35 நோயாளிகள் வந்துள்ளனர்',
      'பாம்பு கடிக்கு ஆன்டிவெனம் உடனடியாக தேவை'
    ],
    ur: [
      'ہمارے پاس پیراسیٹامول کے صرف 15 سٹرپس باقی ہیں',
      'آج او پی ڈی میں 50 مریض آئے ہیں، بخار کے کیسز زیادہ ہیں',
      'سانپ کے کاٹنے کے مریض کے لیے اینٹی وینم کی فوری ضرورت ہے'
    ],
    gu: [
      'અમારી પાસે પેરાસિટામોલની માત્ર ૧૫ પટ્ટીઓ બાકી છે',
      'આજે ઓપીડીમાં ૫૫ દર્દીઓ આવ્યા છે',
      'સાપ કરડવા માટે તાત્કાલિક એન્ટિવેનમની જરૂર છે'
    ],
    kn: [
      'ನಮ್ಮಲ್ಲಿ ಪ್ಯಾರಸಿಟಮಾಲ್ ಕೇವಲ 15 ಸ್ಟ್ರಿಪ್‌ಗಳು ಮಾತ್ರ ಉಳಿದಿವೆ',
      'ಇಂದು ಒಪಿಡಿಯಲ್ಲಿ 50 ರೋಗಿಗಳು ಬಂದಿದ್ದಾರೆ',
      'ಹಾವು ಕಡಿತಕ್ಕೆ ತುರ್ತಾಗಿ ಆಂಟಿವೆನಮ್ ಅಗತ್ಯವಿದೆ'
    ],
    ml: [
      'പാരസെറ്റമോൾ 20 സ്ട്രിപ്പുകൾ മാത്രമേ അവശേഷിക്കുന്നുള്ളൂ',
      'ഇന്ന് ഒപിഡിയിൽ 40 രോഗികൾ എത്തിയിട്ടുണ്ട്',
      'പാമ്പുകടിയേറ്റ രോഗിക്ക് ആന്റിവെനം അടിയന്തിരമായി ആവശ്യമാണ്'
    ],
    or: [
      'ଆମ ପାଖରେ ପାରାସିଟାମୋଲର ମାତ୍ର ୧୫ଟି ଷ୍ଟ୍ରିପ୍ ବାକି ଅଛି',
      'ଆଜି ଓପିଡିରେ ୪୫ ଜଣ ରୋଗୀ ଆସିଛନ୍ତି',
      'ସାପ କାମୁଡ଼ା ପାଇଁ ତୁରନ୍ତ ଆଣ୍ଟିଭେନମ୍ ଦରକାର'
    ],
    pa: [
      'ਸਾਡੇ ਕੋਲ ਪੈਰਾਸੀਟਾਮੋਲ ਦੀਆਂ ਸਿਰਫ਼ 15 ਪੱਟੀਆਂ ਬਚੀਆਂ ਹਨ',
      'ਅੱਜ ਓਪੀਡੀ ਵਿੱਚ 55 ਮਰੀਜ਼ ਆਏ ਹਨ',
      'ਸੱਪ ਦੇ ਕੱਟਣ ਲਈ ਤੁਰੰਤ ਐਂਟੀਵੈਨਮ ਦੀ ਲੋੜ ਹੈ'
    ],
    as: [
      'আমাৰ ওচৰত পেৰাচিটামলৰ মাত্ৰ ১৫টা ষ্ট্ৰিপ বাকী আছে',
      'বানপানীৰ পিছত ডায়েৰিয়াৰ ৰোগী বৃদ্ধি পাইছে, অ’আৰএছ প্ৰয়োজন',
      'সাপে খোৱা ৰোগীৰ বাবে এণ্টিভেনম জৰুৰীভাৱে লাগে'
    ],
    mai: [
      'हमरा सब लग पैरासिटामोल के मात्र १५ पत्ता बाचल अछि',
      'आई ओपीडी में ५० मरीज आएल छैथ',
      'सांप कटने के मरीज लेल एंटीवेनम तुरंते चाही'
    ],
    sat: [
      'ᱟᱞᱮ ᱴᱷᱮᱱ ᱯᱮᱨᱟᱥᱤᱴᱟᱢᱚᱞ ᱨᱮᱱᱟᱜ ᱑᱕ ᱜᱚᱴᱟᱝ ᱥᱩᱢᱩᱝ ᱢᱮᱱᱟᱜ-ᱟ',
      'ᱛᱮᱦᱮᱧ ᱦᱟᱥᱯᱟᱛᱟᱞ ᱨᱮ ᱔᱐ ᱦᱚᱲ ᱨᱩᱣᱟᱹ ᱧᱟᱢ ᱟᱠᱟᱱᱟ',
      'ᱵᱤᱧ ᱜᱮᱨ ᱞᱟᱹᱜᱤᱫ ᱮᱱᱴᱤᱵᱷᱮᱱᱚᱢ ᱞᱚᱜᱚᱱ ᱞᱟᱹᱠᱛᱤ'
    ],
    ks: [
      'اسہِ نش چھِ پیراسیٹامول صِرف ۱۵ سٹرپ بچمت',
      'از دراو او پی ڈی منٛز ۵۰ مریض',
      'تُرنت اینٹی وینم چُھ ضرورت'
    ],
    ne: [
      'हामीसँग सिटामोलको १५ वटा स्ट्रिप मात्र बाँकी छ',
      'आज ओपीडीमा ४५ जना बिरामी आएका छन्',
      'सर्पले टोकेको बिरामीको लागि तुरुन्त एन्टिभेनम चाहिन्छ'
    ],
    kok: [
      'आमच्याकडे पॅरासिटामॉलचे फक्त १५ स्ट्रिप्स उरल्यात',
      'आयज ओपिडींत ४० दुयेंती आयल्यात',
      'सोरोप चावल्ल्या खातीर रोखडेंच अँटीव्हेनम जाय'
    ],
    sd: [
      'اسان وٽ پيراسيٽامول جا صرف ۱۵ اسٽرپس بچيا آهن',
      'اڄ او پي ڊي ۾ ۴۵ مريض آيا آهن',
      'نانگ جي چڪ لاءِ فوري اينٽي وينم گهرجي'
    ],
    doi: [
      'साढ़े कोल पैरासिटामोल दियां सिर्फ १५ पत्तियां बचियां न',
      'अज्ज ओपीडी च ५० मरीज आये न',
      'सप्पै दे डंगने आस्तै एंटीवेनम तुरंत चाहिदा'
    ],
    mni: [
      'ঐখোয়গী পারাসিটামোল মাত্র ১৫ স্ত্ৰিপ ঙাইরি',
      'ঙসি ওপিডিদা অনাবা ৫০ লাকখি',
      'লিন্না চিকপগীদমক এন্তিভেনম য়াম্না থুনা দরকার ওই'
    ],
    brx: [
      "जोंहा प्यारासिटामोलनि खब १५ स्ल'ब'ल' दं",
      'दिनै ओपिडिफाव ४५ जानाय मानसि फैदों',
      'जिउनि रैखाथि थाखाय एन्टिभेनोम नांगौ'
    ],
    sa: [
      'अस्माकं समीपे ज्वरशामक-औषधस्य पञ्चदश पट्टिकाः एव अवशिष्टाः',
      'अद्य चिकित्सालये पञ्चाशत् रोगिणः आगताः',
      'सर्पदंश-रोगिणः कृते शीघ्रम् औषधं आवश्यकम्'
    ],
    en: [
      'We have only 15 strips of Paracetamol remaining and ORS stock is depleted',
      'Today OPD footfall is 65 patients with acute fever surge',
      'Emergency snakebite admission reported, urgent antivenom required'
    ]
  };

  const languagesList = [
    { code: 'hi', label: 'हिन्दी (Hindi)', region: 'North/Central' },
    { code: 'bn', label: 'বাংলা (Bengali)', region: 'West Bengal/Assam' },
    { code: 'te', label: 'తెలుగు (Telugu)', region: 'Andhra Pradesh/Telangana' },
    { code: 'mr', label: 'मराठी (Marathi)', region: 'Maharashtra' },
    { code: 'ta', label: 'தமிழ் (Tamil)', region: 'Tamil Nadu' },
    { code: 'ur', label: 'اردو (Urdu)', region: 'Pan-India' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)', region: 'Gujarat' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', region: 'Karnataka' },
    { code: 'ml', label: 'മലയാളം (Malayalam)', region: 'Kerala' },
    { code: 'or', label: 'ଓଡ଼ିଆ (Odia)', region: 'Odisha' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', region: 'Punjab' },
    { code: 'as', label: 'অসমীয়া (Assamese)', region: 'Assam' },
    { code: 'mai', label: 'मैथिली (Maithili)', region: 'Bihar' },
    { code: 'sat', label: 'ᱥᱟᱱᱛᱟᱲᱤ (Santali)', region: 'Jharkhand/Odisha' },
    { code: 'ks', label: 'कॉशुर / كٲشُر (Kashmiri)', region: 'Jammu & Kashmir' },
    { code: 'ne', label: 'नेपाली (Nepali)', region: 'Sikkim/WB' },
    { code: 'kok', label: 'कोंकणी (Konkani)', region: 'Goa/Karnataka' },
    { code: 'sd', label: 'सिंधी / سنڌي (Sindhi)', region: 'Western' },
    { code: 'doi', label: 'डोगरी (Dogri)', region: 'Jammu' },
    { code: 'mni', label: 'মণিপুরী / ꯃꯤꯇꯩꯂꯣꯟ (Manipuri)', region: 'Manipur' },
    { code: 'brx', label: "बर' (Bodo)", region: 'Assam' },
    { code: 'sa', label: 'संस्कृतम् (Sanskrit)', region: 'AYUSH/National' },
    { code: 'en', label: 'English (National Coord)', region: 'National' }
  ];

  const handleProcessVoice = async (textToProcess?: string) => {
    const text = textToProcess || transcript;
    setIsProcessing(true);
    setProcessedResult(null);

    try {
      const res = await api.processVoice({
        transcript: text,
        language_code: language,
        facility_id: 1,
      });
      setProcessedResult(res.data.processed);

      // Play audio feedback synthesis using Web Speech API if supported
      if ('speechSynthesis' in window && res.data.processed?.spoken_reply_indic) {
        const utterance = new SpeechSynthesisUtterance(res.data.processed.spoken_reply_indic);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="app-container">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>
          Indic Voice-First Assistant for Frontline Cadres (ASHA / ANM)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Supports all 22 official scheduled languages of the Constitution of India for hands-free field stock reporting
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        
        {/* Voice Input Section */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          
          {/* Language Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={16} color="var(--emerald)" />
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Select Scheduled Language (22 Official + English):</span>
            </div>
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value;
                setLanguage(newLang);
                const presets = sampleQueries[newLang] || sampleQueries['hi'];
                setTranscript(presets[0]);
              }}
              style={{
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-card)',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: '0.825rem',
                fontWeight: 600,
                maxWidth: '260px'
              }}
            >
              {languagesList.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label} — {l.region}
                </option>
              ))}
            </select>
          </div>

          {/* Transcript Box */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Spoken Health Update (Voice Capture or Field Note):
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-card)',
                borderRadius: 6,
                padding: '10px 12px',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button
              className="btn-primary"
              style={{ flex: 1, padding: '10px 16px' }}
              onClick={() => handleProcessVoice()}
              disabled={isProcessing}
            >
              <Mic size={16} />
              <span>{isProcessing ? 'Processing Speech...' : 'Process Voice / Text Update'}</span>
            </button>
          </div>

          {/* Preset Prompts */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>
              Sample field reporting presets for {languagesList.find(l => l.code === language)?.label}:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(sampleQueries[language] || sampleQueries['hi']).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(q);
                    handleProcessVoice(q);
                  }}
                  className="btn-outline"
                  style={{ textAlign: 'left', fontSize: '0.8rem', padding: '6px 10px', justifyContent: 'flex-start' }}
                >
                  <Play size={11} color="var(--emerald)" />
                  <span>"{q}"</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Clinical Entity Extraction & Audio Confirmation */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>
            Standardized Clinical Action & Entity Extraction
          </h3>

          {!processedResult ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              <Volume2 size={36} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
              <div style={{ fontSize: '0.85rem' }}>Select a phrase or enter spoken words in any of India's 22 official languages to extract clinical inventory actions.</div>
            </div>
          ) : (
            <div>
              {/* Detected Intent */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, background: 'var(--bg-app)', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Identified Action</span>
                  <div style={{ fontWeight: 600, color: 'var(--emerald)', fontSize: '0.95rem' }}>{processedResult.intent}</div>
                </div>
                <span className="badge badge-stable">Lang: {processedResult.detected_language?.toUpperCase()}</span>
              </div>

              {/* Entities */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>Clinical Entities:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: 'var(--bg-app)', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Medicine</div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{processedResult.entities?.medicine_name || 'N/A'}</div>
                  </div>
                  <div style={{ background: 'var(--bg-app)', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Quantity</div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--emerald)' }}>{processedResult.entities?.quantity || 'N/A'} units</div>
                  </div>
                </div>
              </div>

              {/* English Translation */}
              <div style={{ background: 'var(--bg-app)', padding: '10px 12px', borderRadius: 6, marginBottom: 14, fontSize: '0.8rem', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', marginBottom: 2 }}>National Common Record (English):</span>
                <div>"{processedResult.english_translation}"</div>
              </div>

              {/* Indic Spoken Audio Confirmation */}
              <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-card)', padding: '12px', borderRadius: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--emerald)', fontWeight: 600, fontSize: '0.8rem' }}>
                  <Volume2 size={15} />
                  <span>Synthesized Spoken Response (Local Language):</span>
                </div>
                <div style={{ fontSize: '0.9rem' }}>
                  "{processedResult.spoken_reply_indic}"
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
};
