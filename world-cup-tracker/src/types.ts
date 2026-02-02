export type Phase = "Grupos" | "Octavos" | "Cuartos" | "Semis" | "Final";
export type Status = "active" | "eliminated" | "winner";

export interface Match {
  id: string;
  phase: Phase;
  rivalName: string;
  myScore: number;
  rivalScore: number;
  notes?: string;
  date: string; // ISO string
  result: "WIN" | "DRAW" | "LOSS";
}

export interface WorldCupState {
  id: string;
  phase: Phase;
  matches: Match[];
  points: number; // Relevant for Group stage
  status: Status;
  goalDiff: number;
}

export interface HistoryEntry extends WorldCupState {
  completedAt: string;
}

export type Screen = "dashboard" | "history" | "profile" | "gameover" | "celebration";
