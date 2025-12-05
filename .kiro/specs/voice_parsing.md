---
title: Voice-to-Expense Parsing
status: implemented
priority: high
---

# Voice-to-Expense Parsing

## Overview
Natural language processing system that converts voice/text input into structured expense entries.

## Supported Formats

### Basic Patterns
- "Spent 50 on groceries"
- "Paid 1200 for rent"
- "Coffee 5 dollars"
- "Bought shoes for 80"

### Date Patterns
- "Yesterday spent 30 on lunch"
- "Last week paid 500 for utilities"
- "On Monday bought 25 worth of snacks"

### Multi-language Support
- English, Hindi, Kannada, Malayalam, Tamil, Telugu
- Transliteration support for Indian languages
- Currency recognition (₹, $, Rs)

## Parsing Logic

### Amount Extraction
```javascript
// Patterns matched:
- "50", "50.99", "$50", "₹50", "Rs 50"
- "fifty", "hundred", "thousand"
```

### Category Detection
```javascript
// Keywords mapped to categories:
- food, lunch, dinner, breakfast → Food
- rent, utilities, bills → Housing
- uber, taxi, petrol → Transportation
- movie, netflix, game → Entertainment
```

### Date Parsing
```javascript
// Relative dates:
- "today" → current date
- "yesterday" → -1 day
- "last week" → -7 days
- "monday", "tuesday" → last occurrence
```

## API Endpoint

### POST /api/parse-expense
```json
{
  "text": "Spent 50 on groceries yesterday"
}
```

**Response:**
```json
{
  "amount": 50,
  "category": "Food",
  "description": "groceries",
  "date": "2025-11-09"
}
```

## Implementation
- `src/app/api/parse-expense/route.ts` - Parser logic
- `src/components/dashboard/VoiceExpenseInput.tsx` - Voice input UI

## Future Enhancements
- Receipt OCR scanning
- Bank SMS parsing
- Recurring expense detection
- Smart category learning
- Multi-currency support
