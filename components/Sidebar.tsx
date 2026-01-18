
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, List, PlusCircle, Calendar, BarChart2, Target, BrainCircuit, Globe, Ruler, Trophy, BookOpen, Wrench, Users, Settings, LogOut, Menu, X, Zap, AlertTriangle, Map, Github
} from 'lucide-react';
import { User } from '../types';
import { db } from '../services/db';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, currentPage, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingRulesCount, setPendingRulesCount] = useState(0);

  // EDIT THIS URL TO YOUR NEW REPOSITORY
  const REPO_URL = "https://github.com/trade-adhyayan/journal";

  useEffect(() => {
    const fetchRules = async () => {
      if (!user) return;
      const rules = await db.getRules(user.id);
      const pending = rules.filter(r => !r.committedToday && r.isActive !== false).length;
      setPendingRulesCount(pending);
    };
    fetchRules();
  }, [user, currentPage]);

  const menuGroups = [
    {
      title: "Journal",
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Trades', path: '/trades', icon: List },
        { name: 'Log Trade', path: '/add-trade', icon: PlusCircle },
        { name: 'Calendar', path: '/calendar', icon: Calendar },
      ]
    },
    {
      title: "Analytics",
      items: [
        { name: 'Reports', path: '/reports', icon: BarChart2 },
        { name: 'Strategies', path: '/strategies', icon: Target },
        { name: 'AI Coach', path: '/ai-insight', icon: BrainCircuit },
      ]
    },
    {
      title: "Growth",
      items: [
        { name: 'Roadmap', path: '/roadmap', icon: Map },
        { name: 'Mistakes', path: '/mistakes', icon: AlertTriangle },
        { name: 'Rules', path: '/rules', icon: Ruler, badge: pendingRulesCount > 0 ? pendingRulesCount : null },
        { name: 'Challenges', path: '/challenges', icon: Trophy },
        { name: 'Learn', path: '/tutorials', icon: BookOpen },
      ]
    },
    {
      title: "System",
      items: [
        { name: 'Tools', path: '/tools', icon: Wrench },
        { name: 'Affiliates', path: '/affiliate', icon: Users },
        { name: 'Settings', path: '/settings', icon: Settings },
        { name: 'Source Code', path: REPO_URL, icon: Github, external: true },
      ]
    }
  ];

  if (!user) return null;

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
           <Zap className="h-5 w-5 text-indigo-600 fill-current" />
           <span className="font-bold text-lg text-slate-900 dark:text-white">Adhyayan</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:h-screen flex flex-col`}>
        <div className="hidden md:flex items-center h-20 px-6">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-200 dark:shadow-none"><Zap className="h-5 w-5 text-white fill-current" /></div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">Trade Adhyayan</span>
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto pb-6 custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                   const Icon = item.icon;
                   const isActive = currentPage === item.path;
                   return (
                     <button 
                      key={item.path} 
                      onClick={() => { 
                        if (item.external) {
                          window.open(item.path, '_blank');
                        } else {
                          onNavigate(item.path); 
                        }
                        setIsOpen(false); 
                      }} 
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                     >
                       <div className="flex items-center text-left">
                         <Icon className={`h-[18px] w-[18px] mr-3 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                         <span className="truncate">{item.name}</span>
                       </div>
                       {item.badge ? <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span> : (isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>)}
                     </button>
                   );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {user.photoURL ? <img src={user.photoURL} alt={user.name} className="h-9 w-9 rounded-lg object-cover mr-3" /> : <div className="h-9 w-9 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm mr-3">{user.name.charAt(0)}</div>}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Elite Member</p>
                </div>
                <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut className="h-4 w-4" /></button>
            </div>
        </div>
      </div>
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Sidebar;
