// Multi-language command patterns for the assistant

export const commandPatterns = {
  // Add expense patterns
  addExpense: {
    en: /add\s+\$?(\d+(?:\.\d+)?)\$?\s+(?:dollars?\s+)?(?:for|on)?\s*(.+)/i,
    hi: /(\d+(?:\.\d+)?)\s*(?:डॉलर|रुपये)?\s*(?:जोड़ें|जोड़|add)\s*(?:के लिए|के|for)?\s*(.+)/i,
    te: /(\d+(?:\.\d+)?)\s*(?:డాలర్లు|డాలర్)?\s*(?:జోడించండి|జోడించ|add)?\s*(?:కోసం|కు|for)?\s*(.+)/i,
    kn: /(\d+(?:\.\d+)?)\s*(?:ಡಾಲರ್|ರೂಪಾಯಿ)?\s*(?:ಸೇರಿಸಿ|add)?\s*(?:ಗಾಗಿ|ಗೆ|for)?\s*(.+)/i,
    ml: /(\d+(?:\.\d+)?)\s*(?:ഡോളർ|രൂപ)?\s*(?:ചേർക്കുക|add)?\s*(?:ആയി|for)?\s*(.+)/i,
    ta: /(\d+(?:\.\d+)?)\s*(?:டாலர்|ரூபாய்)?\s*(?:சேர்|add)?\s*(?:க்கு|for)?\s*(.+)/i
  },
  
  // Goal patterns
  setGoal: {
    en: /(?:set|create)\s+(?:(weekly|monthly|yearly)\s+)?goal\s+\$?(\d+(?:\.\d+)?)\$?\s*(?:for|on)?\s*(.+)?/i,
    hi: /(?:(साप्ताहिक|मासिक|वार्षिक)\s+)?(?:लक्ष्य|goal)\s+(\d+(?:\.\d+)?)\s*(?:डॉलर)?\s*(?:सेट|set)?\s*(?:के लिए|for)?\s*(.+)?/i,
    te: /(?:(వారపు|నెలవారీ|వార్షిక)\s+)?(?:లక్ష్యం|goal)\s+(\d+(?:\.\d+)?)\s*(?:డాలర్లు)?\s*(?:సెట్|set)?\s*(?:కోసం|for)?\s*(.+)?/i,
    kn: /(?:(ವಾರಾಂತ್ಯ|ಮಾಸಿಕ|ವಾರ್ಷಿಕ)\s+)?(?:ಗುರಿ|goal)\s+(\d+(?:\.\d+)?)\s*(?:ಡಾಲರ್)?\s*(?:ಹೊಂದಿಸಿ|set)?\s*(?:ಗಾಗಿ|for)?\s*(.+)?/i,
    ml: /(?:(പ്രതിവാര|പ്രതിമാസ|വാർഷിക)\s+)?(?:ലക്ഷ്യം|goal)\s+(\d+(?:\.\d+)?)\s*(?:ഡോളർ)?\s*(?:സജ്ജമാക്കുക|set)?\s*(?:ആയി|for)?\s*(.+)?/i,
    ta: /(?:(வாராந்திர|மாதாந்திர|ஆண்டு)\s+)?(?:இலக்கு|goal)\s+(\d+(?:\.\d+)?)\s*(?:டாலர்)?\s*(?:அமை|set)?\s*(?:க்கு|for)?\s*(.+)?/i
  },
  
  // Summary patterns
  summary: {
    en: /summary|report|this month/i,
    hi: /सारांश|रिपोर्ट|इस महीने/i,
    te: /సారాంశం|నివేదిక|ఈ నెల/i,
    kn: /ಸಾರಾಂಶ|ವರದಿ|ಈ ತಿಂಗಳು/i,
    ml: /സംഗ്രഹം|റിപ്പോർട്ട്|ഈ മാസം/i,
    ta: /சுருக்கம்|அறிக்கை|இந்த மாதம்/i
  }
};

