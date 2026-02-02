import { supabase } from './supabase';
import { WorldCupState, Match, Phase, HistoryEntry, Status } from '../types';

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
  // Fetch the active tournament for the current user
  getCurrentWorldCup: async (): Promise<WorldCupState | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Ensure profile exists (trigger might be slow)
    let { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
    if (!profile) {
      // Wait a bit or try to create it if trigger fails
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { data: profileRetry } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
      if (!profileRetry) {
        await supabase.from('profiles').insert({ id: user.id, username: user.email?.split('@')[0] });
      }
    }

    const { data: tournament, error: tError } = await supabase
      .from('tournaments')
      .select('*, matches(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (tError) throw tError;

    if (!tournament) {
      return Antigravity.reset();
    }

    // Map Supabase match data to Match type
    const matches: Match[] = (tournament.matches || []).map((m: any) => ({
      id: m.id,
      phase: m.phase as Phase,
      rivalName: m.rival_name,
      myScore: m.my_score,
      rivalScore: m.rival_score,
      notes: m.notes,
      date: m.date,
      result: m.result as "WIN" | "DRAW" | "LOSS"
    }));

    return {
      id: tournament.id,
      phase: tournament.phase as Phase,
      matches,
      points: tournament.points,
      status: tournament.status as Status,
      goalDiff: tournament.goal_diff
    };
  },

  // Fetch all completed tournaments (history)
  getHistory: async (): Promise<HistoryEntry[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('tournaments')
      .select('*, matches(*)')
      .eq('user_id', user.id)
      .neq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((t: any) => ({
      id: t.id,
      phase: t.phase as Phase,
      status: t.status as Status,
      points: t.points,
      goalDiff: t.goal_diff,
      completedAt: t.created_at,
      matches: (t.matches || []).map((m: any) => ({
        id: m.id,
        phase: m.phase as Phase,
        rivalName: m.rival_name,
        myScore: m.my_score,
        rivalScore: m.rival_score,
        notes: m.notes,
        date: m.date,
        result: m.result as "WIN" | "DRAW" | "LOSS"
      }))
    }));
  },

  // Start a new tournament
  reset: async (): Promise<WorldCupState> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    // Close any previous active tournament (optional, maybe keep one active at a time)
    await supabase.from('tournaments').update({ status: 'eliminated' }).eq('user_id', user.id).eq('status', 'active');

    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        user_id: user.id,
        phase: 'Grupos',
        status: 'active',
        points: 0,
        goal_diff: 0
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      phase: 'Grupos',
      matches: [],
      points: 0,
      status: 'active',
      goalDiff: 0
    };
  },

  // Save or update a match
  saveMatch: async (matchData: Omit<Match, 'result' | 'phase'> & { id?: string }, currentPhase: Phase): Promise<WorldCupState> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    const currentState = await Antigravity.getCurrentWorldCup();
    if (!currentState) throw new Error("No active tournament found");

    const result = getMatchResult(matchData.myScore, matchData.rivalScore);
    const isEdit = !!matchData.id;

    // 1. Upsert match
    const matchPayload = {
      tournament_id: currentState.id,
      phase: isEdit ? (currentState.matches.find(m => m.id === matchData.id)?.phase || currentPhase) : currentPhase,
      rival_name: matchData.rivalName,
      my_score: matchData.myScore,
      rival_score: matchData.rivalScore,
      notes: matchData.notes,
      date: matchData.date,
      result
    };

    if (isEdit) {
      const { error: mError } = await supabase.from('matches').update(matchPayload).eq('id', matchData.id);
      if (mError) throw mError;
    } else {
      const { error: mError } = await supabase.from('matches').insert(matchPayload);
      if (mError) throw mError;
    }

    // 2. Fetch updated matches to calculate logic
    const { data: updatedMatches, error: fError } = await supabase.from('matches').select('*').eq('tournament_id', currentState.id);
    if (fError) throw fError;

    const mappedMatches: Match[] = updatedMatches.map(m => ({
      id: m.id,
      phase: m.phase as Phase,
      rivalName: m.rival_name,
      myScore: m.my_score,
      rivalScore: m.rival_score,
      notes: m.notes,
      date: m.date,
      result: m.result as "WIN" | "DRAW" | "LOSS"
    }));

    // Logic transitions
    let nextPhase = currentState.phase;
    let nextStatus = currentState.status;

    const groupMatches = mappedMatches.filter(m => m.phase === "Grupos");
    const { points, goalDiff: totalGoalDiff } = calculateStats(mappedMatches);
    const groupStats = calculateStats(groupMatches);

    if (currentState.phase === "Grupos") {
      if (groupMatches.length === 3) {
        if (groupStats.points >= 4) nextPhase = "Octavos";
        else nextStatus = "eliminated";
      }
    } else {
      // Latest match logic for knockout
      const latestMatch = isEdit ? mappedMatches.find(m => m.id === matchData.id)! : mappedMatches[mappedMatches.length - 1];
      if (latestMatch.result === "WIN") {
        if (currentState.phase === "Octavos") nextPhase = "Cuartos";
        else if (currentState.phase === "Cuartos") nextPhase = "Semis";
        else if (currentState.phase === "Semis") nextPhase = "Final";
        else if (currentState.phase === "Final") {
          nextStatus = "winner";
          // ADD TROPHY
          await supabase.from('trophies').insert({
            user_id: user.id,
            tournament_id: currentState.id,
            type: 'Copa del Mundo 2026'
          });
        }
      } else {
        nextStatus = "eliminated";
      }
    }

    // 3. Update tournament
    const { data: updatedTournament, error: tUpdateError } = await supabase
      .from('tournaments')
      .update({
        phase: nextPhase,
        status: nextStatus,
        points: groupStats.points,
        goal_diff: totalGoalDiff
      })
      .eq('id', currentState.id)
      .select()
      .single();

    if (tUpdateError) throw tUpdateError;

    return {
      id: updatedTournament.id,
      phase: updatedTournament.phase as Phase,
      matches: mappedMatches,
      points: updatedTournament.points,
      status: updatedTournament.status as Status,
      goalDiff: updatedTournament.goal_diff
    };
  },

  getTrophies: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.from('trophies').select('*').eq('user_id', user.id);
    if (error) throw error;
    return data;
  }
};
