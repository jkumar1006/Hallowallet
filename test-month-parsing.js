// Quick test for month parsing logic
const MONTHS = [
  "january","february","march","april","may","june",
  "july","august","september","october","november","december",
];

const MONTH_ABBREV = {
  "jan": 0, "feb": 1, "mar": 2, "apr": 3, "may": 4, "jun": 5,
  "jul": 6, "aug": 7, "sep": 8, "oct": 9, "nov": 10, "dec": 11,
  "sept": 8,
};

const monthNameToIndex = (m) => {
  const lower = m.toLowerCase();
  if (MONTH_ABBREV[lower] !== undefined) return MONTH_ABBREV[lower];
  const i = MONTHS.indexOf(lower);
  return i === -1 ? null : i % 12;
};

function parseExplicitMonthRange(q) {
  // Try with year first
  let m = q.match(/\b(?:in\s+|en\s+|on\s+|for\s+)?([a-záéíóúüñ]+)\s+(\d{4})\b/i);
  if (m) {
    const mi = monthNameToIndex(m[1]);
    const y = parseInt(m[2], 10);
    if (mi != null && y) {
      console.log(`[Month Parse] Matched "${m[0]}" -> ${y}-${String(mi+1).padStart(2,'0')}`);
      return { month: mi, year: y };
    }
  }
  
  // Try month only
  const words = q.toLowerCase().split(/\s+/);
  for (const word of words) {
    const mi = monthNameToIndex(word);
    if (mi != null) {
      const wordIndex = q.toLowerCase().indexOf(word);
      const afterWord = q.slice(wordIndex + word.length).trim();
      if (!/^\d{1,2}\b/.test(afterWord)) {
        const y = new Date().getFullYear();
        console.log(`[Month Parse] Found month "${word}" -> ${y}-${String(mi+1).padStart(2,'0')}`);
        return { month: mi, year: y };
      }
    }
  }
  
  console.log(`[Month Parse] No month found in "${q}"`);
  return null;
}

// Test cases
console.log("\n=== Testing Month Parsing ===\n");

const testCases = [
  "insights november",
  "insights nov",
  "insights october",
  "insights oct",
  "november summary",
  "most spent on november",
  "insights november 2025",
  "insights in november",
  "top category november",
];

testCases.forEach(test => {
  console.log(`\nTest: "${test}"`);
  const result = parseExplicitMonthRange(test);
  if (result) {
    console.log(`✅ Result: ${result.year}-${String(result.month + 1).padStart(2, '0')}`);
  } else {
    console.log(`❌ No match`);
  }
});
