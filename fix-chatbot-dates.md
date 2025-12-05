# Chatbot Date Parsing Fixes

## Issues Found

1. **Add Expense**: "Add $30 for path on December 3rd" creates expense on Dec 4 instead of Dec 3
2. **Delete Expense**: "Delete $30 for path on Dec 3" deletes wrong transaction

## Root Causes

### Issue 1: Add Expense Date Parsing
The regex pattern doesn't handle "December 3rd" (with ordinal suffix) correctly.

**Location**: Line ~450 in `src/app/api/suggestions/route.ts`

**Current Code**:
```typescript
const monthDayYearMatch = query.match(/\b(?:on\s+)?([a-záéíóúüñ]+)\s+(\d{1,2}),?\s*(\d{4})\b/i);
```

**Fixed Code**:
```typescript
const monthDayYearMatch = query.match(/\b(?:on\s+)?([a-záéíóúüñ]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?\b/i);
```

**Changes**:
- Added `(?:st|nd|rd|th)?` to handle ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
- Made year optional with `(\d{4})?` so "December 3" works without year
- If no year provided, use selectedMonth year or current year

### Issue 2: Delete Expense Date Parsing
The delete logic doesn't parse specific dates, only months. It needs to:
1. Parse the exact date from "on December 3"
2. Filter candidates by that specific date
3. Match description keywords

**Location**: Line ~567 in `src/app/api/suggestions/route.ts`

**Changes Needed**:
1. Add `targetDate` variable to store exact date
2. Update regex to handle ordinal suffixes
3. Filter candidates by exact date if provided
4. Add console logging for debugging

## Manual Fix Instructions

Since auto-formatting is interfering, here's how to fix manually:

### Fix 1: Add Expense Date Parsing (Line ~450)

Find this line:
```typescript
const monthDayYearMatch = query.match(/\b(?:on\s+)?([a-záéíóúüñ]+)\s+(\d{1,2}),?\s*(\d{4})\b/i);
```

Replace with:
```typescript
const monthDayYearMatch = query.match(/\b(?:on\s+)?([a-záéíóúüñ]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?\b/i);
```

Then update the year extraction (a few lines below):
```typescript
const year = monthDayYearMatch[3] ? parseInt(monthDayYearMatch[3], 10) : (selectedMonth ? parseInt(selectedMonth.slice(0,4), 10) : new Date().getFullYear());
```

### Fix 2: Delete Expense Date Parsing (Line ~567)

Find the delete section starting with:
```typescript
if (isDeleteIntent(query)) {
  const amount = extractAmount(query);
  // Parse month from query
  let targetMonth: string | undefined;
```

Add after `let targetMonth`:
```typescript
let targetDate: string | undefined;
```

Then update the fullDateMatch regex:
```typescript
const fullDateMatch = query.match(/\b(?:on|in)\s+([a-záéíóúüñ]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?\b/i);
```

Add date parsing logic after the regex:
```typescript
if (fullDateMatch) {
  const monthName = fullDateMatch[1];
  const day = parseInt(fullDateMatch[2], 10);
  const year = fullDateMatch[3] ? parseInt(fullDateMatch[3], 10) : (selectedMonth ? parseInt(selectedMonth.slice(0,4), 10) : new Date().getFullYear());
  const mi = monthNameToIndex(monthName);
  if (mi !== null) {
    const clampedDay = clampDay(year, mi, day);
    targetDate = toISO(new Date(Date.UTC(year, mi, clampedDay)));
    targetMonth = `${year}-${String(mi + 1).padStart(2, '0')}`;
    console.log(`[Delete] Parsed as targetDate=${targetDate}, targetMonth=${targetMonth}`);
  }
}
```

Then after filtering by amount, add date filtering:
```typescript
// Filter by amount first
let candidates = monthExpenses.filter((e: any) => e.amount === amount);

// If we have a specific date, filter by that date
if (targetDate && candidates.length > 0) {
  const dateFiltered = candidates.filter((e: any) => String(e.date).slice(0,10) === targetDate);
  if (dateFiltered.length > 0) {
    candidates = dateFiltered;
  }
}
```

## Testing

After fixes, test these commands:

1. **Add with ordinal**: `add $30 for coffee on December 3rd`
   - Should create expense on 2025-12-03

2. **Add without year**: `add $25 for lunch on December 5`
   - Should use current year

3. **Delete with date**: `delete $30 for coffee on December 3`
   - Should delete the expense on 2025-12-03, not any other date

4. **Delete with ordinal**: `delete $30 for coffee on December 3rd`
   - Should work the same as above
