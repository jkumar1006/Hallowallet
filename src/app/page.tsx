import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 scroll-smooth">
      {/* Hero Section - Fade in from top */}
      <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-5xl md:text-6xl font-bold flex items-center justify-center gap-3 bg-gradient-to-r from-orange-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
          HalloWallet <span className="text-5xl animate-bounce">👻</span>
        </h1>
        <p className="text-slate-300 max-w-2xl text-center text-lg">
          Your smart, spooky money assistant. Track expenses with voice commands, 
          get AI-powered financial advice, and reach your savings goals.
        </p>
      </div>
      
      {/* CTA Buttons - Fade in with delay */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <Link
          href="/signup"
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold hover:from-orange-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Get Started Free
        </Link>
        <Link
          href="/login"
          className="px-8 py-3 rounded-xl border-2 border-slate-500 text-slate-100 font-semibold hover:bg-slate-800 hover:border-slate-400 transition-all duration-300"
        >
          Login
        </Link>
      </div>
      
      {/* Feature Cards - Staggered fade in */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center hover:bg-slate-900/70 hover:border-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="text-3xl mb-3">🎤</div>
          <h3 className="font-semibold text-white mb-2">Voice Tracking</h3>
          <p className="text-sm text-slate-400">
            Just say "Add 50 dollars for path" and we'll handle the rest
          </p>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center hover:bg-slate-900/70 hover:border-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="font-semibold text-white mb-2">AI Advisor</h3>
          <p className="text-sm text-slate-400">
            Get smart purchase recommendations based on your budget
          </p>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center hover:bg-slate-900/70 hover:border-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-semibold text-white mb-2">Savings Goals</h3>
          <p className="text-sm text-slate-400">
            Track your progress and stay on target with yearly goals
          </p>
        </div>
      </div>
    </main>
  );
}
