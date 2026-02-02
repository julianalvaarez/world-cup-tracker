import React, { useState } from 'react';
import { WorldCupState, Match, Phase } from '../types';
import { MatchForm } from '../components/MatchForm';

interface DashboardProps {
    state: WorldCupState;
    onMatchSave: (match: Omit<Match, 'result' | 'phase'> & { id?: string }) => void;
    onOpenHistory: () => void;
    onOpenProfile: () => void;
}

interface PhaseStepProps {
    active: boolean;
    label: string;
    current: boolean;
    passed: boolean;
}

const PhaseStep: React.FC<PhaseStepProps> = ({ active, label, current, passed }) => {
    let bgClass = "bg-slate-300 dark:bg-slate-700";
    if (active || passed) bgClass = "bg-primary";

    return (
        <div className="relative flex flex-col items-center gap-1 z-10">
            <div className={`h-3 w-3 rounded-full transition-all duration-300 ${bgClass} ${current ? 'ring-4 ring-primary/20 scale-125' : ''}`}></div>
            <span className={`text-[10px] font-bold uppercase transition-colors ${active || passed ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                {label}
            </span>
        </div>
    );
};

const phases: Phase[] = ["Grupos", "Octavos", "Cuartos", "Semis", "Final"];

export const Dashboard: React.FC<DashboardProps> = ({ state, onMatchSave, onOpenProfile }) => {
    const [isFormOpen, setFormOpen] = useState(false);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);

    const currentPhaseIndex = phases.indexOf(state.phase);

    const handleEdit = (match: Match) => {
        setEditingMatch(match);
        setFormOpen(true);
    };

    const handleNewMatch = () => {
        setEditingMatch(null);
        setFormOpen(true);
    };

    const canAddMatch = () => {
        if (state.status !== 'active') return false;
        if (state.phase === 'Grupos') {
            const groupMatches = state.matches.filter(m => m.phase === 'Grupos');
            return groupMatches.length < 3;
        }
        return true;
    };

    return (
        <div className="flex flex-col min-h-full pb-20">
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#1c1022]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center p-4 pb-2 justify-between max-w-md mx-auto">
                    <div className="text-primary flex size-10 shrink-0 items-center justify-center">
                        <span className="material-symbols-outlined text-3xl">emoji_events</span>
                    </div>
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center">Mundial PLM</h2>
                    <div className="flex w-10 items-center justify-end">
                        <button
                            onClick={onOpenProfile}
                            className="size-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-white/20 transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-sm text-slate-700 dark:text-white">person</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto">
                {/* Progress Bar */}
                <div className="px-4 py-6">
                    <div className="relative flex items-center justify-between">
                        {/* Background Line */}
                        <div className="absolute top-[6px] left-0 w-full h-0.5 bg-slate-200 dark:bg-white/10"></div>
                        {/* Active Line - Calculated width based on phase */}
                        <div
                            className="absolute top-[6px] left-0 h-0.5 bg-primary transition-all duration-500"
                            style={{ width: `${(currentPhaseIndex / (phases.length - 1)) * 100}%` }}
                        ></div>

                        {phases.map((p, idx) => (
                            <PhaseStep
                                key={p}
                                label={p}
                                active={p === state.phase}
                                current={p === state.phase}
                                passed={idx < currentPhaseIndex}
                            />
                        ))}
                    </div>
                </div>

                {/* Stats Card */}
                <div className="px-4 mb-6">
                    <div className="bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-xl p-5 relative overflow-hidden shadow-lg shadow-primary/5">
                        <div className="absolute -right-4 -top-4 text-primary/10 select-none pointer-events-none">
                            <span className="material-symbols-outlined text-[140px]">sports_soccer</span>
                        </div>
                        <h3 className="text-primary text-sm font-bold uppercase tracking-wider mb-4 relative z-10">
                            Current Phase: <span className="text-slate-900 dark:text-white">{state.phase}</span>
                        </h3>
                        <div className="flex gap-8 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Points</span>
                                <span className="text-slate-900 dark:text-white text-3xl font-bold">{state.points}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Played</span>
                                <span className="text-slate-900 dark:text-white text-3xl font-bold">{state.matches ? state.matches.length : 0}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Diff</span>
                                <span className="text-slate-900 dark:text-white text-3xl font-bold">
                                    {state.goalDiff > 0 ? '+' : ''}{state.goalDiff}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Matches List */}
                <div className="px-4 flex items-center justify-between mb-3">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">Recent Matches</h3>
                </div>

                <div className="flex flex-col gap-3 px-4 pb-20">
                    {state?.matches?.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <span className="material-symbols-outlined text-4xl mb-2">sports_soccer</span>
                            <p>No hay partidos aún. ¡Empieza tu camino!</p>
                        </div>
                    ) : (
                        state?.matches?.map((match) => (
                            <div key={match.id} className="flex flex-col gap-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 p-4 shadow-sm animate-fade-in">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                                            {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {match.phase}
                                        </p>
                                        <p className="text-slate-900 dark:text-white text-base font-bold leading-tight truncate max-w-[200px]">
                                            vs {match.rivalName}
                                        </p>
                                    </div>
                                    <div className="text-right whitespace-nowrap">
                                        <p className="text-primary text-xl font-black">{match.myScore} - {match.rivalScore}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase ${match.result === 'WIN' ? 'bg-green-500/10 text-green-500' :
                                        match.result === 'DRAW' ? 'bg-yellow-500/10 text-yellow-500' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                        {match.result}
                                    </span>
                                    <button
                                        onClick={() => handleEdit(match)}
                                        className="flex items-center justify-center rounded-lg h-8 px-3 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 gap-1.5 text-xs font-bold transition-colors hover:bg-primary/20 hover:text-primary"
                                    >
                                        <span className="material-symbols-outlined text-base">edit</span>
                                        <span>Edit</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {canAddMatch() && (
                <button
                    onClick={handleNewMatch}
                    className="fixed right-6 bottom-24 z-40 size-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
                >
                    <span className="material-symbols-outlined text-3xl">add</span>
                </button>
            )}

            <MatchForm
                isOpen={isFormOpen}
                onClose={() => setFormOpen(false)}
                onSave={onMatchSave}
                initialData={editingMatch}
            />
        </div>
    );
};