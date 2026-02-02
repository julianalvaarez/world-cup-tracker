import React, { useState, useEffect } from 'react';
import { Antigravity } from './services/antigravity';
import { WorldCupState, Screen, Match } from './types';
import { Dashboard } from './screens/Dashboard';
import { History } from './screens/History';
import { Profile } from './screens/Profile';
import { GameOver } from './screens/GameOver';
import { Celebration } from './screens/Celebration';
import { Navbar } from './components/Navbar';

export default function App() {
  const [currentState, setCurrentState] = useState<WorldCupState>(Antigravity.getCurrentWorldCup());
  const [history, setHistory] = useState(Antigravity.getHistory());
  const [screen, setScreen] = useState<Screen>('dashboard');

  useEffect(() => {
    // Sync state if it was updated elsewhere or on mount
    setCurrentState(Antigravity.getCurrentWorldCup());
    setHistory(Antigravity.getHistory());
  }, []);

  // Listen for automatic state changes (Eliminated/Winner) to redirect
  useEffect(() => {
    if (screen === 'dashboard') {
        if (currentState.status === 'eliminated') {
            setScreen('gameover');
        } else if (currentState.status === 'winner') {
            setScreen('celebration');
        }
    }
  }, [currentState, screen]);

  const handleMatchSave = (matchData: Omit<Match, 'result' | 'phase'> & { id?: string }) => {
    const newState = Antigravity.saveMatch(matchData, currentState.phase);
    setCurrentState(newState);
    setHistory(Antigravity.getHistory()); // Update history as saving a match might trigger completion
  };

  const handleRestart = () => {
    const newState = Antigravity.reset();
    setCurrentState(newState);
    setScreen('dashboard');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <Dashboard 
            state={currentState} 
            onMatchSave={handleMatchSave} 
            onOpenHistory={() => setScreen('history')}
            onOpenProfile={() => setScreen('profile')} 
        />;
      case 'history':
        return <History history={history} onBack={() => setScreen('dashboard')} onStartNew={handleRestart} />;
      case 'profile':
        return <Profile />;
      case 'gameover':
        return <GameOver state={currentState} onRestart={handleRestart} onViewStats={() => setScreen('history')} />;
      case 'celebration':
        return <Celebration state={currentState} onRestart={handleRestart} onViewHistory={() => setScreen('history')} />;
      default:
        return <Dashboard 
            state={currentState} 
            onMatchSave={handleMatchSave} 
            onOpenHistory={() => setScreen('history')}
            onOpenProfile={() => setScreen('profile')} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
      {renderScreen()}
      
      {['dashboard', 'history', 'profile'].includes(screen) && (
        <Navbar currentScreen={screen === 'gameover' || screen === 'celebration' ? 'dashboard' : screen} onNavigate={setScreen} />
      )}
    </div>
  );
}