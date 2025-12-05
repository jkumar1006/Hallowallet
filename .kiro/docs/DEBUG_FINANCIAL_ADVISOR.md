# Debug Guide - Financial Advisor

## Issue: "Save Financial Profile" button not working

### Step 1: Open Browser Console

1. Press **F12** (or right-click → Inspect)
2. Click on **Console** tab
3. Keep it open while testing

### Step 2: Try to Save Profile

1. Go to Financial Advisor page
2. Enter income: **5000**
3. Enter savings goal: **12000**
4. Click **"Save Financial Profile"**
5. Watch the console for messages

### What to Look For:

#### ✅ Success Messages (Good):
```
Submitting profile: {income: "5000", savingsGoal: "12000"}
Response status: 200
Profile saved successfully: {monthlyIncome: 5000, ...}
```

#### ❌ Error Messages (Problems):

**Problem 1: Network Error**
```
Error saving profile: TypeError: Failed to fetch
```
**Solution**: Check if server is running (`npm run dev`)

**Problem 2: Unauthorized**
```
Response status: 401
Error response: {error: "Unauthorized"}
```
**Solution**: You're not logged in. Go to `/login` and login first.

**Problem 3: Missing Fields**
```
Response status: 400
Error response: {error: "Missing required fields"}
```
**Solution**: Make sure both fields have numbers

**Problem 4: Database Error**
```
Response status: 500
Error response: {error: "..."}
```
**Solution**: Check server console for errors

### Step 3: Check Network Tab

1. In browser DevTools, click **Network** tab
2. Click "Save Financial Profile"
3. Look for request to `/api/financial-profile`
4. Click on it to see details

**Check:**
- Status: Should be **200 OK**
- Request Payload: Should have `monthlyIncome` and `yearlySavingsGoal`
- Response: Should have financial metrics

### Step 4: Verify Server is Running

In your terminal, you should see:
```
▲ Next.js 14.2.4
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

If not, run:
```bash
npm run dev
```

### Step 5: Check if Logged In

1. Open browser console
2. Type: `document.cookie`
3. Press Enter
4. Should see: `session=...`

If no session cookie:
1. Go to `/login`
2. Login with your credentials
3. Try Financial Advisor again

### Step 6: Manual API Test

Open browser console and run:

```javascript
// Test if you're logged in
fetch('/api/financial-profile')
  .then(r => r.json())
  .then(d => console.log('GET result:', d))
  .catch(e => console.error('GET error:', e));

// Test saving profile
fetch('/api/financial-profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    monthlyIncome: 5000,
    yearlySavingsGoal: 12000
  })
})
  .then(r => r.json())
  .then(d => console.log('POST result:', d))
  .catch(e => console.error('POST error:', e));
```

### Expected Results:

**GET /api/financial-profile**
```json
{
  "monthlyIncome": 5000,
  "yearlySavingsGoal": 12000,
  "currentMonthSpending": 0,
  "averageMonthlySpending": 0,
  "projectedYearlySavings": 60000,
  "savingsRate": 100,
  "disposableIncome": 4000
}
```

**POST /api/financial-profile**
```json
{
  "monthlyIncome": 5000,
  "yearlySavingsGoal": 12000,
  "currentMonthSpending": 0,
  "averageMonthlySpending": 0,
  "projectedYearlySavings": 60000,
  "savingsRate": 100,
  "disposableIncome": 4000
}
```

### Step 7: Check Database File

Check if `data/db.json` exists:
```bash
ls -la data/db.json
```

If it doesn't exist, create it:
```bash
mkdir -p data
echo '{"users":[],"expenses":[],"goals":[],"financialProfiles":[]}' > data/db.json
```

### Step 8: Check File Permissions

```bash
ls -la data/
```

Make sure the file is writable:
```bash
chmod 644 data/db.json
```

### Common Solutions:

#### Solution 1: Not Logged In
```
1. Go to /login
2. Login with your account
3. Go back to /advisor
4. Try again
```

#### Solution 2: Server Not Running
```bash
# Stop any running servers
# Then start fresh
npm run dev
```

#### Solution 3: Clear Browser Cache
```
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Or clear all browser data
3. Login again
4. Try again
```

#### Solution 4: Database File Missing
```bash
mkdir -p data
echo '{"users":[],"expenses":[],"goals":[],"financialProfiles":[]}' > data/db.json
```

#### Solution 5: Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Start server again
npm run dev
```

### Quick Checklist:

- [ ] Server is running (`npm run dev`)
- [ ] You are logged in (check `/login`)
- [ ] Browser console is open (F12)
- [ ] No red errors in console
- [ ] `data/db.json` file exists
- [ ] File has write permissions
- [ ] Port 3000 is not blocked
- [ ] No browser extensions blocking requests
- [ ] Tried hard refresh (Ctrl+Shift+R)

### Still Not Working?

If you've tried everything:

1. **Copy console errors** - Take screenshot of any red errors
2. **Check server logs** - Look at terminal where `npm run dev` is running
3. **Try incognito mode** - Rules out browser extension issues
4. **Try different browser** - Chrome, Firefox, Safari
5. **Restart everything** - Stop server, close browser, start fresh

### Test Sequence:

```
1. npm run dev (start server)
   ↓
2. Go to http://localhost:3000/login
   ↓
3. Login with credentials
   ↓
4. Go to http://localhost:3000/advisor
   ↓
5. Open console (F12)
   ↓
6. Enter: Income = 5000, Savings = 12000
   ↓
7. Click "Save Financial Profile"
   ↓
8. Watch console for messages
   ↓
9. Should see success and page should update
```

If this doesn't work, there's a deeper issue. Check:
- Server console for errors
- Browser console for errors
- Network tab for failed requests
- Database file permissions
