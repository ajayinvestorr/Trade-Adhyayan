
import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, ShieldCheck, PieChart, ArrowRight, Activity, Zap, CheckCircle2, 
  Lock, BarChart3, ChevronUp, ChevronDown, Brain, Target, MousePointer2, 
  Quote, HelpCircle, Star, Globe, Smartphone, Shield, Sparkles, MoveRight, Play, Trophy, Github
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // EDIT THIS URL TO YOUR NEW REPOSITORY
  const REPO_URL = "https://github.com/trade-adhyayan/journal";

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] font-sans text-slate-300 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .glass-nav {
          background: rgba(2, 6, 23, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .text-gradient {
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .mesh-bg {
          background-image: 
            radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(192, 132, 252, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(147, 51, 234, 0.1) 0px, transparent 50%);
        }
        .grid-pattern {
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="mesh-bg absolute inset-0 opacity-40"></div>
        <div className="grid-pattern absolute inset-0 opacity-20"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 ${scrolled ? 'glass-nav border-b border-white/10 shadow-2xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2.5 rounded-2xl shadow-xl">
                <Zap className="h-6 w-6 fill-current" />
              </div>
            </div>
            <span className="font-black text-2xl tracking-tight text-white">Trade Adhyayan</span>
          </div>
          
          <div className="hidden lg:flex gap-10 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#features" className="hover:text-white transition-colors">Intelligence</a>
            <a href="#performance" className="hover:text-white transition-colors">Performance</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('/login')} className="hidden sm:block text-sm font-bold text-slate-400 hover:text-white transition-colors">Login</button>
            <button 
              onClick={() => onNavigate('/signup')} 
              className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-indigo-50 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              Start Journaling
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow">
        <section className="pt-32 pb-20 lg:pt-52 lg:pb-40 px-6">
          <div className="max-w-6xl mx-auto">
            <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex justify-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                  <Sparkles className="h-4 w-4 fill-current" />
                  Engineered for the elite 5%
                </div>
              </div>
              <h1 className="text-center text-6xl sm:text-8xl md:text-9xl font-[900] text-white tracking-tight leading-[0.9] mb-12">
                Stop Gambling. <br />
                <span className="text-gradient">Start Trading.</span>
              </h1>
              <p className="text-center text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed font-medium">
                Most traders fail because they don't know why they win. We provide the data, discipline, and AI-coaching needed to turn guessing into execution.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <button 
                  onClick={() => onNavigate('/signup')}
                  className="w-full sm:w-auto px-12 py-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[2rem] font-black text-xl hover:shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center group"
                >
                  Launch Your Journal
                  <MoveRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="py-32 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { icon: Brain, title: "Psychological Audit", desc: "Track moods and emotions to reveal hidden biases.", color: "from-indigo-500 to-blue-500" },
                    { icon: Target, title: "Strategy Analytics", desc: "Identify which setups are high-probability.", color: "from-purple-500 to-pink-500" },
                    { icon: Trophy, title: "Discipline Streaks", desc: "Gamify your consistency with Rule Streaks.", color: "from-amber-500 to-orange-500" },
                    { icon: Activity, title: "AI Performance Coach", desc: "Brutally honest pattern analysis.", color: "from-emerald-500 to-teal-500" }
                  ].map((feat, i) => (
                    <div key={i} className="group p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-2">
                      <div className={`w-14 h-14 bg-gradient-to-br ${feat.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/10`}>
                        <feat.icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-3 tracking-tight">{feat.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed font-medium">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-8">
                <h2 className="text-5xl sm:text-6xl font-black text-white leading-tight tracking-tighter">Your edge isn't a secret. <br /><span className="text-slate-500">It's in your data.</span></h2>
                <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                  Professional trading is a business of probabilities. Most retail traders operate without a ledger. Trade Adhyayan gives you the mirror you need to see the truth.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-transparent py-20 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:items-center mb-16">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 text-white p-2 rounded-xl">
                  <Zap className="h-5 w-5 fill-current" />
                </div>
                <span className="font-black text-2xl tracking-tight text-white">Trade Adhyayan</span>
              </div>
              <p className="text-slate-500 max-w-sm font-medium">Built for the next generation of traders. Precision journaling, emotional intelligence, data-driven edge.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
              <div className="flex flex-col gap-4">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Product</p>
                <a href="#features" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Intelligence</a>
                <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Pricing</a>
                <a 
                    href={REPO_URL} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
                >
                    <Github className="h-4 w-4" /> GitHub
                </a>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Resources</p>
                <a href="#" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Academy</a>
                <a href="#" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Support</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-slate-500">© 2024 Trade Adhyayan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
