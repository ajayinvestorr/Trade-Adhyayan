
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Ruler, Trophy, BookOpen, CheckCircle, Lock, Plus, Flame, Trash2, Shield, Brain, Target, Zap, 
  AlertTriangle, TrendingDown, Activity, HelpCircle, Clock, X, Map, Check, ChevronRight, 
  Medal, GraduationCap, Award, PlaySquare, FileText, Download, Presentation, List, TrendingUp, Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trade, TradeStatus } from '../types';
import { db } from '../services/db';

interface DisciplineViewProps {
  initialTab?: string;
  trades?: Trade[];
}

interface TradingRule {
  id: string;
  text: string;
  streak: number;
  committedToday: boolean;
  userId?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: number;
  current: number;
  unit: string;
  reward: string;
  isAccepted: boolean;
  isCompleted: boolean;
  userId?: string;
}

const ROADMAP_LEVELS = [
  { id: 1, name: 'The Observer', minTrades: 0, minWinRate: 0, desc: 'Your focus is purely on journaling and pattern recognition.' },
  { id: 2, name: 'The Apprentice', minTrades: 10, minWinRate: 35, desc: 'Execution over 10 trades with basic win-rate targets.' },
  { id: 3, name: 'The Specialist', minTrades: 50, minWinRate: 45, desc: 'Consistent process application over 50 data points.' },
  { id: 4, name: 'The Professional', minTrades: 100, minWinRate: 55, desc: 'Mastery. Psychology is decoupled from P/L.' },
];

const INITIAL_CHALLENGES: Challenge[] = [
  { id: 'ch-1', title: 'Consistency King', description: 'Log 15 trades with zero "Broke My Rules" mistakes.', goal: 15, current: 0, unit: 'trades', reward: 'Elite Badge', isAccepted: false, isCompleted: false },
  { id: 'ch-2', title: 'Risk Master', description: 'Complete 10 trades with a Reward:Risk ratio >= 2.0.', goal: 10, current: 0, unit: 'wins', reward: 'Sniper Trophy', isAccepted: false, isCompleted: false },
];

const ACADEMY_COURSES = [
  { id: 'ac-1', title: 'Journaling Mastery', description: 'Learn why tracking every trade is the secret to consistency.', category: 'Basics' },
  { id: 'ac-2', title: 'Risk Engineering', description: 'Master the math behind position sizing and stop losses.', category: 'Risk' },
  { id: 'ac-3', title: 'Edge Discovery', description: 'Identify high-probability setups using historical data analysis.', category: 'Strategy' },
];

