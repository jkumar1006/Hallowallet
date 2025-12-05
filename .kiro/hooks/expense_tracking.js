/**
 * Kiro Agent Hook: Expense Tracking Assistant
 * 
 * Trigger: On file save in expense-related files
 * Purpose: Automatically validate expense data and update tests
 */

module.exports = {
  name: "Expense Tracking Assistant",
  description: "Validates expense entries and updates related tests when expense files are modified",
  
  // Trigger configuration
  trigger: {
    type: "onSave",
    filePattern: "**/api/expenses/**/*.ts"
  },
  
  // Agent instructions
  instructions: `
When expense-related API files are saved:

1. Validate the expense data structure:
   - Check required fields: amount, category, description, date, userId
   - Ensure amount is a positive number
   - Verify category is from allowed list
   - Validate date format (ISO 8601)

2. Check for common issues:
   - Missing error handling
   - Improper authentication checks
   - Database query vulnerabilities
   - Missing input validation

3. Update related test files if needed:
   - Add test cases for new validation rules
   - Update mock data to match schema changes
   - Ensure edge cases are covered

4. Provide a summary of:
   - Any issues found
   - Suggestions for improvements
   - Test coverage status
`,
  
  // Auto-approve certain operations
  autoApprove: ["readFile", "getDiagnostics"],
  
  // Enabled by default
  enabled: true
};
