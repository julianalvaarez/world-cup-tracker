import { WorldCupState, Match, Phase, HistoryEntry, Status } from '../types';

const STORAGE_KEY_CURRENT = 'wc_tracker_current';
const STORAGE_KEY_HISTORY = 'wc_tracker_history';

// Initial State
const getInitialState = (): WorldCupState => ({
  id: Date.now().toString(),
  phase: "Grupos",
  matches: [],
  points: 0,
  status: "active",
  goalDiff: 0
});

// Helper to calculate match result
const getMatchResult = (my: number, rival: number): "WIN" | "DRAW" | "LOSS" => {
  if (my > rival) return "WIN";
  if (my === rival) return "DRAW";
  return "LOSS";
};

// Helper to calculate points and stats
const calculateStats = (matches: Match[]) => {
  let points = 0;
  let goalDiff = 0;
  
  matches.forEach(m => {
    if (m.result === "WIN") points += 3;
    else if (m.result === "DRAW") points += 1;
    
    goalDiff += (m.myScore - m.rivalScore);
  });

  return { points, goalDiff };
};

export const Antigravity = {
  // GET /current
  getCurrentWorldCup: (): WorldCupState => {
    const stored = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (stored) return JSON.parse(stored);
    const initial = getInitialState();
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(initial));
    return initial;
  },

  // GET /history
  getHistory: (): HistoryEntry[] => {
    const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
    return stored ? JSON.parse(stored) : [];
  },

  // POST /reset
  reset: (): WorldCupState => {
    const newState = getInitialState();
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(newState));
    return newState;
  },

  // POST /match (Add or Update)
  saveMatch: (matchData: Omit<Match, 'result' | 'phase'> & { id?: string }, currentPhase: Phase): WorldCupState => {
    let currentState = Antigravity.getCurrentWorldCup();
    
    // Determine if we are editing an existing match or adding a new one
    const isEdit = !!matchData.id;
    let newMatches = [...currentState.matches];

    const result = getMatchResult(matchData.myScore, matchData.rivalScore);
    const match: Match = {
        id: matchData.id || Date.now().toString(),
        phase: isEdit ? (newMatches.find(m => m.id === matchData.id)?.phase || currentPhase) : currentPhase,
        rivalName: matchData.rivalName,
        myScore: matchData.myScore,
        rivalScore: matchData.rivalScore,
        notes: matchData.notes,
        date: matchData.date,
        result
    };

    if (isEdit) {
      newMatches = newMatches.map(m => m.id === match.id ? match : m);
    } else {
      newMatches.unshift(match); // Add to top
    }

    // Logic Engine
    let nextPhase = currentState.phase;
    let nextStatus = currentState.status;

    // Filter matches by current phase logic mainly for Groups
    // But since we store all matches in one array, we need to filter for logic
    
    // 1. Recalculate Group Stats (always valid to keep track)
    const groupMatches = newMatches.filter(m => m.phase === "Grupos");
    const { points, goalDiff } = calculateStats(newMatches); // Global goal diff, but points usually only group matter. 
    // Actually points only matter for group.
    const groupStats = calculateStats(groupMatches);

    // Business Logic Transitions
    if (currentState.phase === "Grupos") {
        if (groupMatches.length === 3) {
            if (groupStats.points >= 4) {
                nextPhase = "Octavos";
            } else {
                nextStatus = "eliminated";
            }
        }
        // If < 3 matches, stay in Grupos, active.
    } else {
        // Knockout Logic (Octavos, Cuartos, Semis, Final)
        // Check the LATEST match result if we just added it, or re-evaluate.
        // Simplified: If it's a knockout phase match and we LOST, we are out.
        // If we WON, we advance.
        
        // We look at the specific match that was just saved/edited.
        if (match.result === "WIN") {
             // Advance
             if (currentState.phase === "Octavos") nextPhase = "Cuartos";
             else if (currentState.phase === "Cuartos") nextPhase = "Semis";
             else if (currentState.phase === "Semis") nextPhase = "Final";
             else if (currentState.phase === "Final") nextStatus = "winner";
        } else {
            // Draw or Loss in knockout usually means elimination (assuming no penalties logic provided in prompt, simplified to goals)
            // Prompt says: "Si goles_pro <= goles_contra: Disparar estado Eliminado".
            // Draws count as <= (equal).
            nextStatus = "eliminated";
        }
    }

    // Update State
    const newState: WorldCupState = {
        ...currentState,
        matches: newMatches,
        points: groupStats.points,
        goalDiff: goalDiff,
        phase: nextStatus === "active" ? nextPhase : currentState.phase, // Only advance phase if active
        status: nextStatus
    };

    // If Final Winner or Eliminated, save to history (if not already there? rudimentary check)
    if (nextStatus !== "active") {
        const history = Antigravity.getHistory();
        // Prevent duplicate saves if we edit a match in a finished tournament? 
        // For simplicity, we assume one-way flow mostly. 
        // If we are editing and it changes status to active again (e.g. fix a score), handle complex logic?
        // Let's assume once finished, it's done, unless we Reset.
        // But for "Game Over" screen we allow "View Stats".
        
        // We will save to history ONLY when the user explicitly clicks "New Tournament" usually, 
        // OR we can save now. Let's save now to be safe.
        // Check if ID exists in history
        const existingIndex = history.findIndex(h => h.id === newState.id);
        const historyEntry: HistoryEntry = { ...newState, completedAt: new Date().toISOString() };
        
        if (existingIndex >= 0) {
            history[existingIndex] = historyEntry;
        } else {
            history.unshift(historyEntry);
        }
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    }

    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(newState));
    return newState;
  }
};
