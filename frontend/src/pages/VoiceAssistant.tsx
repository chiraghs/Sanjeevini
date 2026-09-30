import React, { useState } from 'react';
import { api } from '../services/api';
import { Mic, Volume2, Sparkles, CheckCircle, Globe, Play } from 'lucide-react';

export const VoiceAssistant: React.FC = () => {
  const [language, setLanguage] = useState<string>('hi');
  const [transcript, setTranscript] = useState<string>('हमारे पास पेरासिटामोल के सिर्फ 15 स्ट्रिप बचे हैं और ओआरएस खत्म हो गया है');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<any>(null);

  const sampleQueries: { [key: string]: string[] } = {
    hi: [
      'हमारे पास पेरासिटामोल के सिर्फ 15 स्ट्रिप बचे हैं और ओआरएस खत्म हो गया है',
      'आज ओपीडी में 60 मरीज आए हैं जिनमें से 15 को बुखार है',
      'सांप के काटने का एक आपातकालीन मरीज आया है, एंटीवेनम चाहिए'
    ],
    mr: [
      'आमच्याकडे पॅरासिटामॉलचे फक्त 20 स्ट्रिप्स शिल्लक आहेत',
      'आज ओपीडीमध्ये 45 रुग्ण आले, ताप व अतिसाराचे प्रमाण जास्त आहे',
      'सापाच्या चावण्याचे 2 रुग्ण दाखल झाले आहेत, अँटीव्हेनम पाठवा'
    ],
    bn: [
      'আমাদের এখানে প্যারাসিটামলের মাত্র ১০টি স্ট্রিপ বাকি আছে',
      'আজকে ওপিডিতে ৫০ জন রোগী এসেছেন',
      'সাপের কামড়ের জন্য অবিলম্বে অ্যান্টিভেনম প্রয়োজন'
    ],
    ta: [
      'பாராசிட்டமால் 20 ஸ்ட்ரிப் மட்டுமே மீதமுள்ளது',
      'இன்று அவசர சிகிச்சையில் 35 நோயாளிகள் வந்துள்ளனர்',
      'பாம்பு கடிக்கு ஆன்டிவெனம் உடனடியாக தேவை'
    ]
  };

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

      // Play audio feedback synthesis using Web Speech API
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
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Mic size={24} color="#34d399" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            Indic Voice-First Assistant for Frontline Cadres (ASHA / ANM)
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Enabling rural healthcare workers to report daily drug usage and emergency case arrivals by speaking in their mother tongue
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        
        {/* Voice Input Section */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          
          {/* Language Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={18} color="#34d399" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select Spoken Indic Language:</span>
            </div>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                const presets = sampleQueries[e.target.value] || sampleQueries['hi'];
                setTranscript(presets[0]);
              }}
              style={{
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-card)',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>

          {/* Transcript Box */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Spoken Transcript (Voice Capture / Audio Input):
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                background: 'hsla(220, 20%, 30%, 0.15)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-card)',
                borderRadius: 8,
                padding: '12px',
                fontSize: '0.95rem',
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Interactive Mic Button */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button
              className="btn-primary"
              style={{ flex: 1, padding: '12px' }}
              onClick={() => handleProcessVoice()}
              disabled={isProcessing}
            >
              <Mic size={18} />
              <span>{isProcessing ? 'Translating & Extracting...' : 'Process Spoken Audio (Cloud STT + Gemini)'}</span>
            </button>
          </div>

          {/* Preset Prompts */}
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Try sample field reporting audio presets:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(sampleQueries[language] || sampleQueries['hi']).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(q);
                    handleProcessVoice(q);
                  }}
                  className="btn-outline"
                  style={{ textAlign: 'left', fontSize: '0.825rem', padding: '8px 12px', justifyContent: 'flex-start' }}
                >
                  <Play size={12} color="#34d399" />
                  <span>"{q}"</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Clinical Entity Extraction & Audio Confirmation */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="#34d399" />
            <span>Extracted Intent & Clinical Action</span>
          </h3>

          {!processedResult ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Volume2 size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <div>Speak or click a sample phrase to view automated clinical NLP translation and entity extraction.</div>
            </div>
          ) : (
            <div>
              {/* Detected Intent */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: 'hsla(220, 20%, 30%, 0.2)', padding: '10px 14px', borderRadius: 8 }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Identified Action</span>
                  <div style={{ fontWeight: 700, color: '#34d399', fontSize: '1rem' }}>{processedResult.intent}</div>
                </div>
                <span className="badge badge-stable">Language: {processedResult.detected_language?.toUpperCase()}</span>
              </div>

              {/* Entities */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Extracted Entities:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: 'hsla(220, 20%, 30%, 0.15)', padding: '10px', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Medicine</div>
                    <div style={{ fontWeight: 600 }}>{processedResult.entities?.medicine_name || 'N/A'}</div>
                  </div>
                  <div style={{ background: 'hsla(220, 20%, 30%, 0.15)', padding: '10px', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quantity</div>
                    <div style={{ fontWeight: 600, color: '#34d399' }}>{processedResult.entities?.quantity || 'N/A'} units</div>
                  </div>
                </div>
              </div>

              {/* English Translation */}
              <div style={{ background: 'hsla(220, 20%, 30%, 0.1)', padding: '12px', borderRadius: 8, marginBottom: 16, fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Standardized Translation:</span>
                <div>"{processedResult.english_translation}"</div>
              </div>

              {/* Indic Spoken Audio Confirmation */}
              <div style={{ background: 'hsla(150, 70%, 42%, 0.15)', border: '1px solid hsla(150, 70%, 42%, 0.3)', padding: '14px', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: '#34d399', fontWeight: 600, fontSize: '0.85rem' }}>
                  <Volume2 size={16} />
                  <span>Synthesized Voice Response (Cloud TTS):</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>
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
