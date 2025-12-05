# Production Authentication System

## Overview
HalloWallet now has a complete production-ready authentication system with multi-user support.

## Features

### ✅ User Registration (Signup)
- Full name, email, and password required
- Email validation and uniqueness check
- Password minimum length (6 characters)
- Password confirmation matching
- Automatic login after signup
- Secure password hashing with bcrypt

### ✅ User Login
- Email and password authentication
- JWT token-based sessions
- HTTP-only cookies for security
- 7-day session expiration
- Error handling for invalid credentials

### ✅ User Logout
- Session termination
- Cookie clearing
- Redirect to home page

### ✅ Multi-User Support
- Each user has isolated data
- User-specific expenses, goals, and financial profiles
- Persistent storage in `.data/db.json`
- Automatic data saving on changes

## Routes

### Pages
- `/` - Home page with signup/login options
- `/signup` - User registration page
- `/login` - User login page
- `/dashboard` - Protected dashboard (requires authentication)

### API Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End user session

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Signed with secret key, 7-day expiration
3. **HTTP-Only Cookies**: Prevents XSS attacks
4. **Secure Cookies**: HTTPS-only in production
5. **Input Validation**: Email format, password length
6. **Error Messages**: Generic messages to prevent user enumeration

## Database Structure

### User Schema
```typescript
{
  id: string;              // UUID
  name: string;            // Full name
  email: string;           // Unique email (lowercase)
  passwordHash: string;    // bcrypt hash
  currency?: string;       // User's currency
  country?: string;        // User's country
  city?: string;          // User's city
  monthlyIncome?: number; // Monthly income
  yearlySavingsGoal?: number; // Savings goal
  createdAt: string;      // ISO timestamp
}
```

### Data Isolation
All expenses, goals, and financial data are filtered by `userId` to ensure complete data isolation between users.

## Environment Variables

Required in `.env`:
```
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

## Usage

### New User Flow
1. Visit `/signup`
2. Enter name, email, and password
3. Automatically logged in and redirected to `/dashboard`

### Returning User Flow
1. Visit `/login`
2. Enter email and password
3. Redirected to `/dashboard`

### Logout
1. Click logout button (implement in UI)
2. Call `POST /api/auth/logout`
3. Redirected to home page

## Testing

### Create Test User
```bash
# Visit http://localhost:3000/signup
# Fill in the form:
Name: Test User
Email: test@example.com
Password: test123
```

### Login
```bash
# Visit http://localhost:3000/login
# Use the credentials above
```

## Production Checklist

- [x] Secure password hashing
- [x] JWT token authentication
- [x] HTTP-only cookies
- [x] Input validation
- [x] Email uniqueness check
- [x] Multi-user data isolation
- [x] Persistent database storage
- [x] Error handling
- [x] Session expiration
- [ ] Password reset functionality (future)
- [ ] Email verification (future)
- [ ] Rate limiting (future)
- [ ] Account deletion (future)

## Notes

- The database is stored in `.data/db.json` (gitignored)
- All user data is automatically saved on changes
- Sessions last 7 days before requiring re-login
- Currency field defaults to optional for flexibility
