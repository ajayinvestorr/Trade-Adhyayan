
import React, { useState, useMemo, useEffect } from 'react';
import { Trade, TradeStatus, User } from '../types';
import { db } from '../services/db';
import { 
  Activity, Target, ArrowUpRight, ArrowDownRight, BarChart2, PieChart, ClipboardCheck, 
  Zap, TrendingUp, TrendingDown, Wallet, ArrowRight, Crown, CheckCircle, Circle, Flame, 
  Sun, Moon, Sunrise, Sunset, PlusCircle, Scale, Percent, TrendingUp as ProfitIcon, 
  TrendingDown as LossIcon, Award, AlertTriangle, Coins, ShieldCheck, ZapOff, Sparkles,
  Trophy
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  trades: Trade[];
  onNavigate: (path: string) => void;
  user: User;
  onUpdateUser: (user: User) => void;
}

const PerformanceMetric = ({ label, value, subtext, icon: Icon, gradient, trend }: any) => (
  <div className={`relative overflow-hidden p-6 rounded-[2rem] shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/20 group ${gradient} text-white`}>
    <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
      <Icon className="h-32 w-32" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <div className="flex items-baseline space-x-2">
        <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
        {trend && <span className="text-xs font-bold opacity-80">{trend}</span>}
      </div>
      <p className="text-[10px] font-bold opacity-60 mt-2 uppercase">{subtext}</p>
    </div>
  </div>
);

