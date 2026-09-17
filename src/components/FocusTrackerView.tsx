import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoreVertical, Edit2, Trash2, Plus, Timer } from 'lucide-react';
import { CalendarDayItem, FocusSessionItem } from '../types';

interface FocusTrackerViewProps {
  days: CalendarDayItem[];
  sessions: FocusSessionItem[];
  onToggleSession: (id: string) => void;
  onAddSession: () => void;
  onDeleteSession: (id: string) => void;
  onEditSessionTitle: (id: string, newTitle: string) => void;
  onDayClick: (dayNumber: number) => void;
  onStartTimer?: (session: FocusSessionItem) => void;
}

export const FocusTrackerView: React.FC<FocusTrackerViewProps> = ({
  days,
  sessions,
  onAddSession,
  onDeleteSession,
  onEditSessionTitle,
  onDayClick,
  onStartTimer
}) => {
  // Session deck state (last item is the FRONT active card)
  const [sessionDeck, setSessionDeck] = useState<FocusSessionItem[]>(sessions);

  // 3-dot dropdown menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  // Dragging state to prevent click conflict
  const [isDragging, setIsDragging] = useState(false);

  // Long-press holding state for opening Focus Timer (1 second hold with tactile effect)
  const [holdingSessionId, setHoldingSessionId] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const holdProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggered = useRef(false);

  // Audio feedback for holding tactile sensation
  const playHoldStartTick = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {}
  };

  const playHoldSuccessPop = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {}
  };

  const handlePointerDown = (session: FocusSessionItem) => {
    if (editingId) return;
    isLongPressTriggered.current = false;
    setHoldingSessionId(session.id);
    setHoldProgress(0);

    // Haptic tick & soft audio sensation on initial hold
    try {
      if (navigator.vibrate) navigator.vibrate(25);
    } catch {}
    playHoldStartTick();

    const startTime = Date.now();
    const duration = 1000; // 1 full second

    if (holdProgressIntervalRef.current) clearInterval(holdProgressIntervalRef.current);
    holdProgressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        if (holdProgressIntervalRef.current) clearInterval(holdProgressIntervalRef.current);
      }
    }, 25);

    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      setHoldingSessionId(null);
      setHoldProgress(0);
      if (holdProgressIntervalRef.current) clearInterval(holdProgressIntervalRef.current);

      try {
        if (navigator.vibrate) navigator.vibrate([40, 30, 60]);
      } catch {}
      playHoldSuccessPop();

      if (onStartTimer) {
        onStartTimer(session);
      }
    }, 1000);
  };

  const handlePointerUpOrLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (holdProgressIntervalRef.current) {
      clearInterval(holdProgressIntervalRef.current);
      holdProgressIntervalRef.current = null;
    }
    setHoldingSessionId(null);
    setHoldProgress(0);
  };

  useEffect(() => {
    setSessionDeck(sessions);
  }, [sessions]);

  // Close 3-dot menu on click outside
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Bring tapped card forward to front of deck
  const handleCardClick = (sessionId: string) => {
    if (editingId) return;
    setSessionDeck((prev) => {
      const targetIndex = prev.findIndex((s) => s.id === sessionId);
      if (targetIndex === -1) return prev;

      const isAlreadyFront = targetIndex === prev.length - 1;
      if (isAlreadyFront) {
        if (prev.length <= 1) return prev;
        const front = prev[prev.length - 1];
        const rest = prev.slice(0, prev.length - 1);
        return [front, ...rest];
      }

      const target = prev[targetIndex];
      const remaining = prev.filter((s) => s.id !== sessionId);
      return [...remaining, target];
    });
  };

  // Handle swipe-to-delete
  const handleSwipeDelete = (sessionId: string) => {
    onDeleteSession(sessionId);
  };

  // Save edited session title
  const handleSaveTitle = (sessionId: string) => {
    if (editTitleValue.trim()) {
      onEditSessionTitle(sessionId, editTitleValue.trim());
    }
    setEditingId(null);
  };

  const activeDay = days.find((d) => d.status === 'active');
  const loggedHoursToday = activeDay ? activeDay.hoursLogged : 0;

  return (
    <div className="flex flex-col px-6 pt-2 pb-28 min-h-full">
      {/* Hero Calendar Header */}
      <section className="relative">
        <div className="text-[110px] font-extrabold tracking-tighter text-[#141413] leading-[0.85] select-none">
          11
        </div>
        <div className="flex items-baseline justify-between pb-4 border-b border-black/10">
          <div>
            <h1 className="text-[26px] font-black uppercase tracking-tight text-[#141413] leading-none">
              FEBRUARY
            </h1>
            <p className="text-[19px] font-semibold text-[#141413]/55 tracking-tight mt-1 leading-none font-mono">
              2025
            </p>
          </div>
          <div className="text-[26px] font-semibold text-[#141413]/60 tracking-tight pr-1">
            Tue
          </div>
        </div>
      </section>

      {/* Focus Matrix Grid */}
      <section className="mt-4" data-purpose="circle-matrix-grid">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-2 text-center text-xs font-semibold text-[#141413]/40 mb-2.5 tracking-wider">
          <span>M</span>
          <span className="text-[#FF5722] font-bold">T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
          <span>S</span>
        </div>

        {/* Matrix Dots Grid */}
        <div className="grid grid-cols-7 gap-y-3 gap-x-2 place-items-center">
          {days.map((day, idx) => {
            if (day.status === 'blank') {
              return (
                <div
                  key={idx}
                  className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center text-[#141413]/30 text-xs font-mono"
                >
                  {day.dayNumber}
                </div>
              );
            }

            if (day.status === 'completed') {
              return (
                <button
                  key={idx}
                  id={`btn-calendar-day-${day.dayNumber}`}
                  onClick={() => onDayClick(day.dayNumber)}
                  className="w-10 h-10 rounded-full bg-[#141413] shadow-xs transition-transform active:scale-90 flex items-center justify-center text-white/50 text-[10px] font-mono hover:ring-2 hover:ring-black/30 cursor-pointer"
                  title={`Feb ${day.dayNumber}: ${day.hoursLogged} hrs logged`}
                >
                  <span className="opacity-0 hover:opacity-100 transition-opacity font-bold text-white">
                    {day.dayNumber}
                  </span>
                </button>
              );
            }

            if (day.status === 'active') {
              return (
                <button
                  key={idx}
                  id={`btn-calendar-day-${day.dayNumber}`}
                  onClick={() => onDayClick(day.dayNumber)}
                  className="w-10 h-10 rounded-full bg-[#FF5722] ring-4 ring-[#FF5722]/30 shadow-md flex items-center justify-center relative transition-transform active:scale-95 cursor-pointer"
                  title="Today: Active Focus Target"
                >
                  <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping absolute opacity-75" />
                  <span className="w-2.5 h-2.5 bg-white rounded-full relative" />
                </button>
              );
            }

            // Upcoming days
            return (
              <button
                key={idx}
                id={`btn-calendar-day-${day.dayNumber}`}
                onClick={() => onDayClick(day.dayNumber)}
                className="w-10 h-10 rounded-full bg-[#D5D4D0]/70 hover:bg-[#D5D4D0] transition-transform active:scale-90 flex items-center justify-center text-[#141413]/40 text-[11px] font-mono cursor-pointer"
                title={`Feb ${day.dayNumber}: Upcoming`}
              >
                {day.dayNumber}
              </button>
            );
          })}
        </div>
      </section>

      {/* Daily Focus Goal Badge */}
      <section className="mt-5 flex items-center justify-between px-3.5 py-2.5 bg-[#E6E5E1]/60 rounded-2xl border border-black/5">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5722] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#141413]/70">
            Daily Focus Goal
          </span>
        </div>
        <div className="text-xs font-bold text-[#141413] font-mono">
          {loggedHoursToday.toFixed(1)} <span className="text-[#141413]/40 font-normal">/ 6.0 hrs</span>
        </div>
      </section>

      {/* Logged Sessions Stacked Cards Deck (Just like First Page) */}
      <section className="mt-5 relative w-full flex-1 min-h-[380px] pb-6">
        {/* Header with count and Add action */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#141413]/70">
            Logged Sessions ({sessionDeck.length})
          </h2>
          <button
            id="btn-add-session-top"
            type="button"
            onClick={onAddSession}
            title="Add a new focus session"
            className="text-xs font-semibold text-[#FF5722] hover:underline flex items-center space-x-0.5 bg-[#FF5722]/10 px-2.5 py-1 rounded-full active:scale-95 cursor-pointer"
          >
            <Plus className="w-3 h-3 text-[#FF5722]" />
            <span>Add</span>
          </button>
        </div>

        {sessionDeck.length === 0 ? (
          /* Empty State */
          <div className="w-full h-56 rounded-[30px] border-2 border-dashed border-black/15 flex flex-col items-center justify-center p-6 text-center bg-black/2">
            <p className="text-base font-bold text-[#141413]">No sessions in stack</p>
            <p className="text-xs text-[#141413]/60 mt-1">Tap below or use + to start your first focus session</p>
            <button
              id="btn-empty-add-session"
              type="button"
              onClick={onAddSession}
              className="mt-4 px-4 py-2 rounded-full bg-[#141413] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Session</span>
            </button>
          </div>
        ) : (
          <div className="relative w-full h-[360px]">
            <AnimatePresence mode="popLayout">
              {sessionDeck.map((session, index) => {
                const isFront = index === sessionDeck.length - 1;
                const topOffset = index * 40;
                const zIndex = 10 + index;
                const cardColor = session.color || '#9BB8A7';
                const timeText = session.timeRange
                  ? `${session.timeRange} • ${session.duration}`
                  : session.duration;

                const isBeingHeld = holdingSessionId === session.id;

                return (
                  <motion.article
                    key={session.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      y: isBeingHeld ? 6 : 0,
                      scale: isBeingHeld ? 0.94 : isFront ? 1.01 : 1,
                      x: 0,
                      transition: isBeingHeld
                        ? { duration: 0.12, ease: 'easeOut' }
                        : { type: 'spring', damping: 25, stiffness: 260 }
                    }}
                    exit={{
                      opacity: 0,
                      x: 350,
                      scale: 0.85,
                      transition: { duration: 0.22, ease: 'easeOut' }
                    }}
                    // Drag / Swipe support
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.8}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={(_e, info) => {
                      setTimeout(() => setIsDragging(false), 50);
                      if (Math.abs(info.offset.x) > 75 || Math.abs(info.velocity.x) > 350) {
                        handleSwipeDelete(session.id);
                      }
                    }}
                    onPointerDown={() => handlePointerDown(session)}
                    onPointerUp={handlePointerUpOrLeave}
                    onPointerLeave={handlePointerUpOrLeave}
                    onPointerCancel={handlePointerUpOrLeave}
                    onClick={() => {
                      if (isLongPressTriggered.current) {
                        isLongPressTriggered.current = false;
                        return;
                      }
                      if (!isDragging && !editingId) {
                        handleCardClick(session.id);
                      }
                    }}
                    style={{
                      backgroundColor: cardColor,
                      top: `${topOffset}px`,
                      zIndex: isBeingHeld ? 99 : zIndex
                    }}
                    className={`absolute inset-x-0 rounded-[30px] p-6 select-none cursor-grab active:cursor-grabbing transition-all duration-150 ${
                      isBeingHeld
                        ? 'min-h-[210px] shadow-[0_4px_16px_rgba(0,0,0,0.28)] ring-4 ring-black/30 brightness-95'
                        : isFront
                        ? 'min-h-[200px] shadow-[0_-4px_20px_rgba(0,0,0,0.08),0_14px_36px_rgba(0,0,0,0.18)] ring-1 ring-black/10'
                        : 'h-40 shadow-[0_-4px_14px_rgba(0,0,0,0.05),0_6px_16px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    {/* Top Row: Title + 3-Dot Button ONLY */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-3">
                        {editingId === session.id ? (
                          /* Inline Edit Mode */
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSaveTitle(session.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full space-y-2"
                          >
                            <input
                              id={`input-edit-session-title-${session.id}`}
                              type="text"
                              value={editTitleValue}
                              onChange={(e) => setEditTitleValue(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="w-full bg-white/95 text-[#141413] text-xl font-bold px-3 py-1.5 rounded-xl border border-black/20 focus:outline-none focus:ring-2 focus:ring-[#141413]"
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                id={`btn-save-session-title-${session.id}`}
                                type="submit"
                                className="text-xs font-bold bg-[#141413] text-white px-3.5 py-1.5 rounded-full shadow-xs active:scale-95 cursor-pointer"
                              >
                                Save Title
                              </button>
                              <button
                                id={`btn-cancel-session-title-${session.id}`}
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="text-xs font-semibold text-[#141413]/70 hover:text-[#141413] px-2 py-1 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            {/* Title (Text Only) */}
                            <h3 className="text-2xl font-black text-[#141413] tracking-tight leading-snug">
                              {session.title}
                            </h3>
                            {/* Time & Duration (Text Only) */}
                            <p className="text-sm font-semibold text-[#141413]/70 font-mono mt-1.5">
                              {timeText}
                            </p>
                          </>
                        )}
                      </div>

                      {/* 3-Dot Menu Button - The ONLY button inside the card */}
                      <div className="relative shrink-0">
                        <button
                          id={`btn-session-more-${session.id}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId((prev) => (prev === session.id ? null : session.id));
                          }}
                          title="Session Options"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#141413]/70 hover:text-[#141413] hover:bg-black/10 active:scale-95 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === session.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-9 z-50 bg-[#F5F4F0] text-[#141413] rounded-2xl shadow-xl border border-black/10 py-1.5 min-w-[145px]"
                          >
                            <button
                              id={`btn-session-menu-timer-${session.id}`}
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onStartTimer?.(session);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-bold hover:bg-black/5 flex items-center space-x-2 transition-colors cursor-pointer text-[#FF5722]"
                            >
                              <Timer className="w-3.5 h-3.5" />
                              <span>Focus Timer</span>
                            </button>
                            <button
                              id={`btn-session-menu-edit-${session.id}`}
                              type="button"
                              onClick={() => {
                                setEditingId(session.id);
                                setEditTitleValue(session.title);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-bold hover:bg-black/5 flex items-center space-x-2 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#141413]" />
                              <span>Edit Title</span>
                            </button>
                            <button
                              id={`btn-session-menu-delete-${session.id}`}
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onDeleteSession(session.id);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tactile 1-Second Hold Sensation Bar */}
                    {isBeingHeld && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 pt-2.5 border-t border-black/15"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#141413]/80 mb-1">
                          <span className="flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-ping" />
                            <span>Opening Focus Timer...</span>
                          </span>
                          <span>{Math.round(holdProgress)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#141413] rounded-full transition-all duration-75 ease-out"
                            style={{ width: `${holdProgress}%` }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {sessionDeck.length > 0 && (
          <p className="text-[11px] text-center text-[#141413]/50 mt-4 font-mono flex items-center justify-center space-x-1">
            <span>Swipe to delete • Tap to cycle • Hold (1s) for Focus Timer</span>
          </p>
        )}
      </section>
    </div>
  );
};
