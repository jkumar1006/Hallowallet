---
title: Spending Watch Feature
status: implemented
priority: high
---

# Spending Watch Feature

## Overview
A dynamic alert system that lets users watch any spending category and get notified when they hit custom thresholds.

## User Flow

### 1. Add a Watch
1. Go to Insights page
2. Click "+ Add Watch" in Spending Watch section
3. Enter:
   - **Category**: Any text (coffee, clothes, groceries, slippers, etc.)
   - **Threshold**: Dollar amount to trigger alert
   - **Period**: Weekly, Monthly, or Yearly
4. Click "Add Watch"

### 2. Monitor Spending
- Watch cards show real-time spending progress
- Color-coded alerts:
  - 🟢 Green: Under 70% of threshold
  - 🟡 Yellow: 70-99% of threshold (warning)
  - 🔴 Red: Hit or exceeded threshold (alert!)

### 3. Get Alerts
When threshold is hit:
- Card turns red with pulsing "ALERT!" badge
- Shows message: "⚠️ You've hit $80! Time to chill on coffee spending."

## Examples

### Coffee Watch
```
Category: Coffee
Threshold: $80
Period: Monthly

Status: $65 / $80 (81% used)
Alert: ⚡ Getting close! $15 left before alert.
```

### Clothes Watch
```
Category: Clothes
Threshold: $200
Period: Monthly

Status: $215 / $200 (107% used)
Alert: ⚠️ You've hit $200! Time to chill on clothes spending.
```

### Groceries Watch
```
Category: Groceries
Threshold: $500
Period: Weekly

Status: $120 / $500 (24% used)
Status: 🟢 On track
```

## Technical Details

### Category Matching
Flexible matching algorithm:
```typescript
const searchTerm = watch.category.toLowerCase(); // "coffee"
const matches = expenses.filter(e => {
  const category = e.category.toLowerCase();
  const description = e.description.toLowerCase();
  
  // Matches if category OR description contains the term
  return category.includes(searchTerm) || 
         description.includes(searchTerm);
});
```

**Examples:**
- Watch "coffee" matches:
  - Category: "Food", Description: "Starbucks coffee"
  - Category: "Coffee", Description: "Morning brew"
  - Category: "Beverages", Description: "Coffee beans"

### Period Calculation & Month Filtering

**Monthly Watches:**
- Only appear in the month they were created
- Example: Watch created in June 2025 only shows in June 2025
- When you switch to December 2025, the June watch disappears
- Start: 1st of the watch's month
- End: Last day of the watch's month

**Yearly Watches:**
- Appear in all 12 months of the year they were created
- Example: Watch created in June 2025 shows in all months of 2025
- When you switch to January 2026, the 2025 watch disappears
- Start: January 1st of the watch's year
- End: December 31st of the watch's year

**Weekly Watches:**
- Only appear in the month they were created
- Track spending for the week within that month
- Start: Beginning of current week (Sunday)
- End: End of current week (Saturday)

### Alert Thresholds

```typescript
if (currentSpending >= threshold) {
  status = "ALERT"; // Red, pulsing badge
} else if (percentUsed > 70) {
  status = "WARNING"; // Yellow, close to limit
} else {
  status = "ON_TRACK"; // Green, safe
}
```

## API Endpoints

### GET /api/spending-watch
Returns all watches with current spending data
```json
[
  {
    "id": "uuid",
    "category": "Coffee",
    "threshold": 80,
    "period": "monthly",
    "currentSpending": 65.50,
    "percentUsed": 81.88,
    "shouldAlert": false
  }
]
```

### POST /api/spending-watch
Create a new watch
```json
{
  "category": "Coffee",
  "threshold": 80,
  "period": "monthly"
}
```

### DELETE /api/spending-watch/:id
Remove a watch

## Database Schema

```typescript
type SpendingWatch = {
  id: string;
  userId: string;
  category: string;        // User-defined, can be anything
  threshold: number;       // Dollar amount
  period: "weekly" | "monthly" | "yearly";
  createdAt: string;
};
```

## UI Components

### SpendingWatch.tsx
Main component with:
- List of active watches
- Add watch form
- Real-time spending updates
- Color-coded alerts
- Delete functionality

### Watch Card States

**Normal (Green):**
```
Coffee
This Month
$45.00 / $80.00
56% of threshold
```

**Warning (Yellow):**
```
Coffee
This Month
$65.00 / $80.00
81% of threshold
⚡ Getting close! $15 left before alert.
```

**Alert (Red):**
```
Coffee                    [ALERT!]
This Month
$85.00 / $80.00
106% of threshold
⚠️ You've hit $80! Time to chill on coffee spending.
```

## Use Cases

### Budget Conscious
- Watch "dining out" with $300 monthly threshold
- Get alerted before overspending on restaurants

### Impulse Control
- Watch "shopping" with $100 weekly threshold
- Prevent impulse purchases

### Category Tracking
- Watch "entertainment" with $150 monthly threshold
- Monitor streaming, movies, games spending

### Specific Items
- Watch "coffee" with $80 monthly threshold
- Track daily coffee habit

### Seasonal Spending
- Watch "gifts" with $500 yearly threshold
- Plan for holidays and birthdays

## Benefits

✅ **Flexible** - Watch any category you want
✅ **Proactive** - Get alerts before overspending
✅ **Visual** - Color-coded progress bars
✅ **Real-time** - Updates as you add expenses
✅ **Customizable** - Set your own thresholds
✅ **Multi-period** - Weekly, monthly, or yearly tracking

## Future Enhancements
- Push notifications when threshold hit
- Email alerts
- SMS notifications
- Recurring watch templates
- Smart threshold suggestions based on history
- Multiple thresholds per category (warning + critical)
- Watch groups (combine multiple categories)
