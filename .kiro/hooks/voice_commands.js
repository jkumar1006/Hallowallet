/**
 * Kiro Agent Hook: Voice Command Parser Validator
 * 
 * Trigger: On file save in voice parsing files
 * Purpose: Test and validate voice parsing logic
 */

module.exports = {
  name: "Voice Command Parser Validator",
  description: "Tests voice parsing logic with sample inputs when parser files are modified",
  
  // Trigger configuration
  trigger: {
    type: "onSave",
    filePattern: "**/api/parse-expense/**/*.ts"
  },
  
  // Agent instructions
  instructions: `
When voice parsing files are saved:

1. Run test cases with sample inputs:
   - "Spent 50 on groceries"
   - "Paid 1200 for rent yesterday"
   - "Coffee 5 dollars"
   - "₹500 for utilities last week"
   - Multi-language examples

2. Validate parsing accuracy:
   - Amount extraction (numbers, words, currency)
   - Category detection (keywords mapping)
   - Date parsing (relative dates, specific dates)
   - Description extraction

3. Check edge cases:
   - Missing amount
   - Ambiguous category
   - Invalid date format
   - Special characters
   - Very long input

4. Report:
   - Parsing success rate
   - Failed test cases
   - Suggestions for improvement
   - New patterns to support

5. Update documentation if new patterns are added
`,
  
  // Auto-approve read operations
  autoApprove: ["readFile", "grepSearch", "getDiagnostics"],
  
  // Enabled by default
  enabled: true
};
