
import React, { useRef, useState } from 'react';
import { Moon, Sun, Monitor, Download, Upload, Trash2, Database, AlertTriangle, FileJson, FileSpreadsheet, CheckCircle2, Github, Info } from 'lucide-react';
import { db } from '../services/db';
import { Trade, TradeType, AssetClass, TradeStatus } from '../types';

interface SettingsProps {
  theme: 'light' | 'dark';
  onToggleTheme: (theme: 'light' | 'dark') => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, onToggleTheme }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ message: string, type: 'success' | 'error' | 'loading' | null }>({ message: '', type: null });
  const [syncStatus, setSyncStatus] = useState<{ message: string, type: 'success' | 'error' | 'loading' | null }>({ message: '', type: null });

  // EDIT THIS URL TO YOUR NEW REPOSITORY
  const REPO_URL = "https://github.com/trade-adhyayan/journal";

  const handleExport = async () => {
    try {
      const data = await db.exportDatabase();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trade_adhyayan_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export database.");
      console.error(err);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Restoring a backup will overwrite existing settings in some areas, but preserve your trades. Are you sure you want to proceed?")) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.users || !json.trades) {
          throw new Error("Invalid backup structure: Missing 'users' or 'trades' data.");
        }
        await db.importDatabase(json);
        alert('Database restored successfully! The page will now reload.');
        window.location.reload();
      } catch (err: any) {
        alert(`Failed to restore database.\nError: ${err.message || 'Invalid file format.'}`);
        console.error(err);
      }
    };
    reader.onerror = () => {
      alert("Error reading file.");
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSync = async () => {
    setSyncStatus({ message: 'Syncing...', type: 'loading' });
    try {
      const results = await db.syncLocalTradesToSupabase();
      if (results.success > 0 || results.failed > 0) {
        setSyncStatus({
          message: `Sync complete! Successfully uploaded ${results.success} trades.${results.failed > 0 ? ` Failed: ${results.failed}` : ''}`,
          type: results.failed > 0 ? 'error' : 'success'
        });
      } else {
        setSyncStatus({ message: 'All data is already in the cloud.', type: 'success' });
      }
      setTimeout(() => setSyncStatus({ message: '', type: null }), 5000);
    } catch (err) {
      setSyncStatus({ message: 'Sync failed. Please check connection.', type: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Manage your account preferences and application settings.</p>

      {/* Project Info Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors mb-8">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
            <Info className="h-5 w-5 mr-2 text-indigo-500" /> Project Info
          </h2>
        </div>
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-900 dark:text-white mb-1">GitHub Repository</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">View source code, report bugs, or contribute to the project.</p>
          </div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg"
          >
            <Github className="h-4 w-4 mr-2" /> View Repository
          </a>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors mb-8">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
            <Monitor className="h-5 w-5 mr-2 text-indigo-500" /> Appearance
          </h2>
        </div>
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-900 dark:text-white mb-1">Theme Preference</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Customize how Trade Adhyayan looks on your device.</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
            <button onClick={() => onToggleTheme('light')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'light' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><Sun className="h-4 w-4 mr-2" /> Light</button>
            <button onClick={() => onToggleTheme('dark')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'dark' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><Moon className="h-4 w-4 mr-2" /> Dark</button>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors mb-8">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
            <Database className="h-5 w-5 mr-2 text-indigo-500" /> Data Management
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-1">Full Backup & Restore</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">Export your trades, strategies, and settings to a JSON file.</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleExport} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold border border-indigo-200"><Download className="h-4 w-4 mr-2" /> Export</button>
              <button onClick={handleImportClick} className="flex items-center px-4 py-2 bg-white text-slate-700 rounded-xl text-sm font-bold border border-slate-300"><Upload className="h-4 w-4 mr-2" /> Restore</button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-1">Cloud Synchronization</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">Push your locally saved trades to Supabase cloud storage.</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <button
                onClick={handleSync}
                disabled={syncStatus.type === 'loading'}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold border transition-all ${syncStatus.type === 'loading' ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
              >
                {syncStatus.type === 'loading' ? (
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Sync with Cloud
              </button>
              {syncStatus.message && (
                <p className={`text-xs font-medium ${syncStatus.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>{syncStatus.message}</p>
              )}
            </div>
          </div>

          <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-rose-100 rounded-lg"><AlertTriangle className="h-5 w-5 text-rose-600" /></div>
              <div>
                <p className="font-bold text-rose-700 text-sm">Reset Application</p>
                <p className="text-xs text-rose-600/80 mt-1 max-w-xs">Permanently delete all trades and data.</p>
              </div>
            </div>
            <button onClick={() => { if (confirm('Wipe ALL data?')) db.clearDatabase(); window.location.reload(); }} className="flex items-center px-4 py-2 bg-white text-rose-600 rounded-xl text-sm font-bold border border-rose-200 shadow-sm"><Trash2 className="h-4 w-4 mr-2" /> Wipe Data</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
