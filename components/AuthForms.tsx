
import React, { useState } from 'react';
import { User } from '../types';
import { Loader2 } from 'lucide-react';
import { db } from '../services/db';

interface AuthFormProps {
  type: 'LOGIN' | 'SIGNUP';
  onAuthSuccess: (user: User) => void;
  onNavigate: (path: string) => void;
}

const AuthForms: React.FC<AuthFormProps> = ({ type, onAuthSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isLogin = type === 'LOGIN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!password || !email) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
        let user;
        if (isLogin) {
            user = await db.loginUser(email, password); 
        } else {
            user = await db.registerUser({
                id: '', email, name: email.split('@')[0], password 
            });
        }
        onAuthSuccess(user);
    } catch (err: any) {
        setError(err.message || 'Authentication failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                {isLogin ? 'Enter your credentials to access your journal' : 'Join Trade Adhyayan to start tracking.'}
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-100 dark:border-red-900/30 text-center">
                    {error}
                </div>
            )}
            
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="trader@example.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                />
            </div>

            {!isLogin && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-70 flex justify-center items-center"
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLogin ? 'Log In' : 'Sign Up')}
            </button>

            <div className="text-center mt-4">
                <button 
                    type="button"
                    onClick={() => onNavigate(isLogin ? '/signup' : '/login')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium"
                >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForms;