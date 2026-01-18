
import React from 'react';
import { User } from '../types';
import { BookOpen, LogOut, LayoutDashboard, List, PlusCircle, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, currentPage, onNavigate }) => {
  const navItemClass = (page: string) =>
    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
      currentPage === page
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('/')}>
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-slate-900 tracking-tight">Trade Adhyayan</span>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2 md:space-x-6">
                <div className="hidden md:flex space-x-4">
                  <button onClick={() => onNavigate('/dashboard')} className={navItemClass('/dashboard')}>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                  <button onClick={() => onNavigate('/trades')} className={navItemClass('/trades')}>
                    <List className="h-4 w-4" />
                    <span>Journal</span>
                  </button>
                  <button onClick={() => onNavigate('/add-trade')} className={navItemClass('/add-trade')}>
                    <PlusCircle className="h-4 w-4" />
                    <span>Log Trade</span>
                  </button>
                </div>
                
                <div className="flex items-center pl-4 border-l border-slate-200 ml-4">
                  <div className="flex items-center mr-4">
                    {user.photoURL ? (
                       <img src={user.photoURL} alt={user.name} className="h-8 w-8 rounded-full object-cover mr-2" />
                    ) : (
                       <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-2">
                          {user.name.charAt(0)}
                       </div>
                    )}
                    <span className="text-sm text-slate-500 hidden sm:block">{user.email}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onNavigate('/login')}
                  className="text-slate-600 hover:text-slate-900 font-medium px-3 py-2"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate('/signup')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Sign Up Free
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {user && (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 flex justify-around p-2">
           <button onClick={() => onNavigate('/dashboard')} className={`flex flex-col items-center p-2 rounded ${currentPage === '/dashboard' ? 'text-indigo-600' : 'text-slate-500'}`}>
             <LayoutDashboard className="h-5 w-5" />
             <span className="text-xs mt-1">Dash</span>
           </button>
           <button onClick={() => onNavigate('/trades')} className={`flex flex-col items-center p-2 rounded ${currentPage === '/trades' ? 'text-indigo-600' : 'text-slate-500'}`}>
             <List className="h-5 w-5" />
             <span className="text-xs mt-1">Journal</span>
           </button>
           <button onClick={() => onNavigate('/add-trade')} className={`flex flex-col items-center p-2 rounded ${currentPage === '/add-trade' ? 'text-indigo-600' : 'text-slate-500'}`}>
             <PlusCircle className="h-5 w-5" />
             <span className="text-xs mt-1">Add</span>
           </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
