import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ArrowDown, Plus, MoreVertical, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { HorizonMilestone } from '../types';

interface GoalsHorizonViewProps {
  milestones: HorizonMilestone[];
  onToggleMilestone: (id: string) => void;
  onAddMilestone: () => void;
  onDeleteMilestone: (id: string) => void;
  onEditMilestone: (id: string, updates: Partial<HorizonMilestone>) => void;
  subTab?: 'orbit' | 'cards';
  onSelectSubTab?: (tab: 'orbit' | 'cards') => void;
}

export const GoalsHorizonView: React.FC<GoalsHorizonViewProps> = ({
  milestones,
  onToggleMilestone,
  onAddMilestone,
  onDeleteMilestone,
  onEditMilestone,
  subTab = 'orbit',
  onSelectSubTab
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const deckRef = useRef<HTMLDivElement | null>(null);

  // Deck state (last item is FRONT card in stack, matching DailyStack and FocusTracker)
  const [milestoneDeck, setMilestoneDeck] = useState<HorizonMilestone[]>(milestones);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Editing state for in-card editing of Title, Date, Percent, Category
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPercent, setEditPercent] = useState<number>(0);
  const [editCategory, setEditCategory] = useState('');

  useEffect(() => {
    setMilestoneDeck(milestones);
  }, [milestones]);

  // Dynamic overall progress percent calculated accurately from milestones
  const completedCount = milestones.filter((m) => m.completed).length;
  const overallProgressPercent = milestones.length > 0
    ? Math.round(
        milestones.reduce((acc, m) => acc + (m.completed ? 100 : (m.progressPercent ?? 0)), 0) /
          milestones.length
      )
    : 0;

  // Real days remaining calculation until end of 2027 Horizon (Dec 31, 2027)
  const targetYear = 2026;
  const targetDate = new Date(`${targetYear}-12-31T23:59:59`);
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Render high-res stippled concentric dots orbit
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 2;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Orbital Rings Specifications: Radii & Dot counts
    const ringSpecs = [
      { radius: 64, count: 24, size: 3.2, activeCount: 24 }, // Bold inner circle
      { radius: 95, count: 32, size: 2.3, activeCount: Math.round((overallProgressPercent / 100) * 32) }, // Progressive orbit
      { radius: 125, count: 40, size: 1.8, activeCount: 0 },
      { radius: 155, count: 48, size: 1.5, activeCount: 0 },
      { radius: 185, count: 56, size: 1.3, activeCount: 0 },
      { radius: 215, count: 64, size: 1.1, activeCount: 0 },
      { radius: 245, count: 72, size: 0.9, activeCount: 0 } // Outer orbit
    ];

    ringSpecs.forEach((ring, index) => {
      const angleStep = (Math.PI * 2) / ring.count;

      for (let i = 0; i < ring.count; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + ring.radius * (dpr > 1 ? 1 : 1) * Math.cos(angle);
        const y = centerY + ring.radius * (dpr > 1 ? 1 : 1) * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(x, y, ring.size * dpr * 0.8, 0, Math.PI * 2);

        if (index === 0) {
          // Core milestone circle
          ctx.fillStyle = '#141413';
          ctx.fill();
        } else if (index === 1 && i < ring.activeCount) {
          // Currently progressing active dots
          ctx.fillStyle = i === ring.activeCount - 1 ? '#FF5722' : '#141413';
          ctx.fill();

          // Highlighted current active dot outer aura
          if (i === ring.activeCount - 1) {
            ctx.beginPath();
            ctx.arc(x, y, (ring.size + 3) * dpr, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 87, 34, 0.35)';
            ctx.lineWidth = 1.5 * dpr;
            ctx.stroke();
          }
        } else {
          // Subtle stippled dots
          const opacity = Math.max(0.12, 0.42 - index * 0.05);
          ctx.fillStyle = `rgba(20, 20, 19, ${opacity})`;
          ctx.fill();
        }
      }
    });
  }, [overallProgressPercent]);

  // Card interaction: Tapping background brings to front, tapping front cycles to back
  const handleCardClick = (milestoneId: string) => {
    if (editingId) return;
    const clickedIndex = milestoneDeck.findIndex((m) => m.id === milestoneId);
    if (clickedIndex === -1) return;

    if (clickedIndex === milestoneDeck.length - 1) {
      // Front card clicked: cycle it to back
      const front = milestoneDeck[clickedIndex];
      const rest = milestoneDeck.slice(0, clickedIndex);
      setMilestoneDeck([front, ...rest]);
    } else {
      // Background card clicked: bring to front
      const clicked = milestoneDeck[clickedIndex];
      const filtered = milestoneDeck.filter((_, idx) => idx !== clickedIndex);
      setMilestoneDeck([...filtered, clicked]);
    }
  };

  // Swipe delete handler
  const handleSwipeDelete = (milestoneId: string) => {
    setMilestoneDeck((prev) => prev.filter((m) => m.id !== milestoneId));
    onDeleteMilestone(milestoneId);
  };

  // Start editing milestone
  const handleStartEdit = (milestone: HorizonMilestone) => {
    setEditingId(milestone.id);
    setEditTitle(milestone.title);
    setEditDate(milestone.dateLabel);
    setEditPercent(milestone.progressPercent ?? (milestone.completed ? 100 : 0));
    setEditCategory(milestone.category);
    setOpenMenuId(null);
  };

  // Save milestone edits
  const handleSaveEdit = (e: React.FormEvent, milestoneId: string) => {
    e.preventDefault();
    const cleanTitle = editTitle.trim();
    if (!cleanTitle) return;

    const clampedPercent = Math.min(100, Math.max(0, Number(editPercent) || 0));
    onEditMilestone(milestoneId, {
      title: cleanTitle,
      dateLabel: editDate.trim() || '2026',
      progressPercent: clampedPercent,
      category: editCategory.trim() || 'Horizon Milestone',
      completed: clampedPercent === 100
    });

    setEditingId(null);
  };

  const scrollToDeck = () => {
    onSelectSubTab?.('cards');
    deckRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col px-6 pt-2 pb-28 min-h-full">
      {/* Header Navigation Bar */}
      <section className="flex items-center justify-between pt-1">
        <button
          type="button"
          className="group flex items-center space-x-1.5 focus:outline-none"
        >
          <h1 className="text-2xl font-bold tracking-tight text-[#141413]">Goals 2027</h1>
          <ChevronDown className="w-4 h-4 text-[#141413]/50 group-hover:text-[#141413] transition-colors" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 bg-[#141413]/5 text-[#141413]/70 rounded-full font-mono">
            3Y Horizon
          </span>
          <button
            id="btn-add-milestone-header"
            onClick={onAddMilestone}
            aria-label="Add Milestone"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#141413]/5 hover:bg-[#141413]/10 text-[#141413] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Central Orbit Graphic */}
      <section className="relative w-full aspect-square max-w-[270px] mx-auto my-3 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={540}
          height={540}
          className="w-full h-full"
          data-purpose="orbital-constellation-canvas"
        />

        {/* Inner center status indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-[#141413] ring-4 ring-[#F6F5F1]" />
        </div>
      </section>

      {/* Dynamic Percent & Real Date Left Metrics */}
      <section className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-6xl font-extrabold tracking-tight text-[#141413] font-sans">
            {overallProgressPercent}%
          </span>
          <span className="text-xl font-medium text-[#141413]/40 font-mono">
            / {daysLeft.toLocaleString()}d left
          </span>
        </div>
        <p className="text-xs font-normal text-[#141413]/60 mt-1 tracking-tight">
          of horizon reached <span className="mx-1">•</span> {completedCount} of {milestones.length} milestones finished
        </p>

        {/* Smooth Scroll Button */}
        <div className="pt-3 flex justify-center">
          <button
            onClick={scrollToDeck}
            className="group inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-xs font-medium text-[#141413]/80 shadow-xs border border-black/5 transition active:scale-95 cursor-pointer"
          >
            <span>View Milestone Stack</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#141413]/40 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* STACKED MILESTONE CARDS DECK */}
      <section ref={deckRef} className="pt-4 pb-4 flex flex-col justify-start">
        <div className="flex items-center justify-between px-1 mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#141413]">Active Milestones</h2>
            <p className="text-xs text-[#141413]/55 font-mono">
              {milestoneDeck.length} targets tracked
            </p>
          </div>
          <button
            id="btn-add-milestone-deck"
            type="button"
            onClick={onAddMilestone}
            className="text-xs font-bold text-[#FF5722] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>
        </div>

        {/* Empty State */}
        {milestoneDeck.length === 0 ? (
          <div className="rounded-[30px] border border-dashed border-black/20 p-8 text-center bg-black/5">
            <p className="text-sm font-semibold text-[#141413]/70 mb-2">No milestones in horizon stack</p>
            <button
              type="button"
              onClick={onAddMilestone}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#141413] text-white text-xs font-bold shadow-xs active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Milestone</span>
            </button>
          </div>
        ) : (
          <div className="relative w-full h-[370px]">
            <AnimatePresence mode="popLayout">
              {milestoneDeck.map((milestone, index) => {
                const isFront = index === milestoneDeck.length - 1;
                const topOffset = index * 42;
                const zIndex = 10 + index;
                const cardColor = milestone.color || '#9BB8A7';
                const isEditing = editingId === milestone.id;

                return (
                  <motion.article
                    key={milestone.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isFront ? 1.01 : 1,
                      x: 0,
                      transition: { type: 'spring', damping: 25, stiffness: 260 }
                    }}
                    exit={{
                      opacity: 0,
                      x: 350,
                      scale: 0.85,
                      transition: { duration: 0.22, ease: 'easeOut' }
                    }}
                    // Horizontal swipe to delete
                    drag={isEditing ? false : 'x'}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.8}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={(_e, info) => {
                      setTimeout(() => setIsDragging(false), 50);
                      if (Math.abs(info.offset.x) > 75 || Math.abs(info.velocity.x) > 350) {
                        handleSwipeDelete(milestone.id);
                      }
                    }}
                    onClick={() => {
                      if (!isDragging && !isEditing) {
                        handleCardClick(milestone.id);
                      }
                    }}
                    style={{
                      backgroundColor: cardColor,
                      top: `${topOffset}px`,
                      zIndex: isEditing ? 90 : zIndex
                    }}
                    className={`absolute inset-x-0 rounded-[30px] p-6 select-none cursor-grab active:cursor-grabbing transition-shadow duration-200 ${
                      isFront
                        ? 'min-h-[210px] shadow-[0_-4px_20px_rgba(0,0,0,0.08),0_14px_36px_rgba(0,0,0,0.18)] ring-1 ring-black/10'
                        : 'h-42 shadow-[0_-4px_14px_rgba(0,0,0,0.05),0_6px_16px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    {isEditing ? (
                      /* Inline Milestone Editing Form */
                      <form
                        onSubmit={(e) => handleSaveEdit(e, milestone.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-col space-y-3"
                      >
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#141413]/60 mb-0.5 block">
                            Milestone Title
                          </label>
                          <input
                            type="text"
                            required
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            autoFocus
                            className="w-full bg-white/95 text-[#141413] text-base font-bold px-3 py-1.5 rounded-xl border border-black/20 focus:outline-none focus:ring-2 focus:ring-[#141413]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#141413]/60 mb-0.5 block">
                              Target Date
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Oct 2026"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full bg-white/95 text-[#141413] text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-black/20 focus:outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#141413]/60 mb-0.5 block">
                              Progress (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              required
                              value={editPercent}
                              onChange={(e) => setEditPercent(Number(e.target.value))}
                              className="w-full bg-white/95 text-[#141413] text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-black/20 focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#141413]/60 mb-0.5 block">
                            Category
                          </label>
                          <input
                            type="text"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full bg-white/95 text-[#141413] text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-black/20 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            id={`btn-save-milestone-${milestone.id}`}
                            type="submit"
                            className="text-xs font-bold bg-[#141413] text-white px-4 py-1.5 rounded-full shadow-xs active:scale-95 cursor-pointer"
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-xs font-semibold text-[#141413]/70 hover:text-[#141413] px-2 py-1 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Card Display - Text Only with 3-dot Menu */
                      <div className="flex flex-col h-full justify-between">
                        {/* Top Meta Row */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/70 font-mono">
                            {milestone.category}
                          </span>

                          <div className="flex items-center space-x-2">
                            {/* Target Date Pill (Text Only) */}
                            <span className="text-[11px] font-bold text-[#141413]/80 bg-black/10 px-2.5 py-0.5 rounded-full font-mono">
                              {milestone.dateLabel}
                            </span>

                            {/* 3-Dot Menu Button - The ONLY button on the card */}
                            <div className="relative shrink-0">
                              <button
                                id={`btn-milestone-more-${milestone.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId((prev) => (prev === milestone.id ? null : milestone.id));
                                }}
                                title="Milestone Options"
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[#141413]/70 hover:text-[#141413] hover:bg-black/10 active:scale-95 transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Dropdown Menu */}
                              {openMenuId === milestone.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-8 z-50 bg-[#F5F4F0] text-[#141413] rounded-2xl shadow-xl border border-black/10 py-1.5 min-w-[155px]"
                                >
                                  <button
                                    id={`btn-milestone-edit-${milestone.id}`}
                                    type="button"
                                    onClick={() => handleStartEdit(milestone)}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-black/5 flex items-center space-x-2 transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-[#141413]/70" />
                                    <span>Edit Milestone</span>
                                  </button>

                                  <button
                                    id={`btn-milestone-toggle-${milestone.id}`}
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onToggleMilestone(milestone.id);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-black/5 flex items-center space-x-2 transition-colors cursor-pointer"
                                  >
                                    {milestone.completed ? (
                                      <>
                                        <Circle className="w-3.5 h-3.5 text-[#141413]/70" />
                                        <span>Mark In Progress</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                        <span>Mark Reached</span>
                                      </>
                                    )}
                                  </button>

                                  <div className="h-px bg-black/5 my-1" />

                                  <button
                                    id={`btn-milestone-delete-${milestone.id}`}
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleSwipeDelete(milestone.id);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Title (Text Only) */}
                        <div className="my-auto py-1">
                          <h3
                            className={`text-2xl font-black text-[#141413] tracking-tight leading-snug ${
                              milestone.completed ? 'line-through text-[#141413]/55' : ''
                            }`}
                          >
                            {milestone.title}
                          </h3>
                        </div>

                        {/* Progress Bar & Percentage Metric (Text Only) */}
                        <div className="mt-3 pt-2.5 border-t border-black/10">
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#141413]/85 mb-1.5">
                            <span>
                              {milestone.completed
                                ? 'Reached'
                                : milestone.metricLabel || 'Target Progress'}
                            </span>
                            <span>{milestone.completed ? '100%' : `${milestone.progressPercent ?? 0}%`}</span>
                          </div>
                          <div className="w-full h-2 bg-black/15 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#141413] rounded-full transition-all duration-300"
                              style={{
                                width: `${milestone.completed ? 100 : (milestone.progressPercent ?? 0)}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {milestoneDeck.length > 0 && (
          <p className="text-[11px] text-center text-[#141413]/50 mt-4 font-mono flex items-center justify-center space-x-1">
            <span>Swipe to delete • Tap to cycle • 3-dot menu to edit</span>
          </p>
        )}
      </section>
    </div>
  );
};
