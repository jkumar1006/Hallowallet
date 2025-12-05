---
inclusion: always
---

# HalloWallet Project Standards

## Project Overview
HalloWallet is a Halloween-themed personal finance tracker with AI-powered features including voice expense parsing, smart purchase advisor, and multi-language support.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** JSON file-based (data/db.json)
- **Authentication:** JWT with HTTP-only cookies
- **Deployment:** Vercel-ready

## Code Standards

### TypeScript
- Use strict type checking
- Define interfaces for all data structures
- Avoid `any` type unless absolutely necessary
- Use proper error handling with try-catch

### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper prop typing

### API Routes
- Always validate authentication
- Sanitize and validate all inputs
- Return proper HTTP status codes
- Include error messages in responses
- Log errors for debugging

### File Structure
```
src/
├── app/
│   ├── api/          # API routes
│   ├── (auth)/       # Auth pages
│   └── (dashboard)/  # Protected pages
├── components/       # React components
├── contexts/         # React contexts
├── i18n/            # Translations
└── lib/             # Utilities
```

## Naming Conventions
- **Files:** kebab-case (e.g., `expense-tracker.tsx`)
- **Components:** PascalCase (e.g., `ExpenseTracker`)
- **Functions:** camelCase (e.g., `parseExpense`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `JWT_SECRET`)

## Database Schema

### Users
```typescript
{
  id: string;
  email: string;
  password: string; // bcrypt hashed
  name: string;
  createdAt: string;
}
```

### Expenses
```typescript
{
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO 8601
  createdAt: string;
}
```

### Financial Profiles
```typescript
{
  userId: string;
  monthlyIncome: number;
  yearlySavingsGoal: number;
  expectedMonthlyExpenses: number;
  updatedAt: string;
}
```

## Security Guidelines
- Never expose JWT_SECRET
- Always validate user authentication
- Sanitize user inputs
- Use HTTP-only cookies for tokens
- Implement rate limiting for APIs
- Validate file uploads

## Testing Approach
- Test API endpoints with various inputs
- Validate error handling
- Check authentication flows
- Test edge cases
- Verify multi-language support

## Performance
- Minimize API calls with caching
- Use React.memo for expensive components
- Implement pagination for large lists
- Optimize images and assets
- Use proper loading states

## Accessibility
- Use semantic HTML
- Include ARIA labels
- Ensure keyboard navigation
- Maintain color contrast
- Support screen readers

## Git Workflow
- Feature branches from main
- Descriptive commit messages
- PR reviews before merge
- Keep commits atomic
- Tag releases properly
