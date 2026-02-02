import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { Antigravity } from './services/antigravity';
import { WorldCupState, Screen, Match, HistoryEntry } from './types';
import { Dashboard } from './screens/Dashboard';
import { History } from './screens/History';
import { Profile } from './screens/Profile';
import { GameOver } from './screens/GameOver';
import { Celebration } from './screens/Celebration';
import { Auth } from './screens/Auth';
import { Navbar } from './components/Navbar';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentState, setCurrentState] = useState<WorldCupState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [profile, setProfile] = useState<{ name: string; team: string } | null>(null);
  const [trophies, setTrophies] = useState<any[]>([]);
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        setLoading(true);
        try {
          const [state, hist, trophiesData] = await Promise.all([
            Antigravity.getCurrentWorldCup(),
            Antigravity.getHistory(),
            Antigravity.getTrophies(),
          ]);

          setCurrentState(state);
          setHistory(hist);
          setTrophies(trophiesData);

          // Fetch Profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileData) {
            setProfile({
              name: profileData.username || session.user.email?.split('@')[0],
              team: '',
            });
          } else {
            setProfile({
              name: session.user.email?.split('@')[0] || 'Usuario',
              team: '',
            });
          }
        } catch (err) {
          console.error('Error fetching initial data:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [session]);

  // Listen for automatic state changes (Eliminated/Winner) to redirect
  useEffect(() => {
    if (screen === 'dashboard' && currentState) {
      if (currentState.status === 'eliminated') {
        setScreen('gameover');
      } else if (currentState.status === 'winner') {
        setScreen('celebration');
      }
    }
  }, [currentState, screen]);

  const handleMatchSave = async (matchData: Omit<Match, 'result' | 'phase'> & { id?: string }) => {
    if (!currentState) return;
    const newState = await Antigravity.saveMatch(matchData, currentState.phase);
    setCurrentState(newState);

    // If the tournament ended, refresh trophies and history
    if (newState.status !== 'active') {
      const [hist, trophiesData] = await Promise.all([Antigravity.getHistory(), Antigravity.getTrophies()]);
      setHistory(hist);
      setTrophies(trophiesData);
    } else {
      const hist = await Antigravity.getHistory();
      setHistory(hist);
    }
  };

  const handleRestart = async () => {
    const newState = await Antigravity.reset();
    setCurrentState(newState);
    setScreen('dashboard');
    const hist = await Antigravity.getHistory();
    setHistory(hist);
  };

  const renderScreen = () => {
    if (!currentState && screen !== 'profile') {
      return <div className="flex items-center justify-center p-10 text-primary">Cargando datos...</div>;
    }

    switch (screen) {
      case 'dashboard':
        return <Dashboard
          state={currentState!}
          onMatchSave={handleMatchSave}
          onOpenHistory={() => setScreen('history')}
          onOpenProfile={() => setScreen('profile')}
        />;
      case 'history':
        return <History history={history} onBack={() => setScreen('dashboard')} onStartNew={handleRestart} />;
      case 'profile':
        return (
          <Profile
            initialProfile={profile || { name: '...', team: '' }}
            trophies={trophies}
            onUpdate={(newProfile) => setProfile(newProfile)}
          />
        );
      case 'gameover':
        return <GameOver state={currentState!} onRestart={handleRestart} onViewStats={() => setScreen('history')} />;
      case 'celebration':
        return <Celebration state={currentState!} onRestart={handleRestart} onViewHistory={() => setScreen('history')} />;
      default:
        return <Dashboard
          state={currentState!}
          onMatchSave={handleMatchSave}
          onOpenHistory={() => setScreen('history')}
          onOpenProfile={() => setScreen('profile')}
        />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark text-primary font-display">Cargando...</div>;
  }

  if (!session) {
    return <Auth onSuccess={() => setScreen('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
      {renderScreen()}

      {['dashboard', 'history', 'profile'].includes(screen) && (
        <Navbar currentScreen={screen === 'gameover' || screen === 'celebration' ? 'dashboard' : screen} onNavigate={setScreen} />
      )}
    </div>
  );
}