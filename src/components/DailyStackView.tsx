import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoreVertical, Edit2, Trash2, Plus } from 'lucide-react';
import { DailyStackTab, ExpenseItem, FileCardItem } from '../types';

interface DailyStackViewProps {
  files: FileCardItem[];
  expenses: ExpenseItem[];
  activeSubTab: DailyStackTab;
  onSelectSubTab: (tab: DailyStackTab) => void;
  onDeleteCard: (fileId: string) => void;
  onEditTitle: (fileId: string, newTitle: string) => void;
  onDeleteExpense: (expenseId: string) => void;
  onEditExpenseTitle: (expenseId: string, newTitle: string) => void;
  onAddExpense: () => void;
  onAddTaskClick?: () => void;
  onToast?: (msg: string) => void;
}

export const DailyStackView: React.FC<DailyStackViewProps> = ({
  files,
  expenses,
  activeSubTab,
  onSelectSubTab,
  onDeleteCard,
  onEditTitle,
  onDeleteExpense,
  onEditExpenseTitle,
  onAddExpense,
  onAddTaskClick,
  onToast
}) => {
  // Task cards deck state (last element is FRONT)
  const [taskDeck, setTaskDeck] = useState<FileCardItem[]>(files);
  // Expense cards deck state (last element is FRONT)
  const [expenseDeck, setExpenseDeck] = useState<ExpenseItem[]>(expenses);

  // 3-dot dropdown menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Inline editing state for tasks
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitleValue, setEditTaskTitleValue] = useState('');

  // Inline editing state for expenses
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpenseTitleValue, setEditExpenseTitleValue] = useState('');

  // Dragging state to prevent unwanted click events
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setTaskDeck(files);
  }, [files]);

  useEffect(() => {
    setExpenseDeck(expenses);
  }, [expenses]);

  // Close 3-dot menu on click outside
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const totalExpenses = expenseDeck.reduce((sum, item) => sum + Math.abs(item.amount), 0);

  // --- TASK ACTIONS ---
  const handleTaskClick = (fileId: string) => {
    if (editingTaskId) return;
    setTaskDeck((prev) => {
      const targetIndex = prev.findIndex((f) => f.id === fileId);
      if (targetIndex === -1) return prev;

      const isAlreadyFront = targetIndex === prev.length - 1;
      if (isAlreadyFront) {
        if (prev.length <= 1) return prev;
        const front = prev[prev.length - 1];
        const rest = prev.slice(0, prev.length - 1);
        return [front, ...rest];
      }

      const target = prev[targetIndex];
      const remaining = prev.filter((f) => f.id !== fileId);
      return [...remaining, target];
    });
  };

  const handleSwipeDeleteTask = (fileId: string) => {
    onDeleteCard(fileId);
  };

  const handleSaveTaskTitle = (fileId: string) => {
    if (editTaskTitleValue.trim()) {
      onEditTitle(fileId, editTaskTitleValue.trim());
    }
    setEditingTaskId(null);
  };

  // --- EXPENSE ACTIONS ---
  const handleExpenseClick = (expId: string) => {
    if (editingExpenseId) return;
    setExpenseDeck((prev) => {
      const targetIndex = prev.findIndex((e) => e.id === expId);
      if (targetIndex === -1) return prev;

      const isAlreadyFront = targetIndex === prev.length - 1;
      if (isAlreadyFront) {
        if (prev.length <= 1) return prev;
        const front = prev[prev.length - 1];
        const rest = prev.slice(0, prev.length - 1);
        return [front, ...rest];
      }

      const target = prev[targetIndex];
      const remaining = prev.filter((e) => e.id !== expId);
      return [...remaining, target];
    });
  };

  const handleSwipeDeleteExpense = (expId: string) => {
    onDeleteExpense(expId);
  };

  const handleSaveExpenseTitle = (expId: string) => {
    if (editExpenseTitleValue.trim()) {
      onEditExpenseTitle(expId, editExpenseTitleValue.trim());
    }
    setEditingExpenseId(null);
  };

  return (
    <div className="flex flex-col px-6 pt-2 pb-28 min-h-full">
      {/* Editorial Header */}
      <section className="shrink-0 mb-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-5xl font-black tracking-tight text-[#141413] font-sans">
            Hello
          </h1>
          <span className="font-mono text-xs font-medium text-[#141413]/60">
            Tuesday, 11 Feb
          </span>
        </div>
      </section>

      {/* Switcher Pill: Tasks vs Expenses */}
      <div className="flex items-center justify-start mb-4 shrink-0">
        <div className="flex items-center space-x-1 bg-[#141413]/5 p-1 rounded-full">
          <button
            id="tab-btn-tasks"
            onClick={() => onSelectSubTab('files')}
            className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeSubTab === 'files'
                ? 'bg-[#141413] text-white shadow-xs'
                : 'text-[#141413]/70 hover:text-[#141413]'
            }`}
          >
            Today's Tasks ({taskDeck.length})
          </button>
          <button
            id="tab-btn-expenses"
            onClick={() => onSelectSubTab('expenses')}
            className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeSubTab === 'expenses'
                ? 'bg-[#141413] text-white shadow-xs'
                : 'text-[#141413]/70 hover:text-[#141413]'
            }`}
          >
            Expenses (${totalExpenses.toFixed(0)})
          </button>
        </div>
      </div>

      {/* TAB 1: MINIMALIST TASKS STACKED DECK */}
      {activeSubTab === 'files' && (
        <section className="relative w-full flex-1 min-h-[460px] pb-6">
          {taskDeck.length === 0 ? (
            /* Empty State */
            <div className="w-full h-64 rounded-[30px] border-2 border-dashed border-black/15 flex flex-col items-center justify-center p-6 text-center bg-black/2">
              <p className="text-base font-bold text-[#141413]">No tasks in stack</p>
              <p className="text-xs text-[#141413]/60 mt-1">All cards have been completed or deleted</p>
              <button
                id="btn-empty-add-task"
                type="button"
                onClick={onAddTaskClick}
                className="mt-4 px-4 py-2 rounded-full bg-[#141413] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Task</span>
              </button>
            </div>
          ) : (
            <div className="relative w-full h-[450px]">
              <AnimatePresence mode="popLayout">
                {taskDeck.map((file, index) => {
                  const isFront = index === taskDeck.length - 1;
                  const topOffset = index * 40;
                  const zIndex = 10 + index;
                  const timeText = file.startTime ? `Starts at ${file.startTime}` : file.subtitle;

                  return (
                    <motion.article
                      key={file.id}
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
                      // Drag / Swipe support
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.8}
                      onDragStart={() => setIsDragging(true)}
                      onDragEnd={(_e, info) => {
                        setTimeout(() => setIsDragging(false), 50);
                        if (Math.abs(info.offset.x) > 75 || Math.abs(info.velocity.x) > 350) {
                          handleSwipeDeleteTask(file.id);
                        }
                      }}
                      onClick={() => {
                        if (!isDragging && !editingTaskId) {
                          handleTaskClick(file.id);
                        }
                      }}
                      style={{
                        backgroundColor: file.color,
                        top: `${topOffset}px`,
                        zIndex: zIndex
                      }}
                      className={`absolute inset-x-0 rounded-[30px] p-6 select-none cursor-grab active:cursor-grabbing transition-shadow duration-200 ${
                        isFront
                          ? 'min-h-[220px] shadow-[0_-4px_20px_rgba(0,0,0,0.08),0_14px_36px_rgba(0,0,0,0.18)] ring-1 ring-black/10'
                          : 'h-44 shadow-[0_-4px_14px_rgba(0,0,0,0.05),0_6px_16px_rgba(0,0,0,0.06)]'
                      }`}
                    >
                      {/* Top Row: Title + 3-Dot Button ONLY */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-3">
                          {editingTaskId === file.id ? (
                            /* Inline Edit Mode */
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveTaskTitle(file.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full space-y-2"
                            >
                              <input
                                id={`input-edit-task-title-${file.id}`}
                                type="text"
                                value={editTaskTitleValue}
                                onChange={(e) => setEditTaskTitleValue(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') setEditingTaskId(null);
                                }}
                                className="w-full bg-white/95 text-[#141413] text-xl font-bold px-3 py-1.5 rounded-xl border border-black/20 focus:outline-none focus:ring-2 focus:ring-[#141413]"
                              />
                              <div className="flex items-center space-x-2">
                                <button
                                  id={`btn-save-task-title-${file.id}`}
                                  type="submit"
                                  className="text-xs font-bold bg-[#141413] text-white px-3.5 py-1.5 rounded-full shadow-xs active:scale-95 cursor-pointer"
                                >
                                  Save Title
                                </button>
                                <button
                                  id={`btn-cancel-task-title-${file.id}`}
                                  type="button"
                                  onClick={() => setEditingTaskId(null)}
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
                                {file.title}
                              </h3>
                              {/* Time (Text Only) */}
                              <p className="text-sm font-semibold text-[#141413]/70 font-mono mt-1.5">
                                {timeText}
                              </p>
                            </>
                          )}
                        </div>

                        {/* 3-Dot Menu Button - The ONLY button inside the card */}
                        <div className="relative shrink-0">
                          <button
                            id={`btn-card-more-${file.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId((prev) => (prev === file.id ? null : file.id));
                            }}
                            title="Task Options"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#141413]/70 hover:text-[#141413] hover:bg-black/10 active:scale-95 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === file.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-9 z-50 bg-[#F5F4F0] text-[#141413] rounded-2xl shadow-xl border border-black/10 py-1.5 min-w-[135px]"
                            >
                              <button
                                id={`btn-menu-edit-${file.id}`}
                                type="button"
                                onClick={() => {
                                  setEditingTaskId(file.id);
                                  setEditTaskTitleValue(file.title);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-bold hover:bg-black/5 flex items-center space-x-2 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-[#141413]" />
                                <span>Edit Title</span>
                              </button>
                              <button
                                id={`btn-menu-delete-${file.id}`}
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onDeleteCard(file.id);
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
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {taskDeck.length > 0 && (
            <p className="text-[11px] text-center text-[#141413]/50 mt-4 font-mono flex items-center justify-center space-x-1">
              <span>Swipe card left/right to delete • Tap background card to front</span>
            </p>
          )}
        </section>
      )}

      {/* TAB 2: MINIMALIST EXPENSES STACKED DECK */}
      {activeSubTab === 'expenses' && (
        <section className="relative w-full flex-1 min-h-[460px] pb-6">
          {expenseDeck.length === 0 ? (
            /* Empty State */
            <div className="w-full h-64 rounded-[30px] border-2 border-dashed border-black/15 flex flex-col items-center justify-center p-6 text-center bg-black/2">
              <p className="text-base font-bold text-[#141413]">No expenses in stack</p>
              <p className="text-xs text-[#141413]/60 mt-1">All expense cards have been deleted</p>
              <button
                id="btn-empty-add-expense"
                type="button"
                onClick={onAddExpense}
                className="mt-4 px-4 py-2 rounded-full bg-[#141413] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Expense</span>
              </button>
            </div>
          ) : (
            <div className="relative w-full h-[450px]">
              <AnimatePresence mode="popLayout">
                {expenseDeck.map((exp, index) => {
                  const isFront = index === expenseDeck.length - 1;
                  const topOffset = index * 40;
                  const zIndex = 10 + index;
                  const timeText = exp.time
                    ? `${exp.time} • -$${Math.abs(exp.amount).toFixed(2)}`
                    : `-$${Math.abs(exp.amount).toFixed(2)} • Today`;

                  return (
                    <motion.article
                      key={exp.id}
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
                      // Drag / Swipe support
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.8}
                      onDragStart={() => setIsDragging(true)}
                      onDragEnd={(_e, info) => {
                        setTimeout(() => setIsDragging(false), 50);
                        if (Math.abs(info.offset.x) > 75 || Math.abs(info.velocity.x) > 350) {
                          handleSwipeDeleteExpense(exp.id);
                        }
                      }}
                      onClick={() => {
                        if (!isDragging && !editingExpenseId) {
                          handleExpenseClick(exp.id);
                        }
                      }}
                      style={{
                        backgroundColor: exp.color,
                        top: `${topOffset}px`,
                        zIndex: zIndex
                      }}
                      className={`absolute inset-x-0 rounded-[30px] p-6 select-none cursor-grab active:cursor-grabbing transition-shadow duration-200 ${
                        isFront
                          ? 'min-h-[220px] shadow-[0_-4px_20px_rgba(0,0,0,0.08),0_14px_36px_rgba(0,0,0,0.18)] ring-1 ring-black/10'
                          : 'h-44 shadow-[0_-4px_14px_rgba(0,0,0,0.05),0_6px_16px_rgba(0,0,0,0.06)]'
                      }`}
                    >
                      {/* Top Row: Title + 3-Dot Button ONLY */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-3">
                          {editingExpenseId === exp.id ? (
                            /* Inline Edit Mode */
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveExpenseTitle(exp.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full space-y-2"
                            >
                              <input
                                id={`input-edit-expense-title-${exp.id}`}
                                type="text"
                                value={editExpenseTitleValue}
                                onChange={(e) => setEditExpenseTitleValue(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') setEditingExpenseId(null);
                                }}
                                className="w-full bg-white/95 text-[#141413] text-xl font-bold px-3 py-1.5 rounded-xl border border-black/20 focus:outline-none focus:ring-2 focus:ring-[#141413]"
                              />
                              <div className="flex items-center space-x-2">
                                <button
                                  id={`btn-save-expense-title-${exp.id}`}
                                  type="submit"
                                  className="text-xs font-bold bg-[#141413] text-white px-3.5 py-1.5 rounded-full shadow-xs active:scale-95 cursor-pointer"
                                >
                                  Save Title
                                </button>
                                <button
                                  id={`btn-cancel-expense-title-${exp.id}`}
                                  type="button"
                                  onClick={() => setEditingExpenseId(null)}
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
                                {exp.merchant}
                              </h3>
                              {/* Time & Amount (Text Only) */}
                              <p className="text-sm font-semibold text-[#141413]/70 font-mono mt-1.5">
                                {timeText}
                              </p>
                            </>
                          )}
                        </div>

                        {/* 3-Dot Menu Button - The ONLY button inside the card */}
                        <div className="relative shrink-0">
                          <button
                            id={`btn-expense-more-${exp.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId((prev) => (prev === exp.id ? null : exp.id));
                            }}
                            title="Expense Options"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#141413]/70 hover:text-[#141413] hover:bg-black/10 active:scale-95 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === exp.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-9 z-50 bg-[#F5F4F0] text-[#141413] rounded-2xl shadow-xl border border-black/10 py-1.5 min-w-[135px]"
                            >
                              <button
                                id={`btn-expense-menu-edit-${exp.id}`}
                                type="button"
                                onClick={() => {
                                  setEditingExpenseId(exp.id);
                                  setEditExpenseTitleValue(exp.merchant);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-bold hover:bg-black/5 flex items-center space-x-2 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-[#141413]" />
                                <span>Edit Title</span>
                              </button>
                              <button
                                id={`btn-expense-menu-delete-${exp.id}`}
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onDeleteExpense(exp.id);
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
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {expenseDeck.length > 0 && (
            <p className="text-[11px] text-center text-[#141413]/50 mt-4 font-mono flex items-center justify-center space-x-1">
              <span>Swipe card left/right to delete • Tap background card to front</span>
            </p>
          )}
        </section>
      )}
    </div>
  );
};
