import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Pause, RotateCcw, CheckCircle2, Volume2, Sparkles } from 'lucide-react';
import { FocusSessionItem } from '../types';

interface FocusTimerViewProps {
  session: FocusSessionItem;
  onClose: () => void;
  onToast: (msg: string) => void;
  onCompleteSession?: (sessionId: string) => void;
}

type TimerMode = 'pomodoro' | 'plain';
type PomodoroPhase = 'focus' | 'break';

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  session,
  onClose,
  onToast,
  onCompleteSession
}) => {
  // Timer Modes: Pomodoro vs Plain Method
  const [mode, setMode] = useState<TimerMode>('plain');

  // Plain mode durations: 25, 30, 45, 50, 60 minutes
  const [plainDurationMinutes, setPlainDurationMinutes] = useState<number>(() => {
    if (session.durationMinutes && [25, 30, 45, 50, 60].includes(session.durationMinutes)) {
      return session.durationMinutes;
    }
    return 30;
  });

  // Pomodoro Phase & Cycle count
  const [pomoPhase, setPomoPhase] = useState<PomodoroPhase>('focus');
  const [pomoCycle, setPomoCycle] = useState<number>(1);

  // Active duration in seconds
  const currentTotalSeconds =
    mode === 'pomodoro'
      ? pomoPhase === 'focus'
        ? 25 * 60
        : 5 * 60
      : plainDurationMinutes * 60;

  const [secondsRemaining, setSecondsRemaining] = useState<number>(currentTotalSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Sound chime helper
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.7);
    } catch {
      // Audio not permitted or running headless
    }
  };

  // Reset timer when mode or duration changes
  useEffect(() => {
    setIsRunning(false);
    setSecondsRemaining(currentTotalSeconds);
  }, [mode, plainDurationMinutes, pomoPhase]);

  // Main countdown timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setIsRunning(false);
            playChime();

            if (mode === 'pomodoro') {
              if (pomoPhase === 'focus') {
                onToast('Focus sprint complete! Take a 5-minute break.');
                setPomoPhase('break');
              } else {
                onToast('Break over! Ready for the next focus sprint.');
                setPomoPhase('focus');
                setPomoCycle((c) => c + 1);
              }
            } else {
              onToast(`Focus session complete: ${session.title}`);
              if (onCompleteSession) {
                onCompleteSession(session.id);
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, mode, pomoPhase, session.title, onToast, onCompleteSession, session.id]);

  // Calculations for visual square matrix of dots
  const totalMinutes =
    mode === 'pomodoro'
      ? pomoPhase === 'focus'
        ? 25
        : 5
      : plainDurationMinutes;

  const elapsedSeconds = currentTotalSeconds - secondsRemaining;
  const elapsedMinutes = Math.min(totalMinutes, Math.floor(elapsedSeconds / 60));

  // Determine grid columns to form a neat square
  const getGridCols = (mins: number) => {
    if (mins <= 5) return 5;
    if (mins <= 16) return 4;
    if (mins <= 25) return 5; // 5x5 square
    if (mins <= 30) return 6; // 6x5 rectangle in square container
    if (mins <= 36) return 6; // 6x6 square
    if (mins <= 49) return 7; // 7x7 square
    if (mins === 50) return 10; // 10x5 grid in square container
    return 8;
  };

  const gridCols = getGridCols(totalMinutes);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleRunning = () => {
    if (!isRunning) {
      playChime();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(currentTotalSeconds);
  };

  return (
    <div className="flex flex-col px-6 pt-2 pb-24 min-h-full bg-[#F5F4F0] select-none">
      {/* Top Bar: Back button and Session Badge */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="btn-timer-back"
          type="button"
          onClick={onClose}
          className="flex items-center space-x-1 text-xs font-bold text-[#141413]/70 hover:text-[#141413] px-2.5 py-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        <div className="flex items-center space-x-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: session.color || '#9BB8A7' }}
          />
          <span className="text-xs font-semibold text-[#141413]/70 truncate max-w-[170px]">
            {session.title}
          </span>
        </div>
      </div>

      {/* Mode Switcher Pill (Pomodoro vs Plain Method) */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-1 bg-[#141413]/5 p-1 rounded-full">
          <button
            id="tab-mode-pomodoro"
            type="button"
            onClick={() => setMode('pomodoro')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-[#141413] text-white shadow-xs'
                : 'text-[#141413]/70 hover:text-[#141413]'
            }`}
          >
            Pomodoro
          </button>
          <button
            id="tab-mode-plain"
            type="button"
            onClick={() => setMode('plain')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              mode === 'plain'
                ? 'bg-[#141413] text-white shadow-xs'
                : 'text-[#141413]/70 hover:text-[#141413]'
            }`}
          >
            Plain Method
          </button>
        </div>
      </div>

      {/* Mode Specific Sub-Controls */}
      {mode === 'pomodoro' ? (
        <div className="flex items-center justify-center space-x-2 mb-5">
          <button
            id="btn-pomo-focus"
            type="button"
            onClick={() => setPomoPhase('focus')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              pomoPhase === 'focus'
                ? 'bg-[#FF5722] text-white shadow-xs'
                : 'bg-black/5 text-[#141413]/60 hover:text-[#141413]'
            }`}
          >
            Focus (25m)
          </button>
          <button
            id="btn-pomo-break"
            type="button"
            onClick={() => setPomoPhase('break')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              pomoPhase === 'break'
                ? 'bg-[#9BB8A7] text-[#141413] shadow-xs'
                : 'bg-black/5 text-[#141413]/60 hover:text-[#141413]'
            }`}
          >
            Break (5m)
          </button>
          <span className="text-[11px] font-mono text-[#141413]/50 ml-1">
            Cycle #{pomoCycle}
          </span>
        </div>
      ) : (
        /* Plain Method Preset Selection (25m, 30m, 45m, 50m, 60m) */
        <div className="flex items-center justify-center space-x-1.5 mb-5 overflow-x-auto py-1">
          {[25, 30, 45, 50, 60].map((mins) => (
            <button
              key={mins}
              id={`btn-preset-${mins}m`}
              type="button"
              onClick={() => setPlainDurationMinutes(mins)}
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                plainDurationMinutes === mins
                  ? 'bg-[#141413] text-white shadow-xs'
                  : 'bg-black/5 text-[#141413]/60 hover:text-[#141413]'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      )}

      {/* VISUAL TIME: Square with dots filled in duration */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div
          className="w-[260px] h-[260px] max-w-full rounded-[32px] bg-white p-6 shadow-sm border border-black/5 flex flex-col justify-center items-center relative"
          style={{ aspectRatio: '1 / 1' }}
        >
          {/* Square Grid of Dots */}
          <div
            className="grid gap-2.5 place-items-center"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`
            }}
          >
            {Array.from({ length: totalMinutes }).map((_, i) => {
              const isFilled = i < elapsedMinutes;
              const isCurrent = i === elapsedMinutes && isRunning;

              return (
                <div
                  key={i}
                  title={`Minute ${i + 1}`}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                    isFilled
                      ? 'bg-[#141413] scale-100 shadow-2xs'
                      : isCurrent
                      ? 'bg-[#FF5722] scale-110 ring-4 ring-[#FF5722]/30 animate-pulse'
                      : 'bg-black/15 scale-90'
                  }`}
                />
              );
            })}
          </div>

          {/* Dots Square Legend / Status */}
          <div className="absolute bottom-3 text-[10px] font-mono font-semibold text-[#141413]/40 tracking-wider">
            {elapsedMinutes} / {totalMinutes} MIN ELAPSED
          </div>
        </div>

        {/* Digital Time Countdown */}
        <div className="text-center mt-6">
          <div className="text-5xl font-mono font-black text-[#141413] tracking-tighter">
            {formatTime(secondsRemaining)}
          </div>
          <p className="text-xs font-semibold text-[#141413]/50 uppercase tracking-widest mt-1">
            {mode === 'pomodoro'
              ? pomoPhase === 'focus'
                ? 'Pomodoro Focus'
                : 'Rest Break'
              : `${plainDurationMinutes} Minute Focus`}
          </p>
        </div>
      </div>

      {/* Main Action Controls */}
      <div className="flex items-center justify-center space-x-4 mt-8">
        <button
          id="btn-timer-reset"
          type="button"
          onClick={handleReset}
          title="Reset timer"
          className="w-12 h-12 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#141413]/70 hover:text-[#141413] transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          id="btn-timer-play-pause"
          type="button"
          onClick={handleToggleRunning}
          className={`w-18 h-18 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer ${
            isRunning
              ? 'bg-[#FF5722] text-white hover:bg-[#F4511E]'
              : 'bg-[#141413] text-white hover:bg-[#2A2A28]'
          }`}
        >
          {isRunning ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current ml-1" />
          )}
        </button>

        <button
          id="btn-timer-complete"
          type="button"
          onClick={() => {
            playChime();
            onToast(`Marked focus block complete: ${session.title}`);
            if (onCompleteSession) {
              onCompleteSession(session.id);
            }
            onClose();
          }}
          title="Complete session early"
          className="w-12 h-12 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-emerald-700 hover:text-emerald-800 transition-all active:scale-95 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
