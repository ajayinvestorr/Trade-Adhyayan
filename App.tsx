
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import TradeList from './components/TradeList';
import AddTradeForm from './components/AddTradeForm';
import AuthForms from './components/AuthForms';
import TradeCalendar from './components/TradeCalendar';
import Settings from './components/Settings';
import AnalysisView from './components/AnalysisView';
import DisciplineView from './components/DisciplineView';
import UserProfile from './components/UserProfile';
import ToolsView from './components/ToolsView';
import AffiliateView from './components/AffiliateView';
import { User, Trade } from './types';
import { db } from './services/db';

const ProtectedRoute: React.FC<{user: User|null, onNavigate: any, children: React.ReactNode}> = ({ user, onNavigate, children }) => {
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 flex-col px-4 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4 font-medium">Authentication required to access this portal.</p>
        <button onClick={() => onNavigate('/login')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-700 transition-all">Log In Now</button>
      </div>
    );
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');
  const [user, setUser] = useState<User | null>(() => db.getSession());
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserTrades = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const data = await db.getTradesForUser(userId);
      setTrades(data);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchUserTrades(user.id);
  }, [user, fetchUserTrades]);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('trade_adhyayan_theme');
    return (saved === 'light' || saved === 'dark') ? saved : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('trade_adhyayan_theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => { window.location.hash = path; };

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setTrades([]);
    db.clearSession();
    navigate('/');
  };

  const handleAddTrade = async (trade: Trade) => {
    if (!user) return;
    const newTrade = { ...trade, userId: user.id };
    await db.addTrade(newTrade);
    setTrades(prev => [newTrade, ...prev]);
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (window.confirm("Permanently remove this trade from your journal?")) {
      await db.deleteTrade(tradeId);
      setTrades(prev => prev.filter(t => t.id !== tradeId));
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold text-sm tracking-wide uppercase">Syncing Journal...</p>
        </div>
      );
    }

    switch (currentPath) {
      case '/': return user ? <Dashboard trades={trades} onNavigate={navigate} user={user} onUpdateUser={setUser} /> : <LandingPage onNavigate={navigate} />;
      case '/login': return <AuthForms type="LOGIN" onAuthSuccess={handleAuthSuccess} onNavigate={navigate} />;
      case '/signup': return <AuthForms type="SIGNUP" onAuthSuccess={handleAuthSuccess} onNavigate={navigate} />;
      case '/dashboard': return <ProtectedRoute user={user} onNavigate={navigate}><Dashboard trades={trades} onNavigate={navigate} user={user!} onUpdateUser={setUser} /></ProtectedRoute>;
      case '/trades': return <ProtectedRoute user={user} onNavigate={navigate}><TradeList trades={trades} onDeleteTrade={handleDeleteTrade} /></ProtectedRoute>;
      case '/add-trade': return <ProtectedRoute user={user} onNavigate={navigate}><AddTradeForm onAddTrade={handleAddTrade} onNavigate={navigate} /></ProtectedRoute>;
      case '/profile': return <ProtectedRoute user={user} onNavigate={navigate}><UserProfile user={user!} onUpdateUser={setUser} /></ProtectedRoute>;
      case '/calendar': return <ProtectedRoute user={user} onNavigate={navigate}><TradeCalendar trades={trades} /></ProtectedRoute>;
      case '/settings': return <ProtectedRoute user={user} onNavigate={navigate}><Settings theme={theme} onToggleTheme={setTheme} /></ProtectedRoute>;
      case '/reports':
      case '/strategies':
      case '/ai-insight': return <ProtectedRoute user={user} onNavigate={navigate}><AnalysisView initialTab={currentPath.slice(1)} trades={trades} user={user} /></ProtectedRoute>;
      case '/rules':
      case '/mistakes':
      case '/challenges':
      case '/roadmap':
      case '/tutorials': return <ProtectedRoute user={user} onNavigate={navigate}><DisciplineView initialTab={currentPath.slice(1)} trades={trades} /></ProtectedRoute>;
      case '/tools': return <ProtectedRoute user={user} onNavigate={navigate}><ToolsView /></ProtectedRoute>;
      case '/affiliate': return <ProtectedRoute user={user} onNavigate={navigate}><AffiliateView user={user!} /></ProtectedRoute>;
      default: return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className={`font-sans transition-colors duration-300 ${user ? 'flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden' : 'min-h-screen bg-white dark:bg-slate-900'}`}>
      {user ? (
        <Sidebar user={user} onLogout={handleLogout} currentPage={currentPath} onNavigate={navigate} />
      ) : (
        currentPath !== '/' && <Navbar user={user} onLogout={handleLogout} currentPage={currentPath} onNavigate={navigate} />
      )}
      <main className={`flex-1 ${user ? 'overflow-y-auto h-full relative' : ''}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
