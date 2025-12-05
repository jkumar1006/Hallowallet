# 👻 HalloWallet

> Your smart, spooky money assistant. Track expenses with voice commands, get AI-powered financial advice, and reach your savings goals.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

### 🎤 Voice-Powered Expense Tracking
- Natural language processing for expense entry
- Just say "Add 50 dollars for groceries" and we'll handle the rest
- Multi-language support (English, Hindi, Kannada, Malayalam, Tamil, Telugu)
- Real-time voice recognition with smart silence detection

### 🤖 AI Financial Advisor
- Smart purchase recommendations based on your budget
- Budget impact analysis before you buy
- Alternative product suggestions
- Personalized financial insights

### 📊 Comprehensive Analytics
- Interactive charts and visualizations
- Category-wise spending breakdown
- Monthly and yearly summaries
- Spending trends and patterns

### 🎯 Goal Tracking
- Set weekly, monthly, or yearly spending goals
- Real-time progress tracking
- Budget alerts and notifications
- Savings goal projections

### 📸 Receipt Scanning
- Upload receipt images for instant expense tracking
- OCR-powered text extraction
- Automatic category detection
- Smart merchant recognition

### 🎃 Halloween Theme
- Unique spooky aesthetic with animations
- Dark theme with orange/purple accents
- Animated ghosts, bats, and pumpkins
- Toggle-able theme

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- Modern web browser (Chrome, Safari, or Edge recommended for voice features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hallowallet.git
cd hallowallet
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Database (optional - uses JSON file by default)
# DATABASE_URL=your-database-url

# Optional: Timezone
TZ=America/New_York
```

4. **Initialize the database**

The app uses a JSON file database by default (`data/db.json`). It will be created automatically on first run.

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Getting Started

1. **Sign Up** - Create your account
2. **Set Financial Profile** - Enter your monthly income and savings goals
3. **Start Tracking** - Add expenses via voice, text, or receipt upload

### Voice Commands

Click the 🎙️ microphone button and say:

- **Add Expense**: "Add 50 dollars for groceries"
- **Set Goal**: "Set monthly goal 1000 for food"
- **Get Summary**: "Monthly summary"
- **Get Insights**: "Insights for November"
- **Top Spending**: "Most spent on this month"

### Text Commands

Type in the AI Assistant:

```
add $50 for groceries on December 5th
delete $30 for coffee on December 3
set monthly goal 1000 for food
insights november
top spending october
monthly summary
```

### Receipt Upload

1. Click the 📸 camera button
2. Select a receipt image
3. AI extracts amount, merchant, and category
4. Confirm or edit details

## 🏗️ Project Structure

```
hallowallet/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── api/               # API routes
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── goals/             # Goal tracking components
│   │   ├── layout/            # Layout components
│   │   ├── transactions/      # Transaction components
│   │   └── ui/                # Reusable UI components
│   ├── contexts/              # React contexts
│   ├── i18n/                  # Internationalization
│   ├── lib/                   # Utilities and helpers
│   └── types/                 # TypeScript types
├── data/                      # JSON database
├── public/                    # Static assets
└── prisma/                    # Database schema (optional)
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Serverless functions
- **JWT** - Authentication
- **JSON File Storage** - Development database
- **Prisma** - Database ORM (optional)

### AI Features
- **Web Speech API** - Voice recognition
- **Tesseract.js** - OCR for receipt scanning
- **Custom NLP** - Natural language parsing

## 🔧 Configuration

### Voice Recognition

Voice features require:
- HTTPS or localhost
- Microphone permissions
- Internet connection (uses browser's speech API)

To enable microphone:
1. Click 🔒 in address bar
2. Allow microphone access
3. Refresh the page

### Language Settings

Change language in the top-right dropdown:
- English (en)
- Hindi (hi)
- Kannada (kn)
- Malayalam (ml)
- Tamil (ta)
- Telugu (te)

### Theme Toggle

Click the 🎃 button to toggle between:
- Normal mode (professional)
- Halloween mode (spooky)

## 📊 Database

### JSON File (Default)

Data is stored in `data/db.json`:

```json
{
  "users": [...],
  "expenses": [...],
  "goals": [...],
  "financialProfiles": [...],
  "spendingWatches": [...]
}
```

### PostgreSQL/MongoDB (Production)

For production, configure Prisma:

1. Update `prisma/schema.prisma`
2. Set `DATABASE_URL` in `.env`
3. Run migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

## 🐛 Troubleshooting

### Voice Not Working

**Issue**: "Network error" or "No speech detected"

**Solutions**:
1. Check microphone permissions
2. Use Chrome, Safari, or Edge (Firefox not supported)
3. Ensure internet connection
4. Try typing instead - works identically!

See [VOICE_TROUBLESHOOTING.md](VOICE_TROUBLESHOOTING.md) for details.

### Slow Performance

**Issue**: Pages load slowly or navigation is laggy

**Solutions**:
1. Clear `.next` cache: `rm -rf .next`
2. Restart dev server
3. Check browser console for errors

See [PERFORMANCE_FIXES.md](PERFORMANCE_FIXES.md) for details.

### Date Parsing Issues

**Issue**: Expenses created on wrong dates

**Solutions**:
- Use format: "December 3rd" or "Dec 3"
- Include year if not current: "December 3, 2025"

See [TEST_CHATBOT_FIXES.md](TEST_CHATBOT_FIXES.md) for details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting
- Tesseract.js for OCR capabilities
- All contributors and testers


## 🗺️ Roadmap

- [ ] Bank account integration
- [ ] Recurring expense automation
- [ ] Budget recommendations with ML
- [ ] Mobile app (React Native)
- [ ] Export to CSV/PDF
- [ ] Shared budgets for families
- [ ] Investment tracking
- [ ] Bill reminders


Made with 👻 and ❤️ by the HalloWallet team

**Star ⭐ this repo if you find it helpful!**
