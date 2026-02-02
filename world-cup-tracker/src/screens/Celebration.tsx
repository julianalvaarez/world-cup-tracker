import React, { useEffect } from 'react';
import { WorldCupState } from '../types';
import confetti from 'canvas-confetti';

interface CelebrationProps {
  state: WorldCupState;
  onRestart: () => void;
  onViewHistory: () => void;
}

export const Celebration: React.FC<CelebrationProps> = ({ state, onRestart, onViewHistory }) => {
  const [isRestarting, setIsRestarting] = React.useState(false);

  const handleRestart = async () => {
    setIsRestarting(true);
    await onRestart();
    setIsRestarting(false);
  };

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a60df2', '#ffd700', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a60df2', '#ffd700', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const wins = state.matches.filter(m => m.result === 'WIN').length;
  const goals = state.matches.reduce((acc, m) => acc + m.myScore, 0);
  const cleanSheets = state.matches.filter(m => m.rivalScore === 0).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1c1022] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>

      <nav className="relative flex items-center p-4 justify-between z-10">
        <button onClick={onViewHistory} className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <span className="material-symbols-outlined text-primary">arrow_back_ios_new</span>
        </button>
        <h2 className="text-white text-lg font-bold flex-1 text-center pr-12">Celebration</h2>
      </nav>

      <main className="relative flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="relative flex flex-col items-center justify-center mb-6">
          <div className="bg-gradient-to-b from-yellow-300 to-yellow-600 p-8 rounded-full mb-6 shadow-[0_0_50px_rgba(166,13,242,0.6)] animate-bounce-slow">
            <span className="material-symbols-outlined text-white text-[80px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          </div>
        </div>

        <div className="text-center space-y-2 z-10 mb-10">
          <h1 className="text-white tracking-tighter text-4xl font-extrabold leading-tight">CONGRATULATIONS!</h1>
          <h2 className="text-primary text-xl font-bold tracking-wide">YOU ARE WORLD CHAMPION!</h2>
        </div>

        <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl">
          <div className="flex flex-row justify-between gap-2">
            <div className="flex flex-col items-center justify-center flex-1 p-3 rounded-lg bg-primary/10">
              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest text-center">Goals</p>
              <p className="text-white text-2xl font-black">{goals}</p>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 p-3 rounded-lg bg-primary/10">
              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest text-center">Wins</p>
              <p className="text-white text-2xl font-black">{wins}</p>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 p-3 rounded-lg bg-primary/10">
              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest text-center">Clean Sheets</p>
              <p className="text-white text-2xl font-black">{cleanSheets}</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mt-10">
          <button
            onClick={handleRestart}
            disabled={isRestarting}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 px-6 rounded-full shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRestarting ? (
              <div className="flex items-center gap-2">
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Reiniciando...</span>
              </div>
            ) : (
              'Comenzar Nueva Campaña'
            )}
          </button>
        </div>
      </main>
    </div>
  );
};
