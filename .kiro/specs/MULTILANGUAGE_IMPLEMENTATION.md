# 🌍 Multi-Language Implementation Guide for Hallowallet

## Current Status
✅ Installed: `next-intl` package
✅ Created: Translation files for English, Hindi, Telugu
✅ Created: Language Context and Selector components

## What's Been Set Up

### 1. Translation Files
- `src/i18n/locales/en.json` - English (Complete)
- `src/i18n/locales/hi.json` - Hindi (Complete)
- `src/i18n/locales/te.json` - Telugu (Complete)

### 2. Language Context
- `src/contexts/LanguageContext.tsx` - Manages language state
- Auto-detects browser language
- Saves preference to localStorage
- Provides `t()` function for translations

### 3. Language Selector
- `src/components/ui/LanguageSelector.tsx` - Dropdown to switch languages
- Supports: English, Hindi, Telugu, Spanish, French, German, Chinese, Japanese

## To Complete Implementation

### Step 1: Add LanguageProvider to Root Layout

```typescript
// src/app/layout.tsx
import { LanguageProvider } from "../contexts/LanguageContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <SpookyProvider>{children}</SpookyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
```

### Step 2: Add Language Selector to TopBar

```typescript
// src/components/layout/TopBar.tsx
import LanguageSelector from "../ui/LanguageSelector";

// Add to the header:
<div className="flex items-center gap-3">
  <LanguageSelector />
  <ThemeToggle />
  {/* ... rest of components */}
</div>
```

### Step 3: Update Components to Use Translations

Example for Dashboard:
```typescript
import { useLanguage } from "../../contexts/LanguageContext";

export default function DashboardHero() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t("dashboard.welcomeBack")}</h1>
      <button>{t("dashboard.addExpense")}</button>
    </div>
  );
}
```

### Step 4: Multi-Language Voice Assistant

Update `src/components/layout/AssistantPanel.tsx`:

```typescript
function startListening() {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) {
    addMessage({
      id: `sys-${Date.now()}`,
      from: "system",
      text: t("assistant.voiceNotSupported")
    });
    return;
  }
  const rec = new SR();
  
  // Set language based on user preference
  const langMap: Record<string, string> = {
    en: "en-US",
    hi: "hi-IN",
    te: "te-IN",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    zh: "zh-CN",
    ja: "ja-JP"
  };
  
  rec.lang = langMap[language] || "en-US";
  // ... rest of code
}
```

### Step 5: Multi-Language API Processing

Update `src/app/api/suggestions/route.ts` to handle multiple languages:

```typescript
// Add translation service (Google Translate API or similar)
async function translateToEnglish(text: string, sourceLang: string): Promise<string> {
  if (sourceLang === "en") return text;
  
  // Use translation API
  // For now, detect common patterns in multiple languages
  
  // Hindi patterns
  if (text.includes("जोड़") || text.includes("खर्च")) {
    // Parse Hindi command
  }
  
  // Telugu patterns
  if (text.includes("జోడించ") || text.includes("ఖర్చు")) {
    // Parse Telugu command
  }
  
  return text;
}

export async function POST(req: NextRequest) {
  const { query, language = "en" } = await req.json();
  
  // Translate to English for processing
  const englishQuery = await translateToEnglish(query, language);
  
  // Process command
  // ...
  
  // Translate response back to user's language
  const translatedMessages = await translateMessages(messages, language);
  
  return NextResponse.json({ messages: translatedMessages, effects });
}
```

### Step 6: Add More Translation Files

Create files for remaining languages:
- `src/i18n/locales/es.json` - Spanish
- `src/i18n/locales/fr.json` - French
- `src/i18n/locales/de.json` - German
- `src/i18n/locales/zh.json` - Chinese
- `src/i18n/locales/ja.json` - Japanese

## Voice Command Examples by Language

### English
- "Add 20 dollars for path"
- "Set yearly goal 1000 for clothes"
- "Monthly summary"

### Hindi (हिंदी)
- "पथ के लिए 20 डॉलर जोड़ें"
- "कपड़ों के लिए वार्षिक लक्ष्य 1000 सेट करें"
- "मासिक सारांश"

### Telugu (తెలుగు)
- "పాత్ కోసం 20 డాలర్లు జోడించండి"
- "బట్టల కోసం వార్షిక లక్ష్యం 1000 సెట్ చేయండి"
- "నెలవారీ సారాంశం"

## Translation Service Options

1. **Google Cloud Translation API** (Recommended)
   - Supports 100+ languages
   - High accuracy
   - Cost: $20 per million characters

2. **Microsoft Translator**
   - Good for voice + text
   - Integrated with Azure

3. **LibreTranslate** (Free, Open Source)
   - Self-hosted option
   - Good for privacy

## Implementation Priority

1. ✅ Basic infrastructure (Done)
2. 🔄 Add LanguageProvider to app
3. 🔄 Update all UI components with t() function
4. 🔄 Implement translation API for voice commands
5. 🔄 Add remaining language files
6. 🔄 Test voice recognition in each language

## Testing Multi-Language Voice

1. Select language from dropdown
2. Click microphone button
3. Speak command in selected language
4. System translates to English for processing
5. Response translated back to user's language
6. UI displays in selected language

## Notes

- Voice recognition quality varies by language and browser
- Chrome has best multi-language support
- Consider adding language-specific number parsing
- Currency formatting should adapt to language/region

## Next Steps

To fully implement, you need to:
1. Add LanguageProvider to root layout
2. Update all components to use `t()` function
3. Integrate translation API for voice commands
4. Complete remaining translation files
5. Test thoroughly in each language

This will make Hallowallet truly global! 🌍🎃
