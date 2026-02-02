import React from 'react';
import { HistoryEntry } from '../types';

interface HistoryProps {
  history: HistoryEntry[];
  onBack: () => void;
  onStartNew: () => void;
}

export const History: React.FC<HistoryProps> = ({ history, onBack, onStartNew }) => {
  const historyList = Array.isArray(history) ? history : [];

  const totalTrophies = historyList.filter(h => h.status === 'winner').length;
  const totalMatches = historyList.reduce((acc, h) => acc + (Array.isArray(h.matches) ? h.matches.length : 0), 0);
  const totalWins = historyList.reduce((acc, h) => acc + (Array.isArray(h.matches) ? h.matches.filter(m => m.result === 'WIN').length : 0), 0);
  const winRatio = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  return (
    <div className="flex flex-col min-h-full pb-24 bg-background-light dark:bg-background-dark">
      <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-primary/20">
        <div className="flex items-center p-4 pb-2 justify-between max-w-md mx-auto">
          <button onClick={onBack} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-primary/20 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center">Hall of Fame</h2>
          <div className="size-10"></div>
        </div>
      </div>

      <main className="max-w-md mx-auto w-full p-4 space-y-4">

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl p-4 bg-white dark:bg-[#2d1b36] border border-slate-200 dark:border-primary/10 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl">emoji_events</span>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{totalTrophies}</p>
              <p className="text-[10px] text-slate-500 dark:text-primary/60 font-medium uppercase mt-1">Trophies</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl p-4 bg-white dark:bg-[#2d1b36] border border-slate-200 dark:border-primary/10 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl">query_stats</span>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{winRatio}%</p>
              <p className="text-[10px] text-slate-500 dark:text-primary/60 font-medium uppercase mt-1">Win Ratio</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl p-4 bg-white dark:bg-[#2d1b36] border border-slate-200 dark:border-primary/10 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl">sports_soccer</span>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{totalMatches}</p>
              <p className="text-[10px] text-slate-500 dark:text-primary/60 font-medium uppercase mt-1">Matches</p>
            </div>
          </div>
        </div>

        <div className="pt-6 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tournament History</h3>
            <span className="text-xs font-medium text-slate-400">Chronological</span>
          </div>
        </div>

        <div className="space-y-3">
          {historyList.map((h, idx) => (
            <details key={h.id} className="group bg-white dark:bg-[#261830] rounded-xl border border-slate-200 dark:border-primary/20 overflow-hidden shadow-sm" open={idx === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 focus:outline-none select-none">
                <div className="flex items-center gap-4">
                  <div className={`flex size-12 items-center justify-center rounded-lg border ${h.status === 'winner' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-100 dark:bg-primary/5 text-slate-500 dark:text-primary/40 border-slate-100 dark:border-primary/10'}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: h.status === 'winner' ? "'FILL' 1" : "'FILL' 0" }}>
                      {h.status === 'winner' ? 'stars' : 'stadium'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-slate-900 dark:text-white">Tournament #{history.length - idx}</p>
                      {h.status === 'winner' && (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-[10px] text-white font-bold uppercase tracking-tight">Winner</span>
                      )}
                    </div>
                    <p className="text-slate-500 dark:text-primary/60 text-xs font-medium">Phase: {h.phase}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-500 transition-transform duration-300 group-open:rotate-180">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-0">
                <div className="border-t border-slate-100 dark:border-primary/10 pt-4 space-y-2">
                  {h.matches.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-background-dark/50 border border-slate-100 dark:border-primary/5">
                      <div className="flex-1 text-xs font-bold uppercase text-slate-400">{m.phase}</div>
                      <div className="flex-[3] text-center text-sm text-slate-800 dark:text-slate-200">
                        You <span className="font-bold text-primary mx-1">{m.myScore} - {m.rivalScore}</span> {m.rivalName}
                      </div>
                      <div className="flex-1 text-right flex justify-end">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.result === 'WIN' ? 'bg-primary/20 text-primary' :
                          m.result === 'LOSS' ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' :
                            'bg-yellow-500/20 text-yellow-600'
                          }`}>
                          {m.result[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}

          {historyList.length === 0 && (
            <div className="text-center py-10 text-slate-500">No history available.</div>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center">
          <button
            onClick={onStartNew}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Start New Campaign
          </button>
          <p className="text-[10px] text-slate-400 mt-6 mb-4 uppercase tracking-[0.2em]">End of History</p>
        </div>
      </main>
    </div>
  );
};