// Category translations
export const categoryTranslations: Record<string, Record<string, string>> = {
  en: {
    food: "Food",
    transit: "Transit",
    bills: "Bills",
    subscriptions: "Subscriptions",
    other: "Other"
  },
  hi: {
    "भोजन": "Food",
    "खाना": "Food",
    "यातायात": "Transit",
    "बिल": "Bills",
    "सदस्यता": "Subscriptions",
    "अन्य": "Other"
  },
  te: {
    "ఆహారం": "Food",
    "ఆహార": "Food",
    "రవాణా": "Transit",
    "బిల్లులు": "Bills",
    "సభ్యత్వాలు": "Subscriptions",
    "ఇతర": "Other"
  },
  kn: {
    "ಆಹಾರ": "Food",
    "ಸಾರಿಗೆ": "Transit",
    "ಬಿಲ್": "Bills",
    "ಚಂದಾದಾರಿಕೆ": "Subscriptions",
    "ಇತರೆ": "Other"
  },
  ml: {
    "ഭക്ഷണം": "Food",
    "യാത്ര": "Transit",
    "ബില്ല്": "Bills",
    "സബ്സ്ക്രിപ്ഷൻ": "Subscriptions",
    "മറ്റുള്ളവ": "Other"
  },
  ta: {
    "உணவு": "Food",
    "போக்குவரத்து": "Transit",
    "பில்": "Bills",
    "சந்தா": "Subscriptions",
    "மற்றவை": "Other"
  }
};

// Period translations
export const periodTranslations: Record<string, Record<string, string>> = {
  hi: {
    "साप्ताहिक": "weekly",
    "मासिक": "monthly",
    "वार्षिक": "yearly"
  },
  te: {
    "వారపు": "weekly",
    "నెలవారీ": "monthly",
    "వార్షిక": "yearly"
  },
  kn: {
    "ವಾರಾಂತ್ಯ": "weekly",
    "ಮಾಸಿಕ": "monthly",
    "ವಾರ್ಷಿಕ": "yearly"
  },
  ml: {
    "പ്രതിവാര": "weekly",
    "പ്രതിമാസ": "monthly",
    "വാർഷിക": "yearly"
  },
  ta: {
    "வாராந்திர": "weekly",
    "மாதாந்திர": "monthly",
    "ஆண்டு": "yearly"
  }
};

export function parseMultiLanguageCommand(text: string): {
  type: "add_expense" | "set_goal" | "summary" | null;
  amount?: number;
  description?: string;
  category?: string;
  period?: string;
  limit?: number;
} | null {
  const lowerText = text.toLowerCase();
  
  // Try add expense patterns
  for (const [lang, pattern] of Object.entries(commandPatterns.addExpense)) {
    const match = text.match(pattern);
    if (match) {
      let amount = parseFloat(match[1]);
      let description = match[2]?.trim() || "";
      
      // Translate category if in native language
      let category = description;
      if (lang !== "en" && categoryTranslations[lang]) {
        for (const [native, english] of Object.entries(categoryTranslations[lang])) {
          if (description.includes(native)) {
            category = english;
            description = description.replace(native, english);
            break;
          }
        }
      }
      
      return {
        type: "add_expense",
        amount,
        description: description || category,
        category
      };
    }
  }
  
  // Try goal patterns
  for (const [lang, pattern] of Object.entries(commandPatterns.setGoal)) {
    const match = text.match(pattern);
    if (match) {
      let period = match[1]?.trim();
      let limit = parseFloat(match[2]);
      let category = match[3]?.trim();
      
      // Translate period if in native language
      if (period && lang !== "en" && periodTranslations[lang]) {
        period = periodTranslations[lang][period] || period;
      }
      
      // Translate category if in native language
      if (category && lang !== "en" && categoryTranslations[lang]) {
        for (const [native, english] of Object.entries(categoryTranslations[lang])) {
          if (category.includes(native)) {
            category = english;
            break;
          }
        }
      }
      
      return {
        type: "set_goal",
        period: period || "monthly",
        limit,
        category
      };
    }
  }
  
  // Try summary patterns
  for (const pattern of Object.values(commandPatterns.summary)) {
    if (pattern.test(text)) {
      return { type: "summary" };
    }
  }
  
  return null;
}
