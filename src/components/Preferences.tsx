import React, { useRef, useState } from 'react';
import { Download, Moon, Sun, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Preferences: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const store = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');

  const exportBackup = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      xp: store.xp,
      level: store.level,
      levelName: store.levelName,
      streak: store.streak,
      lastActiveDate: store.lastActiveDate,
      unlockedBadges: store.unlockedBadges,
      quizHistory: store.quizHistory,
      caseSubmissions: store.caseSubmissions,
      savedCalcIds: store.savedCalcIds,
      savedInputs: store.savedInputs,
      theme: store.theme,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'finsoul-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Backup downloaded.');
  };

  const importBackup = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as Record<string, unknown>;
      if (data.version !== 1) {
        setMessage('This file is not a FINSOUL backup.');
        return;
      }
      useStore.setState({
        xp: Number(data.xp) || 0,
        level: Number(data.level) || 1,
        levelName: String(data.levelName || 'Finance Rookie'),
        streak: Number(data.streak) || 1,
        lastActiveDate: (data.lastActiveDate as string | null) ?? null,
        unlockedBadges: (data.unlockedBadges as Record<string, string>) || {},
        quizHistory: (data.quizHistory as typeof store.quizHistory) || [],
        caseSubmissions: (data.caseSubmissions as typeof store.caseSubmissions) || {},
        savedCalcIds: (data.savedCalcIds as string[]) || [],
        savedInputs: (data.savedInputs as Record<string, Record<string, string>>) || {},
        theme: data.theme === 'ink' ? 'ink' : 'cream',
      });
      setMessage('Backup restored.');
    } catch {
      setMessage('Could not read that file.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-navy/50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white text-navy w-full max-w-md rounded-2xl border border-borderCol shadow-xl p-6 space-y-4"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="prefs-title"
      >
        <div>
          <h2 id="prefs-title" className="text-lg font-extrabold">Preferences</h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => store.setTheme('cream')}
            className={`rounded-xl border px-3 py-3 text-sm font-bold flex items-center justify-center gap-2 ${store.theme === 'cream' ? 'border-finsoul bg-finsoul-light' : 'border-borderCol'}`}
          >
            <Sun className="w-4 h-4" /> Ivory
          </button>
          <button
            type="button"
            onClick={() => store.setTheme('ink')}
            className={`rounded-xl border px-3 py-3 text-sm font-bold flex items-center justify-center gap-2 ${store.theme === 'ink' ? 'border-finsoul bg-finsoul-light' : 'border-borderCol'}`}
          >
            <Moon className="w-4 h-4" /> Midnight
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button type="button" onClick={exportBackup} className="flex-1 rounded-xl bg-navy text-white text-sm font-bold py-2.5 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Export backup
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="flex-1 rounded-xl border border-borderCol text-sm font-bold py-2.5 flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" /> Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importBackup(file);
              event.target.value = '';
            }}
          />
        </div>

        {message && <p className="text-xs text-navy bg-cream rounded-lg px-3 py-2">{message}</p>}

        <button type="button" onClick={onClose} className="w-full text-sm font-bold text-subtext py-2">
          Close
        </button>
      </div>
    </div>
  );
};
