import React, { createContext, useContext, useState } from 'react';

type Language = 'hi' | 'en' | 'mr' | 'bn' | 'ta' | 'te' | 'kn' | 'gu';

interface Translations {
  [key: string]: { [lang in Language]: string };
}

export const translations: Translations = {
  app_name: {
    hi: 'संजीविनी',
    en: 'Sanjeevini',
    mr: 'संजीविनी',
    bn: 'সঞ্জীবনী',
    ta: 'சஞ்சீவினி',
    te: 'సంజీవిని',
    kn: 'ಸಂಜೀವಿನಿ',
    gu: 'સંજીવિની',
  },
  app_subtitle: {
    hi: 'राष्ट्रीय स्वास्थ्य संसाधन एवं आपूर्ति श्रृंखला लचीलापन मंच',
    en: 'National Health Resource & Supply Chain Resilience Platform',
    mr: 'राष्ट्रीय आरोग्य संसाधने आणि पुरवठा साखळी सक्षमीकरण',
    bn: 'জাতীয় স্বাস্থ্য সম্পদ ও সরবরাহ শৃঙ্খল স্থিতিস্থাপকতা প্ল্যাটফর্ম',
    ta: 'தேசிய சுகாதார வள மற்றும் விநியோகச் சங்கிலி மீள்தன்மை தளம்',
    te: 'జాతీయ ఆరోగ్య వనరుల మరియు సరఫరా గొలుసు పునరుద్ధరణ వేదిక',
    kn: 'ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಸಂಪನ್ಮೂಲ ಮತ್ತು ಪೂರೈಕೆ ಸರಪಳಿ ವೇದಿಕೆ',
    gu: 'રાષ્ટ્રીય આરોગ્ય સંસાધન અને સપ્લાય ચેઇન સ્થિતિસ્થાપકતા પ્લેટફોર્મ',
  },
  nav_national: {
    hi: 'राष्ट्रीय कमान',
    en: 'National Command',
    mr: 'राष्ट्रीय कमांड',
    bn: 'জাতীয় কমান্ড',
    ta: 'தேசிய கட்டளை',
    te: 'జాతీయ కమాండ్',
    kn: 'ರಾಷ್ಟ್ರೀಯ ಕಮಾಂಡ್',
    gu: 'રાષ્ટ્રીય કમાન્ડ',
  },
  nav_map: {
    hi: 'लाइव संसाधन मानचित्र',
    en: 'Live GIS Map',
    mr: 'थेट संसाधन नकाशा',
    bn: 'লাইভ জিআইএস মানচিত্র',
    ta: 'நேரலை வரைபடம்',
    te: 'లైవ్ రిసోర్స్ మ్యాప్',
    kn: 'ಲೈವ್ ಸಂಪನ್ಮೂಲ ನಕ್ಷೆ',
    gu: 'લાઇવ સંસાધન નકશો',
  },
  nav_logistics: {
    hi: 'जिला पुनर्वितरण',
    en: 'District Logistics',
    mr: 'जिल्हा पुनर्वितरण',
    bn: 'জেলা লজিস্টিকস',
    ta: 'மாவட்ட விநியோகம்',
    te: 'జిల్లా లాజిస్టిక్స్',
    kn: 'ಜಿಲ್ಲಾ ಲಾಜಿಸ್ಟಿಕ್ಸ್',
    gu: 'જિલ્લા લોજિસ્ટિક્સ',
  },
  nav_phc: {
    hi: 'पीएचसी कंसोल',
    en: 'PHC Console',
    mr: 'पीएचसी कन्सोल',
    bn: 'পিএইচসি কনসোল',
    ta: 'பிஎச்சி கன்சோல்',
    te: 'పీహెచ్‌సీ కన్సోల్',
    kn: 'ಪಿಎಚ್‌ಸಿ ಕನ್ಸೋಲ್',
    gu: 'પીએચસી કન્સોલ',
  },
  nav_scan: {
    hi: 'रजिस्टर स्कैनर',
    en: 'Vision OCR Scanner',
    mr: 'नोंदवही स्कॅनर',
    bn: 'রেজিস্টার স্ক্যানার',
    ta: 'பதிவேடு ஸ்கேனர்',
    te: 'రిజిస్టర్ స్కానర్',
    kn: 'ರಿಜಿಸ್ಟರ್ ಸ್ಕ್ಯಾನರ್',
    gu: 'રજિસ્ટર સ્કેનર',
  },
  nav_voice: {
    hi: 'वाणी सहायक (आशा/एएनएम)',
    en: 'Indic Voice (ASHA)',
    mr: 'आवाज साहाय्यक (आशा)',
    bn: 'কন্ঠ সহকারী (আশা)',
    ta: 'குரல் உதவியாளர்',
    te: 'వాయిస్ అసిస్టెంట్',
    kn: 'ಧ್ವನಿ ಸಹಾಯಕ',
    gu: 'વોઇસ સહાયક',
  },
  nav_federated: {
    hi: 'फेडरेटेड एआई',
    en: 'Federated AI',
    mr: 'फेडरेटेड एआय',
    bn: 'ফেডারেটেড এআই',
    ta: 'கூட்டு AI',
    te: 'ఫెడరేటెడ్ AI',
    kn: 'ಫೆಡರೇಟೆಡ್ ಎಐ',
    gu: 'ફેડરેટેડ AI',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
