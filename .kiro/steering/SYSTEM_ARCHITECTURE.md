# Financial Advisor System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                     (Dashboard - Browser)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SPENDING TRACKER COMPONENT                   │
│                  (SpendingTracker.tsx - React)                  │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ Profile Setup    │  │ Financial        │  │ Purchase     │ │
│  │ Form             │  │ Overview Cards   │  │ Advisor Form │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ Savings Progress │  │ Recommendations  │  │ Financial    │ │
│  │ Tracker          │  │ Display          │  │ Health       │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
│                    (Next.js API Routes)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GET /api/financial-profile                              │  │
│  │  - Fetch user's financial metrics                        │  │
│  │  - Calculate current month spending                      │  │
│  │  - Calculate average monthly spending                    │  │
│  │  - Project year-end savings                              │  │
│  │  - Calculate savings rate                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/financial-profile                             │  │
│  │  - Create/update financial profile                       │  │
│  │  - Validate income and savings goal                      │  │
│  │  - Store in database                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/purchase-advisor                              │  │
│  │  - Analyze purchase decision                             │  │
│  │  - Calculate budget impact                               │  │
│  │  - Generate recommendation (Buy/Wait/Reconsider)         │  │
│  │  - Find cheaper alternatives                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Financial Metrics Calculator                            │  │
│  │  - Current month spending                                │  │
│  │  - 3-month rolling average                               │  │
│  │  - Projected yearly savings                              │  │
│  │  - Savings rate percentage                               │  │
│  │  - Disposable income                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Purchase Decision Engine                                │  │
│  │  - Calculate remaining budget                            │  │
│  │  - Calculate after-purchase balance                      │  │
│  │  - Determine recommendation level                        │  │
│  │  - Generate detailed reasoning                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Alternative Suggestions Generator                       │  │
│  │  - Categorize item by name                               │  │
│  │  - Find 3 cheaper alternatives                           │  │
│  │  - Generate Amazon search links                          │  │
│  │  - Estimate alternative prices (30-60% of original)      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│                     (data/db.json)                              │
│                                                                 │
│  {                                                              │
│    "users": [...],                                              │
│    "expenses": [                                                │
│      {                                                          │
│        "id": "...",                                             │
│        "userId": "...",                                         │
│        "date": "2024-11-09",                                    │
│        "amount": 50.00,                                         │
│        "category": "Food",                                      │
│        ...                                                      │
│      }                                                          │
│    ],                                                           │
│    "goals": [...],                                              │
│    "financialProfiles": [                                       │
│      {                                                          │
│        "userId": "...",                                         │
│        "monthlyIncome": 5000,                                   │
│        "yearlySavingsGoal": 12000,                              │
│        "updatedAt": "2024-11-09T..."                            │
│      }                                                          │
│    ]                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Profile Setup Flow

```
User                Component              API                  Database
 │                      │                   │                      │
 │  Enter Income &      │                   │                      │
 │  Savings Goal        │                   │                      │
 ├─────────────────────>│                   │                      │
 │                      │                   │                      │
 │                      │  POST /api/       │                      │
 │                      │  financial-       │                      │
 │                      │  profile          │                      │
 │                      ├──────────────────>│                      │
 │                      │                   │                      │
 │                      │                   │  Validate Data       │
 │                      │                   │  Create/Update       │
 │                      │                   │  Profile             │
 │                      │                   ├─────────────────────>│
 │                      │                   │                      │
 │                      │                   │  Profile Saved       │
 │                      │                   │<─────────────────────┤
 │                      │                   │                      │
 │                      │  Profile Data     │                      │
 │                      │<──────────────────┤                      │
 │                      │                   │                      │
 │  Profile Saved       │                   │                      │
 │  Success Message     │                   │                      │
 │<─────────────────────┤                   │                      │
```

### 2. Purchase Decision Flow

```
User                Component              API                  Database
 │                      │                   │                      │
 │  Enter Item Name     │                   │                      │
 │  & Price             │                   │                      │
 ├─────────────────────>│                   │                      │
 │                      │                   │                      │
 │                      │  POST /api/       │                      │
 │                      │  purchase-        │                      │
 │                      │  advisor          │                      │
 │                      ├──────────────────>│                      │
 │                      │                   │                      │
 │                      │                   │  Fetch Profile       │
 │                      │                   │  & Expenses          │
 │                      │                   ├─────────────────────>│
 │                      │                   │                      │
 │                      │                   │  Data Retrieved      │
 │                      │                   │<─────────────────────┤
 │                      │                   │                      │
 │                      │                   │  Calculate:          │
 │                      │                   │  - Current spending  │
 │                      │                   │  - Remaining budget  │
 │                      │                   │  - After-purchase    │
 │                      │                   │  - Recommendation    │
 │                      │                   │  - Alternatives      │
 │                      │                   │                      │
 │                      │  Recommendation   │                      │
 │                      │  + Alternatives   │                      │
 │                      │<──────────────────┤                      │
 │                      │                   │                      │
 │  Display Result      │                   │                      │
 │  with Color Coding   │                   │                      │
 │  & Alternatives      │                   │                      │
 │<─────────────────────┤                   │                      │
```

### 3. Financial Metrics Calculation Flow

```
Component              API                  Database              Calculator
 │                      │                      │                      │
 │  Load Dashboard      │                      │                      │
 ├─────────────────────>│                      │                      │
 │                      │                      │                      │
 │                      │  Fetch Profile       │                      │
 │                      ├─────────────────────>│                      │
 │                      │                      │                      │
 │                      │  Profile Data        │                      │
 │                      │<─────────────────────┤                      │
 │                      │                      │                      │
 │                      │  Fetch Expenses      │                      │
 │                      ├─────────────────────>│                      │
 │                      │                      │                      │
 │                      │  Expense Data        │                      │
 │                      │<─────────────────────┤                      │
 │                      │                      │                      │
 │                      │  Calculate Metrics   │                      │
 │                      ├─────────────────────────────────────────────>│
 │                      │                      │                      │
 │                      │                      │  - Current month     │
 │                      │                      │    spending          │
 │                      │                      │  - 3-month average   │
 │                      │                      │  - Projected savings │
 │                      │                      │  - Savings rate      │
 │                      │                      │  - Disposable income │
 │                      │                      │                      │
 │                      │  Calculated Metrics  │                      │
 │                      │<─────────────────────────────────────────────┤
 │                      │                      │                      │
 │  Display Metrics     │                      │                      │
 │<─────────────────────┤                      │                      │
```

## Component Hierarchy

```
DashboardHero
│
├── KeyStats
│   └── (Total spending, monthly stats)
│
├── QuickActions
│   └── (Add expense, Talk to assistant buttons)
│
├── SpendingTracker ⭐ NEW
│   │
│   ├── Profile Setup Form
│   │   ├── Monthly Income Input
│   │   ├── Yearly Savings Goal Input
│   │   └── Save Button
│   │
│   ├── Financial Overview
│   │   ├── Income Card
│   │   ├── Savings Goal Card
│   │   └── Monthly Spending Card
│   │
│   ├── Savings Progress
│   │   ├── Income Display
│   │   ├── Spending Display
│   │   ├── Current Savings Display
│   │   ├── Progress Bar
│   │   └── Projected Year-End Savings
│   │
│   ├── Purchase Advisor
│   │   ├── Item Name Input
│   │   ├── Price Input
│   │   ├── Submit Button
│   │   └── Recommendation Display
│   │       ├── Decision (Buy/Wait/Reconsider)
│   │       ├── Reasoning
│   │       ├── Impact Analysis
│   │       └── Cheaper Alternatives
│   │           ├── Alternative 1 (with link)
│   │           ├── Alternative 2 (with link)
│   │           └── Alternative 3 (with link)
│   │
│   └── Financial Health
│       ├── Savings Rate
│       ├── Disposable Income
│       └── Smart Recommendations
│
├── GoalsWidget
│   └── (Spending goals display)
│
└── Charts
    ├── CategoryPie
    └── SpendingTrendLine
```

## Decision Logic Flowchart

```
                    ┌─────────────────────┐
                    │  User Wants to Buy  │
                    │  Item ($X)          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Fetch Financial    │
                    │  Profile & Expenses │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Calculate:         │
                    │  - Disposable Income│
                    │  - Current Spending │
                    │  - Remaining Budget │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  After Purchase =   │
                    │  Remaining - Price  │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
    ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
    │ After Purchase   │  │ After        │  │ After        │
    │ > 20% of         │  │ Purchase     │  │ Purchase     │
    │ Disposable?      │  │ 5-20%?       │  │ < 5%?        │
    └────────┬─────────┘  └──────┬───────┘  └──────┬───────┘
             │                   │                  │
             ▼                   ▼                  ▼
    ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
    │ ✅ BUY           │  │ ⏳ WAIT      │  │ ❌ RECONSIDER│
    │                  │  │              │  │              │
    │ "You can afford  │  │ "Tight but   │  │ "Would exceed│
    │ this!"           │  │ possible"    │  │ budget"      │
    │                  │  │              │  │              │
    │ No alternatives  │  │ Show 3       │  │ Show 3       │
    │                  │  │ alternatives │  │ alternatives │
    └──────────────────┘  └──────────────┘  └──────────────┘
```

## Alternative Suggestions Logic

```
                    ┌─────────────────────┐
                    │  Item Name Input    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Categorize Item    │
                    │  (by keywords)      │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Electronics  │      │ Clothing     │      │ Home/Gaming  │
│ - Phone      │      │ - Shoes      │      │ - Coffee     │
│ - Laptop     │      │ - Jacket     │      │ - Vacuum     │
│ - Tablet     │      │              │      │ - Console    │
│ - Watch      │      │              │      │              │
│ - Headphones │      │              │      │              │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Generate 3         │
                  │  Alternatives:      │
                  │  - Name             │
                  │  - Price (30-60%)   │
                  │  - Amazon Link      │
                  └─────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│  - React 18                                                 │
│  - TypeScript                                               │
│  - Next.js 14 (App Router)                                  │
│  - Tailwind CSS                                             │
│  - i18n (6 languages)                                       │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                              │
│  - Next.js API Routes                                       │
│  - TypeScript                                               │
│  - Cookie-based Authentication                              │
│  - JSON File Storage (dev)                                  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Storage                         │
│  - data/db.json (development)                               │
│  - PostgreSQL/MongoDB (production ready)                    │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
│                                                             │
│  1. Authentication                                          │
│     - Cookie-based sessions                                 │
│     - User ID validation                                    │
│     - Protected API routes                                  │
│                                                             │
│  2. Authorization                                           │
│     - User-specific data filtering                          │
│     - userId-based queries                                  │
│     - No cross-user data access                             │
│                                                             │
│  3. Input Validation                                        │
│     - Required field checks                                 │
│     - Type validation (numbers, strings)                    │
│     - Range validation (positive numbers)                   │
│                                                             │
│  4. Output Sanitization                                     │
│     - React auto-escaping                                   │
│     - No raw HTML rendering                                 │
│     - Safe URL generation                                   │
│                                                             │
│  5. Data Protection                                         │
│     - User data isolation                                   │
│     - No sensitive data in URLs                             │
│     - Secure cookie settings                                │
└─────────────────────────────────────────────────────────────┘
```

## Performance Considerations

```
┌─────────────────────────────────────────────────────────────┐
│                    Performance Optimizations                │
│                                                             │
│  1. Frontend                                                │
│     - React state management (minimal re-renders)           │
│     - Lazy loading of components                            │
│     - Memoization of calculations                           │
│     - Debounced form inputs                                 │
│                                                             │
│  2. Backend                                                 │
│     - Efficient database queries                            │
│     - Single-pass calculations                              │
│     - Minimal data transfer                                 │
│     - Cached computations                                   │
│                                                             │
│  3. Database                                                │
│     - Indexed userId fields                                 │
│     - Filtered queries (date ranges)                        │
│     - Aggregated calculations                               │
│                                                             │
│  4. Network                                                 │
│     - Minimal API calls                                     │
│     - Batch data fetching                                   │
│     - Compressed responses                                  │
└─────────────────────────────────────────────────────────────┘
```

This architecture provides a solid foundation for the Financial Advisor feature with clear separation of concerns, scalability, and maintainability.
