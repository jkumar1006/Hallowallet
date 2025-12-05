# Debug Month Parsing

## Added Console Logging

I've added console.log statements to debug why month parsing isn't working:

### Logs to watch for:

1. **`[resolveRange]`** - Shows the query and selectedMonth
2. **`[Month Parse]`** - Shows if a month was found and what it parsed to
3. **`[resolveRange] Using explicit month`** - Confirms it's using the parsed month

## How to Test

1. **Open browser console** (F12 or Cmd+Option+I)
2. **Go to Console tab**
3. **Type in AI Assistant**: `insights november`
4. **Check the console** for logs

### Expected Logs:
```
[resolveRange] query="insights november", selectedMonth="2025-12"
[Month Parse] Found month "november" -> 2025-11
[resolveRange] Using explicit month: 2025-11-01 to 2025-11-30
```

### If you see:
```
[Month Parse] No month found in "insights november"
```
Then the parsing logic has a bug.

## Test Commands

Try these and watch the console:

1. `insights november`
2. `insights oct`
3. `insights october 2026`
4. `most spent november`
5. `november summary`

## What to Look For

- Does it find the month name?
- What month index does it return?
- Is it using the explicit month or falling back to selectedMonth?

## Current Issue

The query "insights november" is showing December data (2025-12-01 → 2025-12-31), which means:
- Either `parseExplicitMonthRange` is returning null
- Or the month index is wrong (but we tested that and it's correct)

The console logs will tell us exactly what's happening!