const DisciplineView: React.FC<DisciplineViewProps> = ({ initialTab = 'rules', trades = [] }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const user = db.getSession();
  
  // Rules State
  const [rules, setRules] = useState<TradingRule[]>([]);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRuleText, setNewRuleText] = useState('');

  // Challenges State
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Academy Progress
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => JSON.parse(localStorage.getItem('academy_progress') || '[]'));

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const rulesData = await db.getRules(user.id);
        setRules(rulesData);
        
        const challengeData = await db.getChallenges(user.id);
        setChallenges(challengeData || INITIAL_CHALLENGES.map(c => ({...c, userId: user.id})));
      }
    };
    fetchData();
  }, [user?.id]);

  useEffect(() => {
    if (user && rules.length > 0) {
      db.saveRules(user.id, rules);
    }
  }, [rules, user?.id]);

  useEffect(() => {
    if (user && challenges.length > 0) {
      db.saveChallenges(user.id, challenges);
    }
  }, [challenges, user?.id]);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Mistakes Pareto Analysis
  const mistakeStats = useMemo(() => {
    const counts: Record<string, number> = {};
    trades.forEach(t => t.mistakes?.forEach(m => counts[m] = (counts[m] || 0) + 1));
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [trades]);

  // Roadmap Progress
  const currentLevel = useMemo(() => {
    const count = trades.length;
    const wins = trades.filter(t => t.pnl > 0).length;
    const wr = count > 0 ? (wins/count) * 100 : 0;
    return ROADMAP_LEVELS.filter(l => count >= l.minTrades && wr >= l.minWinRate).slice(-1)[0] || ROADMAP_LEVELS[0];
  }, [trades]);

  // Challenge Progress Calculation
  useEffect(() => {
    setChallenges(prev => prev.map(ch => {
      if (!ch.isAccepted || ch.isCompleted) return ch;
      let current = 0;
      if (ch.id === 'ch-1') {
        const streak = [...trades].sort((a,b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
        for (const t of streak) if (!t.mistakes?.includes('Broke My Rules')) current++; else break;
      } else if (ch.id === 'ch-2') {
        current = trades.filter(t => Number(t.rrRatio) >= 2).length;
      }
      return { ...ch, current, isCompleted: current >= ch.goal };
    }));
  }, [trades]);

  const handleToggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, committedToday: !r.committedToday, streak: !r.committedToday ? (r.streak || 0) + 1 : Math.max(0, (r.streak || 0) - 1) } : r));
  };

  const handleAddRule = () => {
    if (!newRuleText.trim() || !user) return;
    setRules(prev => [...prev, { id: crypto.randomUUID(), userId: user.id, text: newRuleText, streak: 0, committedToday: false }]);
    setNewRuleText(''); setIsAddingRule(false);
  };

  const tabs = [
    { id: 'rules', label: 'Trading Rules', icon: Ruler },
    { id: 'mistakes', label: 'Mistakes', icon: AlertTriangle },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'tutorials', label: 'Academy', icon: GraduationCap },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in-up">
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center pb-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                <Icon className="h-4 w-4 mr-2" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Execution Mandates</h2>
              <button onClick={() => setIsAddingRule(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg shadow-indigo-500/20 transition-all"><Plus className="h-4 w-4 inline mr-1" /> Add Rule</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rules.map(rule => (
                <div key={rule.id} className={`p-6 rounded-3xl border transition-all ${rule.committedToday ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' : 'bg-white dark:bg-slate-800 border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl ${rule.committedToday ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><Shield className="h-4 w-4" /></div>
                    <span className="text-[10px] font-black text-orange-500 uppercase">Streak: {rule.streak}D</span>
                  </div>
                  <p className={`text-sm font-bold mb-6 ${rule.committedToday ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{rule.text}</p>
                  <button onClick={() => handleToggleRule(rule.id)} className={`w-full py-2.5 rounded-xl text-xs font-bold ${rule.committedToday ? 'bg-emerald-600 text-white' : 'border border-slate-200 text-slate-400'}`}>{rule.committedToday ? 'Committed' : 'Commit Today'}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mistakes' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Psychological Leakage Analysis</h3>
              <div className="h-80 w-full">
                {mistakeStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mistakeStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={140} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                        {mistakeStats.map((e, i) => <Cell key={i} fill={i === 0 ? '#ef4444' : '#fca5a5'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300"><Info className="h-10 w-10 mb-4 opacity-20" /><p className="font-bold opacity-50">Log mistakes in your journal to see leaks</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map(ch => (
              <div key={ch.id} className={`bg-white dark:bg-slate-800 p-6 rounded-[2rem] border transition-all ${ch.isCompleted ? 'border-emerald-500' : 'border-slate-100 dark:border-slate-700 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${ch.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}><Trophy className="h-5 w-5" /></div>
                  {ch.isAccepted && !ch.isCompleted && <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Active</span>}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{ch.title}</h3>
                <p className="text-xs text-slate-500 mb-6">{ch.description}</p>
                {ch.isAccepted ? (
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Progress</span><span>{ch.current}/{ch.goal} {ch.unit}</span></div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(ch.current/ch.goal)*100}%` }}></div></div>
                  </div>
                ) : (
                  <button onClick={() => setChallenges(prev => prev.map(c => c.id === ch.id ? { ...c, isAccepted: true } : c))} className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-bold">Accept Challenge</button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase opacity-70 tracking-widest mb-1">Current Ranking</p>
                <h2 className="text-3xl font-black">{currentLevel.name}</h2>
              </div>
              <Medal className="h-16 w-16 opacity-30" />
            </div>
            <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-5 before:w-0.5 before:bg-slate-200">
              {ROADMAP_LEVELS.map(level => {
                const isAchieved = currentLevel.id >= level.id;
                return (
                  <div key={level.id} className="relative flex items-start pl-16">
                    <div className={`absolute left-0 mt-1 h-10 w-10 rounded-full border-4 border-white flex items-center justify-center transition-all ${isAchieved ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {isAchieved ? <Check className="h-5 w-5" /> : level.id}
                    </div>
                    <div>
                      <h4 className={`font-bold ${isAchieved ? 'text-slate-900' : 'text-slate-400'}`}>{level.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-md">{level.desc}</p>
                      <div className="flex gap-4 mt-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{level.minTrades}+ Trades</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{level.minWinRate}% Win Rate</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'tutorials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACADEMY_COURSES.map(course => (
              <div key={course.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer">
                <div className={`h-2 w-full ${course.category === 'Basics' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full uppercase">{course.category}</span>
                    <Clock className="h-3 w-3 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{course.title}</h3>
                  <p className="text-[10px] text-slate-500 mb-6">{course.description}</p>
                  <button className="w-full bg-slate-900 group-hover:bg-indigo-600 text-white py-3 rounded-2xl text-xs font-bold transition-all">Start Track</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">New Discipline Rule</h3>
            <textarea value={newRuleText} onChange={(e) => setNewRuleText(e.target.value)} placeholder="e.g. No trading after 3:00 PM..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 mb-6" />
            <div className="flex gap-4">
              <button onClick={() => setIsAddingRule(false)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
              <button onClick={handleAddRule} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl">Save Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisciplineView;