const RuleCard = ({ rule, onToggle }: any) => (
  <div 
    onClick={() => onToggle(rule.id)}
    className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
      rule.committedToday 
      ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800 shadow-sm' 
      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-300 hover:shadow-lg'
    }`}
  >
    <div className="flex items-center space-x-4">
      <div className={`p-2 rounded-xl transition-colors ${
        rule.committedToday ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
      }`}>
        {rule.committedToday ? <ShieldCheck className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
      </div>
      <div>
        <p className={`text-xs font-bold ${rule.committedToday ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
          {rule.text}
        </p>
        {rule.streak > 0 && (
          <div className="flex items-center mt-1">
            <Flame className="h-3 w-3 text-orange-500 mr-1" />
            <span className="text-[10px] font-black text-orange-500 uppercase">{rule.streak} Day Streak</span>
          </div>
        )}
      </div>
    </div>
    <div className={`w-1.5 h-1.5 rounded-full transition-all ${rule.committedToday ? 'bg-emerald-500 scale-150' : 'bg-slate-200'}`} />
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ trades, onNavigate, user, onUpdateUser }) => {
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    const fetchRules = async () => {
      const data = await db.getRules(user.id);
      setRules(data);
    };
    fetchRules();
  }, [user.id]);

  const stats = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === TradeStatus.CLOSED);
    
    let netPnL = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let wins = 0;
    let totalRR = 0;
    let rrCount = 0;

    closedTrades.forEach(t => {
      const pnl = Number(t.pnl || 0);
      netPnL += pnl;
      if (pnl > 0) {
        wins++;
        grossProfit += pnl;
      } else {
        grossLoss += Math.abs(pnl);
      }
      
      if (t.rrRatio) {
        let val = typeof t.rrRatio === 'number' ? t.rrRatio : parseFloat(String(t.rrRatio).split(':').pop() || '0');
        if (!isNaN(val) && val > 0) { 
          totalRR += val; 
          rrCount++; 
        }
      }
    });

    const avgRR = rrCount > 0 ? totalRR / rrCount : 0;
    const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 10 : 0);

    return {
      netPnL,
      avgRR,
      winRate,
      profitFactor,
      totalTrades: closedTrades.length,
      disciplineScore: rules.length > 0 ? (rules.filter(r => r.committedToday).length / rules.length) * 100 : 0
    };
  }, [trades, rules]);

  const equityData = useMemo(() => {
    let equity = 0;
    return [...trades]
      .filter(t => t.status === TradeStatus.CLOSED)
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
      .map(t => {
        equity += (t.pnl || 0);
        return {
          date: new Date(t.entryDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
          equity
        };
      });
  }, [trades]);

  const handleToggleRule = (id: string) => {
    setRules(prev => {
      const updated = prev.map(r => r.id === id ? { 
        ...r, 
        committedToday: !r.committedToday, 
        streak: !r.committedToday ? (r.streak || 0) + 1 : Math.max(0, (r.streak || 0) - 1)
      } : r);
      db.saveRules(user.id, updated);
      return updated;
    });
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good Morning', icon: Sunrise, msg: "The markets await your discipline." };
    if (h < 17) return { text: 'Good Afternoon', icon: Sun, msg: "Focus on process, not just P/L." };
    return { text: 'Good Evening', icon: Sunset, msg: "Review the day, sharpen for tomorrow." };
  })();
  const GreetingIcon = greeting.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
      {/* Dynamic Hero Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex items-center space-x-6">
            <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <GreetingIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {greeting.text}, {user.name.split(' ')[0]}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                {greeting.msg}
              </p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={() => onNavigate('/reports')}
              className="flex-1 md:flex-none px-6 py-3 font-bold text-slate-700 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"
            >
              Analyze
            </button>
            <button 
              onClick={() => onNavigate('/add-trade')}
              className="flex-1 md:flex-none px-8 py-3 font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 flex items-center justify-center transition-all hover:-translate-y-1 active:scale-95"
            >
              <PlusCircle className="h-5 w-5 mr-2" /> Log Trade
            </button>
          </div>
        </div>
      </div>

      {/* Main Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PerformanceMetric 
          label="Risk Efficiency" 
          value={`1:${stats.avgRR.toFixed(1)}`} 
          subtext="Avg Risk to Reward" 
          icon={Target} 
          gradient="bg-gradient-to-br from-indigo-600 to-indigo-800"
        />
        <PerformanceMetric 
          label="Net Performance" 
          value={`₹${stats.netPnL.toLocaleString()}`} 
          subtext="Total Realized P/L" 
          icon={Wallet} 
          gradient={stats.netPnL >= 0 ? "bg-gradient-to-br from-emerald-500 to-emerald-700" : "bg-gradient-to-br from-rose-500 to-rose-700"}
          trend={`${stats.totalTrades} Trades`}
        />
        <PerformanceMetric 
          label="Discipline" 
          value={`${Math.round(stats.disciplineScore)}%`} 
          subtext="Rule Commitment Today" 
          icon={ShieldCheck} 
          gradient="bg-gradient-to-br from-purple-600 to-purple-800"
        />
        <PerformanceMetric 
          label="Profit Factor" 
          value={stats.profitFactor.toFixed(2)} 
          subtext="Gross Win / Gross Loss" 
          icon={Scale} 
          gradient="bg-gradient-to-br from-blue-600 to-blue-800"
        />
      </div>

      {/* Charts & Rules Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Equity Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-xl text-slate-900 dark:text-white">Equity Curve</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Growth progression</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${stats.winRate > 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                Win Rate: {stats.winRate.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="h-[350px]">
            {equityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '12px' }}
                    itemStyle={{ fontWeight: 'bold', fontSize: '14px' }}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#6366f1" strokeWidth={5} fill="url(#equityGradient)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <div className="p-6 bg-slate-50 rounded-full mb-4">
                  <BarChart2 className="h-12 w-12 opacity-20" />
                </div>
                <p className="text-sm font-black opacity-40 uppercase tracking-widest">Awaiting execution data...</p>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Rules */}
        <div className="flex flex-col space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 p-8 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Rulebook</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Daily Commitment</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Flame className={`h-6 w-6 ${stats.disciplineScore === 100 ? 'text-orange-500' : 'text-slate-300'}`} />
              </div>
            </div>
            <div className="space-y-3">
              {rules.length > 0 ? (
                rules.slice(0, 5).map(rule => (
                  <RuleCard key={rule.id} rule={rule} onToggle={handleToggleRule} />
                ))
              ) : (
                <div className="text-center py-12">
                  <ZapOff className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-bold">No active rules defined.</p>
                  <button onClick={() => onNavigate('/rules')} className="text-[10px] text-indigo-600 uppercase font-black mt-2 underline">Setup Discipline</button>
                </div>
              )}
            </div>
            {rules.length > 5 && (
              <button onClick={() => onNavigate('/rules')} className="w-full mt-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                View All {rules.length} Rules
              </button>
            )}
          </div>

          {/* Quick Stats Banner */}
          <div className="bg-slate-900 rounded-3xl p-6 flex items-center justify-between text-white shadow-2xl overflow-hidden relative group">
            <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
              <Trophy className="h-24 w-24" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consistency</p>
              <h4 className="text-xl font-bold">{stats.winRate > 60 ? 'Top Tier' : 'Developing'}</h4>
            </div>
            <ArrowRight className="h-5 w-5 text-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
