
import React, { useState } from 'react';
import { User } from '../types';
import { Copy, Users, DollarSign, ExternalLink, Award, CheckCircle2, ArrowRight, TrendingUp, CreditCard, Share2 } from 'lucide-react';

interface AffiliateViewProps {
  user: User; // User is required for the affiliate link
}

const AffiliateView: React.FC<AffiliateViewProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  
  // Mock Data for the view
  const referralLink = `https://tradeadhyayan.com/ref/${user?.name?.toLowerCase().replace(/\s+/g, '') || 'trader'}${user?.id?.slice(-4) || '123'}`;
  
  const stats = [
      { label: 'Total Earnings', value: '₹12,450', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
      { label: 'Total Referrals', value: '48', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
      { label: 'Conversion Rate', value: '14.2%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
      { label: 'Pending Payout', value: '₹2,400', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20' },
  ];

  const referrals = [
      { id: 1, user: 'Rahul K.', date: '2023-10-24', plan: 'Yearly Pro', commission: '₹200', status: 'Paid' },
      { id: 2, user: 'Amit Singh', date: '2023-10-22', plan: 'Monthly', commission: '₹60', status: 'Pending' },
      { id: 3, user: 'Priya D.', date: '2023-10-20', plan: 'Yearly Pro', commission: '₹200', status: 'Paid' },
      { id: 4, user: 'Trader_X', date: '2023-10-18', plan: 'Free Trial', commission: '₹0', status: 'Converting' },
      { id: 5, user: 'Vikram R.', date: '2023-10-15', plan: 'Monthly', commission: '₹60', status: 'Paid' },
  ];

  const handleCopy = () => {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
            <Award className="h-6 w-6 mr-2 text-indigo-600" /> Affiliate Partner Program
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Earn 20% recurring commission for every trader you refer to Trade Adhyayan.
        </p>
      </div>

      {/* Link Generator Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
              <Share2 className="h-40 w-40 text-white" />
          </div>
          <div className="relative z-10">
              <h2 className="text-xl font-bold mb-4">Your Unique Referral Link</h2>
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                  <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 font-mono text-sm flex items-center text-indigo-100">
                      {referralLink}
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-6 py-3 rounded-xl flex items-center justify-center transition-colors shadow-lg"
                  >
                      {copied ? <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" /> : <Copy className="h-5 w-5 mr-2" />}
                      {copied ? 'Copied!' : 'Copy Link'}
                  </button>
              </div>
              <p className="mt-4 text-xs text-indigo-200">
                  Share this link on social media, YouTube, or with friends. Cookies track referrals for 30 days.
              </p>
          </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                  <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                          </div>
                          <div className={`p-3 rounded-xl ${stat.bg}`}>
                              <Icon className={`h-6 w-6 ${stat.color}`} />
                          </div>
                      </div>
                  </div>
              );
          })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Referral History */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 dark:text-white">Recent Referrals</h3>
                  <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                      <thead className="bg-slate-50 dark:bg-slate-700/30">
                          <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan</th>
                              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Commission</th>
                              <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                          {referrals.map((ref) => (
                              <tr key={ref.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{ref.user}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{ref.date}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{ref.plan}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-emerald-600 dark:text-emerald-400">{ref.commission}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                          ref.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                          ref.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                          'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                      }`}>
                                          {ref.status}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Marketing & Payout */}
          <div className="space-y-6">
              {/* Payout Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Request Payout</h3>
                  <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-500 dark:text-slate-400">Min. Threshold</span>
                          <span className="text-slate-900 dark:text-white font-medium">₹1,000</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{width: '100%'}}></div>
                      </div>
                      <p className="text-xs text-emerald-600 mt-1 font-medium">Threshold met!</p>
                  </div>
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">
                      Withdraw ₹2,400
                  </button>
                  <p className="text-xs text-slate-400 text-center mt-3">Payouts processed on 1st & 15th of every month.</p>
              </div>

              {/* How it Works */}
              <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">How it works</h3>
                  <ul className="space-y-3">
                      <li className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                          <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">1</span>
                          Copy your unique referral link above.
                      </li>
                      <li className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                          <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">2</span>
                          Share it with your trading community.
                      </li>
                      <li className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                          <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">3</span>
                          Earn 20% recurring commission on all payments.
                      </li>
                  </ul>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AffiliateView;
