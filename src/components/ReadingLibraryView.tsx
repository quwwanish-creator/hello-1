import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Plus, MoreVertical, Edit2, Trash2, BookOpen, CheckCircle2, Bookmark, ArrowRight, BookMarked } from 'lucide-react';
import { BookItem } from '../types';

interface ReadingLibraryViewProps {
  deskBooks: BookItem[];
  queueBooks: BookItem[];
  onActivateBook: (book: BookItem) => void;
  onLogPages: (bookId: string, pageIncrement: number) => void;
  onOpenAddBook: () => void;
  onDeleteBook?: (bookId: string, fromQueue?: boolean) => void;
  onEditBook?: (bookId: string, updates: Partial<BookItem>, inQueue?: boolean) => void;
  subTab?: 'desk' | 'queue';
  onSelectSubTab?: (tab: 'desk' | 'queue') => void;
}

export const ReadingLibraryView: React.FC<ReadingLibraryViewProps> = ({
  deskBooks,
  queueBooks,
  onActivateBook,
  onLogPages,
  onOpenAddBook,
  onDeleteBook,
  onEditBook,
  subTab = 'desk',
  onSelectSubTab
}) => {
  const [activeTab, setActiveTab] = useState<'desk' | 'queue'>(subTab);

  useEffect(() => {
    if (subTab) setActiveTab(subTab);
  }, [subTab]);

  const handleTabChange = (tab: 'desk' | 'queue') => {
    setActiveTab(tab);
    onSelectSubTab?.(tab);
  };

  // Stack deck state (last item is FRONT card in stack)
  const currentList = activeTab === 'desk' ? deskBooks : queueBooks;
  const [bookDeck, setBookDeck] = useState<BookItem[]>(currentList);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // In-card editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editTotalPages, setEditTotalPages] = useState(300);
  const [editCurrentPage, setEditCurrentPage] = useState(0);
  const [editTag, setEditTag] = useState('');

  useEffect(() => {
    setBookDeck(currentList);
  }, [currentList, activeTab]);

  // Reading metrics
  const annualGoal = 24;
  const completedBooksCount = deskBooks.filter((b) => b.currentPage >= b.totalPages).length;
  const totalPagesRead = deskBooks.reduce((acc, b) => acc + b.currentPage, 0);
  const deepMinutes = Math.round(totalPagesRead * 1.5);
  const annualPct = Math.min(100, Math.round((completedBooksCount / annualGoal) * 100));
  const ritualStreak = totalPagesRead > 0 ? Math.min(14, Math.ceil(totalPagesRead / 50)) : 0;

  // Circular progress ring offset
  const circumference = 125.6;
  const strokeDashoffset = circumference - (annualPct / 100) * circumference;

  // Tapping background brings to front, tapping front cycles to back
  const handleCardClick = (bookId: string) => {
    if (editingId) return;
    const clickedIndex = bookDeck.findIndex((b) => b.id === bookId);
    if (clickedIndex === -1) return;

    if (clickedIndex === bookDeck.length - 1) {
      // Front card clicked: cycle to back
      const front = bookDeck[clickedIndex];
      const rest = bookDeck.slice(0, clickedIndex);
      setBookDeck([front, ...rest]);
    } else {
      // Background card clicked: bring to front
      const clicked = bookDeck[clickedIndex];
      const filtered = bookDeck.filter((_, idx) => idx !== clickedIndex);
      setBookDeck([...filtered, clicked]);
    }
  };

  // Swipe delete handler
  const handleSwipeDelete = (bookId: string) => {
    setBookDeck((prev) => prev.filter((b) => b.id !== bookId));
    onDeleteBook?.(bookId, activeTab === 'queue');
  };

  // Start editing a book
  const handleStartEdit = (book: BookItem) => {
    setEditingId(book.id);
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditTotalPages(book.totalPages);
    setEditCurrentPage(book.currentPage);
    setEditTag(book.tag);
    setOpenMenuId(null);
  };

  // Save book edits
  const handleSaveEdit = (e: React.FormEvent, bookId: string) => {
    e.preventDefault();
    const cleanTitle = editTitle.trim();
    if (!cleanTitle) return;

    onEditBook?.(
      bookId,
      {
        title: cleanTitle,
        author: editAuthor.trim() || 'Curated Author',
        totalPages: Math.max(1, Number(editTotalPages) || 100),
        currentPage: Math.max(0, Math.min(Number(editCurrentPage) || 0, Number(editTotalPages) || 100)),
        tag: editTag.trim() || 'Reading Stack'
      },
      activeTab === 'queue'
    );

    setEditingId(null);
  };

  return (
    <div className="flex flex-col px-6 pt-2 pb-28 min-h-full space-y-4">
      {/* Top Header Navigation Bar */}
      <section className="flex items-center justify-between pt-1">
        <button
          type="button"
          className="group flex items-center space-x-1.5 focus:outline-none"
        >
          <h1 className="text-2xl font-bold tracking-tight text-[#141413]">Reading Library</h1>
          <ChevronDown className="w-4 h-4 text-[#141413]/50 group-hover:text-[#141413] transition-colors" />
        </button>

        <div className="flex items-center space-x-2">
          {/* Sub-tab Pill Selector */}
          <div className="flex p-0.5 bg-[#141413]/5 rounded-full">
            <button
              id="btn-subtab-desk"
              type="button"
              onClick={() => handleTabChange('desk')}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeTab === 'desk'
                  ? 'bg-white text-[#141413] shadow-xs'
                  : 'text-[#141413]/60 hover:text-[#141413]'
              }`}
            >
              Desk 
            </button>
            <button
              id="btn-subtab-queue"
              type="button"
              onClick={() => handleTabChange('queue')}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-white text-[#141413] shadow-xs'
                  : 'text-[#141413]/60 hover:text-[#141413]'
              }`}
            >
              Queue 
            </button>
          </div>

          {/* Add Book Button */}
          <button
            id="btn-add-book-header"
            onClick={onOpenAddBook}
            aria-label="Add Book"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#141413]/5 hover:bg-[#141413]/10 text-[#141413] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Horizon Metric Progress Capsule */}
      <section className="p-4 rounded-3xl bg-[#f5f4f0] shadow-xs border border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
              <circle
                className="text-[#e3e2df]"
                cx="24"
                cy="24"
                fill="none"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
              />
              <circle
                className="text-[#FF5722] transition-all duration-700"
                cx="24"
                cy="24"
                fill="none"
                r="20"
                stroke="currentColor"
                strokeDasharray="125.6"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
            <span className="absolute text-xs font-bold font-mono text-[#141413]">
              {annualPct}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#141413]">Annual Reading Horizon</span>
            <span className="text-xs text-[#141413]/60 font-mono">
              {completedBooksCount} of {annualGoal} volumes completed • {totalPagesRead} pp. read
            </span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#efeeea] flex items-center justify-center text-[#141413]/60">
          <BookMarked className="w-4 h-4" />
        </div>
      </section>

      {/* Vital Micro-Stats Strip */}
      <section className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-[#f5f4f0] border border-black/5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-[#141413]/50">Pages Read</span>
          <span className="text-lg font-black text-[#141413] font-mono mt-0.5">{totalPagesRead}</span>
          <span className="text-[10px] text-[#C6A584] font-medium">Total logged</span>
        </div>
        <div className="p-3 rounded-2xl bg-[#f5f4f0] border border-black/5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-[#141413]/50">Ritual Streak</span>
          <span className="text-lg font-black text-[#141413] font-mono mt-0.5">14d</span>
          <span className="text-[10px] text-emerald-700 font-medium">Consistent</span>
        </div>
        <div className="p-3 rounded-2xl bg-[#f5f4f0] border border-black/5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-[#141413]/50">Deep Time</span>
          <span className="text-lg font-black text-[#141413] font-mono mt-0.5">{deepMinutes}m</span>
          <span className="text-[10px] text-[#141413]/50 font-medium">Focused study</span>
        </div>
      </section>

      {/* STACKED BOOK CARDS DECK (Matching Daily Stack, Focus Tracker, Goals Horizon) */}
      <section className="pt-2 pb-4 flex flex-col justify-start">
        <div className="flex items-center justify-between px-1 mb-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#141413]">
              {activeTab === 'desk' ? 'Reading Desk' : 'Queue Stack'}
            </h2>
            <p className="text-xs text-[#141413]/55 font-mono">
              {bookDeck.length} {activeTab === 'desk' ? 'active volumes' : 'titles queued'}
            </p>
          </div>
          <button
            id="btn-add-book-deck"
            type="button"
            onClick={onOpenAddBook}
            className="text-xs font-bold text-[#FF5722] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Book</span>
          </button>
        </div>

        {/* Empty State */}
        {bookDeck.length === 0 ? (
          <div className="rounded-[30px] border border-dashed border-black/20 p-8 text-center bg-black/5">
            <p className="text-sm font-semibold text-[#141413]/70 mb-2">
              {activeTab === 'desk' ? 'Your reading desk is clear' : 'No books queued'}
            </p>
            <button
              type="button"
              onClick={onOpenAddBook}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#141413] text-white text-xs font-bold shadow-xs active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Book</span>
            </button>
          </div>
        ) : (
          <div className="relative w-full h-[370px]">
            <AnimatePresence mode="popLayout">
              {bookDeck.map((book, index) => {
                const isFront = index === bookDeck.length - 1;
                const topOffset = index * 42;
                const zIndex = 10 + index;
                const cardColor = book.color || '#C6A584';
                const progressPct = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
                const isEditing = editingId === book.id;

                return (
                  <motion.article
                    key={book.id}
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
                        handleSwipeDelete(book.id);
                      }
                    }}
                    onClick={() => {
                      if (!isDragging && !isEditing) {
                        handleCardClick(book.id);
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
                      /* Inline Book Editing Form */
                      <form
                        onSubmit={(e) => handleSaveEdit(e, book.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-col space-y-2.5"
                      >
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#141413]/60 mb-0.5 block">
                            Book Title
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
                              Author
                            </label>
                            <input
                              type="text"
                              required
                              value={editAuthor}
                              onChange={(e) => setEditAuthor(e.target.value)}
                              className="w-full bg-white/95 text-[#141413] text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-black/20 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#141413]/60 mb-0.5 block">
                              Category / Tag
                            </label>
                            <input
                              type="text"
                              value={editTag}
                              onChange={(e) => setEditTag(e.target.value)}
                              className="w-full bg-white/95 text-[#141413] text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-black/20 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#141413]/60 mb-0.5 block">
                              Current Page
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={editTotalPages}
                              value={editCurrentPage}
                              onChange={(e) => setEditCurrentPage(Number(e.target.value))}
                              className="w-full bg-white/95 text-[#141413] text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-black/20 focus:outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#141413]/60 mb-0.5 block">
                              Total Pages
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={editTotalPages}
                              onChange={(e) => setEditTotalPages(Number(e.target.value))}
                              className="w-full bg-white/95 text-[#141413] text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-black/20 focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            id={`btn-save-book-${book.id}`}
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
                      /* Book Card Display - Text Only with 3-Dot Menu */
                      <div className="flex flex-col h-full justify-between">
                        {/* Top Meta Row */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/70 font-mono">
                            {book.tag}
                          </span>

                          <div className="flex items-center space-x-2">
                            {/* Page Progress Badge */}
                            <span className="text-[11px] font-bold text-[#141413]/80 bg-black/10 px-2.5 py-0.5 rounded-full font-mono">
                              {book.currentPage} / {book.totalPages} pp. • {progressPct}%
                            </span>

                            {/* 3-Dot Menu Button - The ONLY button on the card */}
                            <div className="relative shrink-0">
                              <button
                                id={`btn-book-more-${book.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId((prev) => (prev === book.id ? null : book.id));
                                }}
                                title="Book Options"
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[#141413]/70 hover:text-[#141413] hover:bg-black/10 active:scale-95 transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Dropdown Menu */}
                              {openMenuId === book.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-8 z-50 bg-[#F5F4F0] text-[#141413] rounded-2xl shadow-xl border border-black/10 py-1.5 min-w-[160px]"
                                >
                                  {activeTab === 'desk' ? (
                                    <>
                                      <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#141413]/50">
                                        Quick Log
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          onLogPages(book.id, 10);
                                        }}
                                        className="w-full px-3.5 py-1.5 text-left text-xs font-semibold hover:bg-black/5 flex items-center justify-between transition-colors cursor-pointer"
                                      >
                                        <span>Log +10 pages</span>
                                        <span className="text-[10px] font-mono text-[#141413]/50">+10p</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          onLogPages(book.id, 25);
                                        }}
                                        className="w-full px-3.5 py-1.5 text-left text-xs font-semibold hover:bg-black/5 flex items-center justify-between transition-colors cursor-pointer"
                                      >
                                        <span>Log +25 pages</span>
                                        <span className="text-[10px] font-mono text-[#141413]/50">+25p</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          onLogPages(book.id, 50);
                                        }}
                                        className="w-full px-3.5 py-1.5 text-left text-xs font-semibold hover:bg-black/5 flex items-center justify-between transition-colors cursor-pointer"
                                      >
                                        <span>Log +50 pages</span>
                                        <span className="text-[10px] font-mono text-[#141413]/50">+50p</span>
                                      </button>
                                      <div className="h-px bg-black/5 my-1" />
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          onActivateBook(book);
                                        }}
                                        className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-black/5 flex items-center space-x-2 transition-colors cursor-pointer text-emerald-800"
                                      >
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>Open on Desk</span>
                                      </button>
                                      <div className="h-px bg-black/5 my-1" />
                                    </>
                                  )}

                                  <button
                                    id={`btn-book-edit-${book.id}`}
                                    type="button"
                                    onClick={() => handleStartEdit(book)}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-black/5 flex items-center space-x-2 transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-[#141413]/70" />
                                    <span>Edit Book</span>
                                  </button>

                                  <button
                                    id={`btn-book-delete-${book.id}`}
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleSwipeDelete(book.id);
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

                        {/* Main Title & Author (Text Only) */}
                        <div className="my-auto py-1">
                          <h3 className="text-2xl font-black text-[#141413] tracking-tight leading-snug">
                            {book.title}
                          </h3>
                          <p className="text-sm font-semibold text-[#141413]/70 font-mono mt-1">
                            by {book.author}
                          </p>
                        </div>

                        {/* Progress Bar & Footer Metrics (Text Only) */}
                        <div className="mt-3 pt-2.5 border-t border-black/10">
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#141413]/85 mb-1.5">
                            <span>
                              {book.currentPage >= book.totalPages
                                ? 'Completed Volume'
                                : `${Math.max(0, book.totalPages - book.currentPage)} pp. remaining`}
                            </span>
                            <span>{progressPct}% read</span>
                          </div>
                          <div className="w-full h-2 bg-black/15 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#141413] rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
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

        {bookDeck.length > 0 && (
          <p className="text-[11px] text-center text-[#141413]/50 mt-4 font-mono flex items-center justify-center space-x-1">
            <span>Swipe to delete • Tap to cycle • 3-dot menu to log & edit</span>
          </p>
        )}
      </section>

      {/* Editorial Reading Creed Quote */}
      <section className="p-4 rounded-3xl bg-[#efeeea]/70 border border-black/5 flex flex-col space-y-1 text-center mt-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C6A584]">
          The Reading Creed
        </span>
        <p className="text-sm font-headline italic text-[#141413] leading-snug">
          &ldquo;To read deeply is to inhabit the unvarnished consciousness of another mind without distraction.&rdquo;
        </p>
        <span className="text-[10px] text-[#141413]/55 pt-0.5">— Thought Stack, Vol. II</span>
      </section>
    </div>
  );
};
