import React, { useState, useEffect } from 'react';
import { Match, Phase } from '../types';

interface MatchFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (matchData: Omit<Match, 'result' | 'phase'> & { id?: string }) => void;
  initialData?: Match | null;
}

export const MatchForm: React.FC<MatchFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [rivalName, setRivalName] = useState('');
  const [myScore, setMyScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setRivalName(initialData.rivalName);
        setMyScore(initialData.myScore);
        setRivalScore(initialData.rivalScore);
        setNotes(initialData.notes || '');
      } else {
        setRivalName('');
        setMyScore(0);
        setRivalScore(0);
        setNotes('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!rivalName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        rivalName,
        myScore,
        rivalScore,
        notes,
        date: initialData?.date || new Date().toISOString()
      });
      onClose();
    } catch (error) {
      console.error("Match save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ScorePicker = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="flex-1 flex flex-col">
      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2 text-center">{label}</p>
      <div className="flex items-center justify-between border border-gray-300 dark:border-[#4c3b54] rounded-lg overflow-hidden bg-white dark:bg-[#231b27] h-14">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-primary active:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined">remove</span>
        </button>
        <span className="text-xl font-bold text-gray-900 dark:text-white">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-primary active:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Content */}
      <div className="relative w-full max-w-md bg-background-light dark:bg-[#1c1022] rounded-t-xl sm:rounded-xl max-h-[92vh] overflow-y-auto animate-slide-up shadow-2xl">

        {/* Handle for mobile feel */}
        <div className="flex h-6 w-full items-center justify-center pt-2">
          <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-[#4c3b54]"></div>
        </div>

        {/* Header */}
        <div className="flex items-center p-4 pb-2 justify-between">
          <button onClick={onClose} className="text-gray-800 dark:text-white flex size-12 shrink-0 items-center justify-start">
            <span className="material-symbols-outlined cursor-pointer">close</span>
          </button>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center">
            {initialData ? 'Edit Match' : 'Add Match'}
          </h2>
          <div className="flex w-12 items-center justify-end">
            <button
              onClick={() => { setRivalName(''); setMyScore(0); setRivalScore(0); setNotes(''); }}
              className="text-primary text-base font-bold shrink-0 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-2 pb-8">
          {/* Rival Name */}
          <div className="flex flex-col gap-4 px-4 py-3">
            <label className="flex flex-col flex-1">
              <p className="text-gray-900 dark:text-white text-base font-medium leading-normal pb-2">Rival Name</p>
              <input
                value={rivalName}
                onChange={(e) => setRivalName(e.target.value)}
                className="flex w-full min-w-0 flex-1 rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border border-gray-300 dark:border-[#4c3b54] bg-white dark:bg-[#231b27] focus:border-primary h-14 placeholder:text-gray-400 dark:placeholder:text-[#b09cba] px-4 text-base"
                placeholder="Enter country name..."
              />
            </label>
          </div>

          <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight px-4 pb-2 pt-2">Match Score</h3>

          <div className="flex px-4 gap-4">
            <ScorePicker label="My Goals" value={myScore} onChange={setMyScore} />
            <ScorePicker label="Rival Goals" value={rivalScore} onChange={setRivalScore} />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-4 px-4 py-3">
            <label className="flex flex-col flex-1">
              <p className="text-gray-900 dark:text-white text-base font-medium leading-normal pb-2">Notes</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex w-full min-w-0 flex-1 rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border border-gray-300 dark:border-[#4c3b54] bg-white dark:bg-[#231b27] focus:border-primary h-32 placeholder:text-gray-400 dark:placeholder:text-[#b09cba] p-4 text-base resize-none"
                placeholder="Add match details, player performances..."
              />
            </label>
          </div>

          {/* Save Button */}
          <div className="px-4 py-4">
            <button
              onClick={handleSubmit}
              className="flex w-full items-center justify-center h-14 bg-primary text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!rivalName.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                'Guardar Partido'
              )}
            </button>
          </div>

          <div className="h-4 sm:h-0"></div>
        </div>
      </div>
    </div>
  );
};
