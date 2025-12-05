#!/bin/bash

# Add your $180 expenses and $1000 clothes goal to database

cat > data/db.json << 'EOF'
{
  "users": [],
  "expenses": [
    {
      "id": "exp1",
      "userId": "0b6c559f-bdda-4250-bc90-9941da7d8acc",
      "amount": 60,
      "description": "Groceries",
      "category": "Food",
      "date": "2024-11-10",
      "merchant": "",
      "notes": ""
    },
    {
      "id": "exp2",
      "userId": "0b6c559f-bdda-4250-bc90-9941da7d8acc",
      "amount": 70,
      "description": "Gas",
      "category": "Transit",
      "date": "2024-11-10",
      "merchant": "",
      "notes": ""
    },
    {
      "id": "exp3",
      "userId": "0b6c559f-bdda-4250-bc90-9941da7d8acc",
      "amount": 50,
      "description": "Restaurant",
      "category": "Food",
      "date": "2024-11-10",
      "merchant": "",
      "notes": ""
    }
  ],
  "goals": [
    {
      "id": "goal1",
      "userId": "0b6c559f-bdda-4250-bc90-9941da7d8acc",
      "description": "Clothes",
      "limit": 1000,
      "period": "monthly",
      "createdAt": "2024-11-10T00:00:00.000Z"
    }
  ],
  "financialProfiles": [
    {
      "userId": "0b6c559f-bdda-4250-bc90-9941da7d8acc",
      "monthlyIncome": 8000,
      "yearlySavingsGoal": 5000,
      "updatedAt": "2024-11-10T21:29:01.733Z"
    }
  ]
}
EOF

echo "✅ Added test data:"
echo "- Expenses: $60 + $70 + $50 = $180"
echo "- Goal: Clothes $1000/month"
echo ""
echo "Now:"
echo "1. Restart server: npm run dev"
echo "2. Go to Financial Advisor"
echo "3. Click '🔄 Refresh Data'"
echo "4. Should show $180 spent and factor in $1000 goal"
