import React from 'react';
import { WorldCupState } from '../types';

interface GameOverProps {
  state: WorldCupState;
  onRestart: () => void;
  onViewStats: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ state, onRestart, onViewStats }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-[420px] bg-[#1c1022] border border-[#332839] rounded-xl overflow-hidden shadow-2xl m-4">
            <div className="px-6 py-8 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full"></div>
                    <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-red-500/30 bg-red-500/10">
                        <span className="material-symbols-outlined text-red-500 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            heart_broken
                        </span>
                    </div>
                </div>

                <h1 className="text-white tracking-light text-[28px] font-bold leading-tight text-center pb-2 uppercase">
                    Tournament Ended
                </h1>
                
                <p className="text-[#b09cba] text-base font-normal leading-relaxed text-center px-4">
                    {state.phase === 'Grupos' 
                        ? "You didn't reach the required points to advance."
                        : "Defeat in the knockout stage means the end of the road."
                    }
                </p>

                <div className="w-full mt-8 bg-black/30 rounded-xl border border-white/5 p-4">
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#b09cba] text-lg">layers</span>
                            <p className="text-[#b09cba] text-sm font-medium uppercase tracking-wider">Phase</p>
                        </div>
                        <p className="text-white text-sm font-bold text-right">{state.phase}</p>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#b09cba] text-lg">scoreboard</span>
                            <p className="text-[#b09cba] text-sm font-medium uppercase tracking-wider">Points</p>
                        </div>
                        <div className="text-right">
                            <span className="text-red-400 text-sm font-bold">{state.points}</span>
                            {state.phase === 'Grupos' && <span className="text-[#b09cba] text-sm font-normal"> / 4</span>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full mt-8">
                    <button 
                        onClick={onRestart}
                        className="flex cursor-pointer items-center justify-center rounded-xl h-14 px-5 bg-primary hover:bg-[#b82dfc] transition-colors text-white text-lg font-bold w-full shadow-lg shadow-primary/20"
                    >
                        Start New World Cup
                    </button>
                    <button 
                        onClick={onViewStats}
                        className="flex cursor-pointer items-center justify-center rounded-xl h-14 px-5 bg-[#332839] hover:bg-[#43354b] transition-colors text-white text-base font-bold w-full border border-white/5"
                    >
                        View Stats / History
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
