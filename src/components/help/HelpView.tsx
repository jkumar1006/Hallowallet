"use client";

export default function HelpView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
          📖 HalloWallet User Guide
        </h1>
        <p className="text-gray-400">Learn how to use every feature</p>
      </div>

      {/* Quick Start */}
      <Section title="🚀 Quick Start">
        <div className="space-y-3">
          <Step number="1" title="Add Your First Expense">
            Use the AI Assistant: Click 🎙️ and say "add 50 for groceries" or type it in the chat
          </Step>
          <Step number="2" title="Set Up Your Profile">
            Go to Savings Tracker → Enter your monthly income and savings goal
          </Step>
          <Step number="3" title="Explore Features">
            Check Dashboard, Insights, Reports, and Smart Suggestions
          </Step>
        </div>
      </Section>

      {/* AI Assistant */}
      <Section title="💬 AI Assistant">
        <div className="space-y-4">
          <Feature icon="🎙️" title="Voice Input (Recommended)">
            <p>Click the microphone button and speak naturally:</p>
            <Examples>
              <Example>"Add 25 for coffee at Starbucks"</Example>
              <Example>"Spent 120 on electricity bill"</Example>
              <Example>"Add 50 dollars for pizza yesterday"</Example>
            </Examples>
          </Feature>

          <Feature icon="📎" title="Receipt Upload (OCR)">
            <Warning>
              ⚠️ <strong>Use High-Quality Images Only!</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>✅ Clear, well-lit photos</li>
                <li>✅ Straight-on angle (not tilted)</li>
                <li>✅ High resolution (1000px+ wide)</li>
                <li>✅ Clear "TOTAL" line visible</li>
                <li>❌ Poor quality = wrong extraction</li>
              </ul>
            </Warning>
            <p className="mt-3">Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click 📎 attachment icon</li>
              <li>Select receipt image</li>
              <li>Wait 1-2 seconds</li>
              <li>Review extracted details</li>
              <li>Confirm or correct</li>
            </ol>
            <p className="mt-2 text-sm text-yellow-400">
              💡 If wrong: Say "change amount to 277" or "delete transaction"
            </p>
          </Feature>

          <Feature icon="⌨️" title="Text Commands">
            <Examples>
              <Example>"add 30 for lunch"</Example>
              <Example>"set goal 500 for vacation"</Example>
              <Example>"show insights"</Example>
              <Example>"delete transaction"</Example>
            </Examples>
          </Feature>
        </div>
      </Section>

      {/* Features Overview */}
      <Section title="✨ Features">
        <div className="grid gap-4">
          <FeatureCard icon="🏠" title="Dashboard" description="Overview of spending, savings, and recent transactions" />
          <FeatureCard icon="💳" title="Transactions" description="View, edit, and manage all expenses by month" />
          <FeatureCard icon="📊" title="Reports" description="Export PDF/CSV reports for any time period" />
          <FeatureCard icon="💡" title="Insights" description="AI-powered charts and spending analysis" />
          <FeatureCard icon="🎯" title="Goals" description="Set and track financial goals by category" />
          <FeatureCard icon="👁️" title="Watches" description="Get alerts when you exceed spending limits" />
          <FeatureCard icon="💰" title="Savings Tracker" description="Track income, expenses, and savings goals" />
          <FeatureCard icon="📅" title="Subscriptions" description="Manage recurring payments with renewal reminders" />
          <FeatureCard icon="🛒" title="Purchase Advisor" description="AI recommendations before buying" />
          <FeatureCard icon="🤖" title="Smart Suggestions" description="Automatic financial insights and tips" />
        </div>
      </Section>

      {/* Common Commands */}
      <Section title="💬 Common Commands">
        <CommandGroup title="Adding Expenses">
          <Command>"add 50 for groceries"</Command>
          <Command>"spent 25 on coffee"</Command>
          <Command>"$30 for lunch yesterday"</Command>
        </CommandGroup>
        <CommandGroup title="Setting Goals">
          <Command>"set goal 1000 for vacation"</Command>
          <Command>"create yearly goal 5000"</Command>
        </CommandGroup>
        <CommandGroup title="Creating Watches">
          <Command>"watch food 500 monthly"</Command>
          <Command>"alert me if transit exceeds 200"</Command>
        </CommandGroup>
        <CommandGroup title="Viewing Data">
          <Command>"show insights"</Command>
          <Command>"monthly summary"</Command>
          <Command>"most spent on this month"</Command>
        </CommandGroup>
      </Section>

      {/* Tips */}
      <Section title="💡 Pro Tips">
        <div className="grid md:grid-cols-2 gap-3">
          <Tip>🎙️ Use voice for fastest expense entry</Tip>
          <Tip>📸 Only upload high-quality receipt images</Tip>
          <Tip>💰 Set up your financial profile first</Tip>
          <Tip>📊 Review insights weekly</Tip>
          <Tip>🎯 Set realistic, achievable goals</Tip>
          <Tip>🔔 Enable subscription reminders</Tip>
          <Tip>📈 Export reports monthly</Tip>
          <Tip>🤖 Check smart suggestions daily</Tip>
        </div>
      </Section>

      {/* Troubleshooting */}
      <Section title="❓ Troubleshooting">
        <div className="space-y-3">
          <QA 
            question="OCR extracted wrong amount?" 
            answer='Say "change amount to [correct amount]" or delete and re-add manually. Use higher quality images.'
          />
          <QA 
            question="Transaction in wrong month?" 
            answer='Specify date explicitly: "on August 24" or "yesterday". Check selected month in sidebar.'
          />
          <QA 
            question="Voice not working?" 
            answer="Check microphone permissions in browser. Try typing instead."
          />
          <QA 
            question="How to delete expense?" 
            answer='Say "delete transaction" to remove the last one, or go to Transactions page.'
          />
        </div>
      </Section>

      {/* Multi-Language */}
      <Section title="🌍 Multi-Language Support">
        <p className="text-gray-300 mb-3">HalloWallet supports 6 languages:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Lang>🇬🇧 English</Lang>
          <Lang>🇮🇳 Hindi (हिंदी)</Lang>
          <Lang>🇮🇳 Kannada (ಕನ್ನಡ)</Lang>
          <Lang>🇮🇳 Malayalam (മലയാളം)</Lang>
          <Lang>🇮🇳 Tamil (தமிழ்)</Lang>
          <Lang>🇮🇳 Telugu (తెలుగు)</Lang>
        </div>
        <p className="text-sm text-gray-400 mt-3">
          Click language selector (top right) to switch. Voice input works in selected language!
        </p>
      </Section>
    </div>
  );
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-semibold text-orange-400">{title}</h2>
      {children}
    </div>
  );
}

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 font-bold">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-gray-200">{title}</h3>
        <p className="text-sm text-gray-400">{children}</p>
      </div>
    </div>
  );
}

function Feature({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4">
      <h3 className="font-semibold text-gray-200 mb-2">{icon} {title}</h3>
      <div className="text-sm text-gray-300 space-y-2">{children}</div>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-200">
      {children}
    </div>
  );
}

function Examples({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1 mt-2">{children}</div>;
}

function Example({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm bg-gray-900/50 border border-gray-700/30 rounded px-3 py-1.5 text-gray-300 font-mono">
      {children}
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4 hover:border-orange-500/30 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-200">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function CommandGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold text-gray-300 mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Command({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm bg-gray-900/50 border border-gray-700/30 rounded px-3 py-1.5 text-green-400 font-mono">
      {children}
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-200">
      {children}
    </div>
  );
}

function QA({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-3">
      <h4 className="font-semibold text-gray-200 text-sm mb-1">Q: {question}</h4>
      <p className="text-sm text-gray-400">A: {answer}</p>
    </div>
  );
}

function Lang({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm bg-gray-800/30 border border-gray-700/30 rounded px-3 py-2 text-center text-gray-300">
      {children}
    </div>
  );
}
