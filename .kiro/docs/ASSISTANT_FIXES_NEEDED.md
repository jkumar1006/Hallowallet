# Assistant Voice/Text Command Fixes Needed

## Issues
1. Goal creation not working - keeps asking for exact format
2. Watch creation not working - too strict on format
3. Need flexible natural language parsing

## Required Functionality

### Goals
**Should work with ANY of these:**
- "goal 1000 for clothes yearly"
- "set yearly goal 1000 for clothes"
- "add goal 100 food weekly"
- "create goal 500 monthly"
- If no period specified → default to MONTHLY (don't ask)

### Watches
**Should work with ANY of these:**
- "watch food 500 monthly"
- "create watch 1000 shopping yearly"
- "watch 500 for food"
- "add watch bills 300"
- If no period specified → default to MONTHLY (don't ask)

### Delete Goals
- "delete goal 1000 for clothes"
- "remove goal 500 monthly"

### Delete Watches
- "delete watch food 500"
- "remove watch shopping 1000 yearly"

## Solution Approach
Use simple regex to extract:
1. Amount (any number with optional $)
2. Category (word after "for" or next word after amount)
3. Period (weekly/monthly/yearly) - DEFAULT to monthly if not found
4. Don't ask for clarification - just use defaults

## Implementation
The logic should be in this order:
1. Check for "delete" + "goal" → delete goal
2. Check for "delete" + "watch" → delete watch
3. Check for "delete" → delete expense
4. Check for "goal" → create goal (flexible parsing)
5. Check for "watch" → create watch (flexible parsing)
6. Check for amount pattern → add expense
