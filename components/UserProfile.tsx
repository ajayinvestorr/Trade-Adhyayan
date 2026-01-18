
import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { User as UserIcon, Mail, Camera, Save, ShieldCheck, Calendar, Globe, FileText, Link as LinkIcon, Image as ImageIcon, Zap, Star } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [website, setWebsite] = useState(user.website || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdateUser({ ...user, name, bio, website, photoURL });
    setIsEditing(false);
  };

  const handlePhotoClick = () => {
      if (isEditing) {
          const url = window.prompt("Enter Image URL for Profile Picture:", photoURL);
          if (url !== null) {
              setPhotoURL(url);
          }
      }
  };

  const isPro = user.subscription?.isActive;
  const planName = "Elite Lifetime Access";
  const expiryDate = "Infinite";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
          <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <Star className="h-4 w-4 text-indigo-600 mr-2 fill-current" />
              <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Elite Member</span>
          </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="h-32 bg-gradient-to-r from-slate-900 to-indigo-900 relative"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row md:justify-between md:items-end -mt-12 mb-8">
            <div className="relative group">
               <div className="h-24 w-24 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-xl ring-4 ring-white dark:ring-slate-800 overflow-hidden">
                 {photoURL ? (
                   <img src={photoURL} alt={name} className="h-full w-full rounded-xl object-cover" />
                 ) : (
                   <div className="h-full w-full rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl font-bold">
                     {name.charAt(0).toUpperCase()}
                   </div>
                 )}
               </div>
               {isEditing && (
                   <button 
                    onClick={handlePhotoClick}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs"
                   >
                       Change
                   </button>
               )}
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
               <button 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center shadow-sm ${
                      isEditing 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                  }`}
               >
                  {isEditing ? <><Save className="h-4 w-4 mr-2" /> Save Profile</> : 'Edit Profile'}
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                disabled={!isEditing}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-xl border ${
                    isEditing 
                    ? 'border-indigo-500 bg-white dark:bg-slate-900 dark:text-white' 
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500'
                } p-3 text-sm transition-all focus:outline-none`}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                <textarea
                    value={bio}
                    disabled={!isEditing}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="E.g. Price Action Trader focused on Nifty Options."
                    className={`w-full rounded-xl border ${
                        isEditing 
                        ? 'border-indigo-500 bg-white dark:bg-slate-900 dark:text-white' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500'
                    } p-3 text-sm focus:outline-none resize-none`}
                />
            </div>
          </div>
          
          <div className="mt-10 border-t border-slate-100 dark:border-slate-700 pt-8">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Subscription Details</h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black mb-1">Current Plan</p>
                   <p className="text-lg font-bold text-indigo-600">
                       {planName}
                   </p>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black mb-1">Status</p>
                   <div className="flex items-center">
                       <div className="h-2 w-2 rounded-full mr-2 bg-emerald-500 animate-pulse"></div>
                       <p className="text-lg font-bold text-slate-900 dark:text-white">Active</p>
                   </div>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black mb-1">Valid Until</p>
                   <p className="text-lg font-bold text-slate-900 dark:text-white">
                       {expiryDate}
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
