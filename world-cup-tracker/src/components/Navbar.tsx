import React from 'react';
import { Screen } from '../types';

interface NavbarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, onNavigate }) => {
  const getButtonClass = (screen: Screen) => {
    const isActive = currentScreen === screen;
    const colorClass = isActive ? 'text-primary' : 'text-slate-600 dark:text-slate-400';
    return `flex flex-col items-center gap-1 min-w-[64px] cursor-pointer ${colorClass} ${!isActive ? 'opacity-70 hover:opacity-100' : ''}`;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#1c1022]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 pb-6 pt-3 px-6 z-30">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button className={getButtonClass('dashboard')} onClick={() => onNavigate('dashboard')}>
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: currentScreen === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className={getButtonClass('history')} onClick={() => onNavigate('history')}>
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: currentScreen === 'history' ? "'FILL' 1" : "'FILL' 0" }}>emoji_events</span>
          <span className="text-[10px] font-bold">History</span>
        </button>
        <button className={getButtonClass('profile')} onClick={() => onNavigate('profile')}>
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: currentScreen === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
    </nav>
  );
};
