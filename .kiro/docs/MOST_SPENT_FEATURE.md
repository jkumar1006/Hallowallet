# Most Spent On Feature - Time Period Clarification

## What Changed

The AI Assistant now asks users to specify a time period when they ask "most spent on" without specifying week/month/year.

## How It Works

### User Query Examples

**Without time period (asks for clarification):**
- "Most spent on?" → Assistant asks: "Please specify: this week, this month, or this year?"
- "What did I spend most on?" → Same clarification request

**With time period (provides answer):**
- "Most spent on this week" → Shows top spending for last 7 days
- "Most spent on this month" → Shows top spending for current month
- "Most spent on this year" → Shows top spending for current year

### Response Format

When time period is specified, the assistant shows:
1. Top category with amount and percentage
2. Top 3 categories breakdown
3. Period-specific label (e.g., "This week, you spent the most on...")

### Implementation Details

**File:** `src/app/api/suggestions/route.ts`

The logic:
1. Detects "most" + "spent"/"spending" keywords
2. Checks for time period keywords: "week", "month", "year"
3. If no period found → asks for clarification
4. If period found → calculates date range and filters expenses
5. Returns top spending categories with totals

**Date Ranges:**
- Week: Last 7 days from today
- Month: Current month (from URL parameter or current month)
- Year: January 1st to today of current year

### Quick Action Button

The "Top Spending" quick action button now defaults to "Most spent on this month" instead of just "Most spent on?" to provide a better user experience.

## Testing

Try these commands in the AI Assistant:
1. "Most spent on" → Should ask for clarification
2. "Most spent on this week" → Should show weekly breakdown
3. "Most spent on this month" → Should show monthly breakdown
4. "Most spent on this year" → Should show yearly breakdown
5. Click "Top Spending" button → Should show monthly breakdown

## Benefits

- **Better UX**: Users get clear guidance on what information they need to provide
- **Flexible**: Supports week, month, and year time periods
- **Accurate**: Filters expenses by actual date ranges
- **Informative**: Shows top 3 categories with percentages
