import React, { useState } from 'react';
import { X, Target, Clock, BookOpen, DollarSign, CheckSquare } from 'lucide-react';
import { BookItem, ExpenseItem, FocusSessionItem, HorizonMilestone, TodayTaskItem } from '../types';

type AddTab = 'task' | 'focus' | 'expense' | 'milestone' | 'book';

interface QuickAddModalProps {
  initialTab?: AddTab;
  onClose: () => void;
  onAddMilestone: (m: HorizonMilestone) => void;
  onAddFocusSession: (s: FocusSessionItem) => void;
  onAddBook: (b: BookItem) => void;
  onAddExpense: (e: ExpenseItem) => void;
  onAddTask?: (task: { name: string; timeToBeDone: string; importance: TodayTaskItem['importance']; bio: string }) => void;
  onToast: (msg: string) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  initialTab = 'task',
  onClose,
  onAddMilestone,
  onAddFocusSession,
  onAddBook,
  onAddExpense,
  onAddTask,
  onToast
}) => {
  const [activeTab, setActiveTab] = useState<AddTab>(initialTab);

  // Task form state
  const [tName, setTName] = useState('');
  const [tTime, setTTime] = useState('14:30');
  const [tImportance, setTImportance] = useState<TodayTaskItem['importance']>('High');
  const [tBio, setTBio] = useState('');

  // Milestone form state
  const [mTitle, setMTitle] = useState('');
  const [mCategory, setMCategory] = useState('Systems & Intelligence');
  const [mDate, setMDate] = useState('Oct 2026');
  const [mMetric, setMMetric] = useState('50% target');
  const [mProgress, setMProgress] = useState('40');

  // Focus session form state
  const [fTitle, setFTitle] = useState('');
  const [fTime, setFTime] = useState('15:00 - 16:30');
  const [fDuration, setFDuration] = useState('1h 30m');

  // Book form state
  const [bTitle, setBTitle] = useState('');
  const [bAuthor, setBAuthor] = useState('');
  const [bPages, setBPages] = useState(320);
  const [bTag, setBTag] = useState('Philosophy & Craft');

  // Expense form state
  const [eMerchant, setEMerchant] = useState('');
  const [eCategory, setECategory] = useState('Food & Coffee');
  const [eAmount, setEAmount] = useState('14.50');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'task') {
      if (!tName.trim()) return;
      onAddTask?.({
        name: tName.trim(),
        timeToBeDone: tTime.trim() || '17:00',
        importance: tImportance,
        bio: tBio.trim() || 'Operational priority scheduled for today.'
      });
      onToast(`Created task: ${tName}`);
    } else if (activeTab === 'milestone') {
      if (!mTitle.trim()) return;
      const milestoneColors = ['#9BB8A7', '#C6A584', '#F1D97E', '#D79A6B', '#9EAFA0', '#D6C5B3', '#A1A8AF'];
      const randomColor = milestoneColors[Math.floor(Math.random() * milestoneColors.length)];
      const parsedPercent = Math.min(100, Math.max(0, parseInt(mProgress, 10) || 0));
      onAddMilestone({
        id: 'm_' + Date.now(),
        title: mTitle.trim(),
        category: mCategory.trim() || 'Horizon Milestone',
        dateLabel: mDate.trim() || '2026',
        metricLabel: mMetric.trim() || `${parsedPercent}% target`,
        progressPercent: parsedPercent,
        color: randomColor,
        textColor: '#141413',
        iconName: 'zap',
        completed: false
      });
      onToast(`Created milestone: ${mTitle}`);
    } else if (activeTab === 'focus') {
      if (!fTitle.trim()) return;
      const sessionColors = ['#9BB8A7', '#C6A584', '#F1D97E', '#D79A6B', '#9EAFA0', '#D6C5B3', '#A1A8AF'];
      const randomColor = sessionColors[Math.floor(Math.random() * sessionColors.length)];
      onAddFocusSession({
        id: 's_' + Date.now(),
        title: fTitle.trim(),
        timeRange: fTime,
        duration: fDuration,
        durationMinutes: 90,
        completed: false,
        color: randomColor
      });
      onToast(`Logged focus block: ${fTitle}`);
    } else if (activeTab === 'book') {
      if (!bTitle.trim()) return;
      const bookColors = ['#C6A584', '#9BB8A7', '#F1D97E', '#D79A6B', '#9EAFA0', '#D6C5B3', '#A1A8AF'];
      const randomColor = bookColors[Math.floor(Math.random() * bookColors.length)];
      onAddBook({
        id: 'b_' + Date.now(),
        title: bTitle.trim(),
        author: bAuthor.trim() || 'Curated Author',
        totalPages: Number(bPages) || 300,
        currentPage: 0,
        tag: bTag,
        color: randomColor
      });
      onToast(`Cataloged volume: ${bTitle}`);
    } else if (activeTab === 'expense') {
      if (!eMerchant.trim()) return;
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const expenseColors = ['#9BB8A7', '#C6A584', '#F1D97E', '#E63926', '#A1A8AF', '#D79A6B', '#9EAFA0', '#D6C5B3'];
      const randomColor = expenseColors[Math.floor(Math.random() * expenseColors.length)];
      onAddExpense({
        id: 'e_' + Date.now(),
        merchant: eMerchant.trim(),
        category: eCategory,
        amount: -Math.abs(parseFloat(eAmount) || 15),
        color: randomColor,
        iconName: 'credit-card',
        time: nowTime
      });
      onToast(`Logged expense: ${eMerchant}`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#141413]/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#FAF9F5] rounded-t-[36px] sm:rounded-[36px] shadow-2xl p-6 flex flex-col space-y-4 border border-[#141413]/10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5722]">
              Android Quick Record
            </span>
            <h3 className="text-2xl font-black text-[#141413] tracking-tight">Create Entry</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#efeeea] hover:bg-[#e3e2df] flex items-center justify-center text-[#141413] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-1 bg-[#efeeea] p-1 rounded-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('task')}
            className={`flex-1 py-1.5 px-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1 whitespace-nowrap ${
              activeTab === 'task'
                ? 'bg-[#141413] text-white shadow-xs'
                : 'text-[#141413]/60 hover:text-[#141413]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-1.5 px-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1 whitespace-nowrap ${
              activeTab === 'expense'
                ? 'bg-[#141413] text-white shadow-xs'
                : 'text-[#141413]/60 hover:text-[#141413]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('focus')}
            className={`flex-1 py-1.5 px-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1 whitespace-nowrap ${
              activeTab === 'focus'
                ? 'bg-[#141413] text-white shadow-xs'
                : 'text-[#141413]/60 hover:text-[#141413]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Focus</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('milestone')}
            className={`flex-1 py-1.5 px-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1 whitespace-nowrap ${
              activeTab === 'milestone'
                ? 'bg-[#141413] text-white shadow-xs'
                : 'text-[#141413]/60 hover:text-[#141413]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Goal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('book')}
            className={`flex-1 py-1.5 px-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1 whitespace-nowrap ${
              activeTab === 'book'
                ? 'bg-[#141413] text-white shadow-xs'
                : 'text-[#141413]/60 hover:text-[#141413]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Book</span>
          </button>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {activeTab === 'task' && (
            <>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                  Task Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Android Architecture Review"
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-medium text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                    Time to be done
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:30 AM"
                    value={tTime}
                    onChange={(e) => setTTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-mono text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                    Importance
                  </label>
                  <select
                    value={tImportance}
                    onChange={(e) => setTImportance(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-2xl bg-white border border-black/10 text-xs font-bold text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                  Task Bio / Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief bio describing the purpose, deliverables, and acceptance criteria..."
                  value={tBio}
                  onChange={(e) => setTBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-medium text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
                />
              </div>
            </>
          )}

          {activeTab === 'milestone' && (
            <>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                  Milestone Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Publish Architectural Monograph"
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-medium text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Systems & Intelligence, Physical Endurance..."
                  value={mCategory}
                  onChange={(e) => setMCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-medium text-[#141413] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                    Target Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Oct 2026"
                    value={mDate}
                    onChange={(e) => setMDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-medium text-[#141413] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0 - 100"
                    value={mProgress}
                    onChange={(e) => setMProgress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-medium text-[#141413] focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'focus' && (
            <>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                  Focus Session Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Typography & Reading Layouts"
                  value={fTitle}
                  onChange={(e) => setFTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-medium text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                    Time Window
                  </label>
                  <input
                    type="text"
                    value={fTime}
                    onChange={(e) => setFTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-mono text-[#141413] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                    Planned Duration
                  </label>
                  <input
                    type="text"
                    value={fDuration}
                    onChange={(e) => setFDuration(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-medium text-[#141413] focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'expense' && (
            <>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                  Merchant / Entity
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Bottle Roastery"
                  value={eMerchant}
                  onChange={(e) => setEMerchant(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-medium text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                    Amount ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={eAmount}
                    onChange={(e) => setEAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-mono text-[#141413] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                    Category
                  </label>
                  <select
                    value={eCategory}
                    onChange={(e) => setECategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl bg-white border border-black/10 text-xs font-medium text-[#141413] focus:outline-none"
                  >
                    <option value="Food & Coffee">Food & Coffee</option>
                    <option value="Taxi & Commute">Taxi & Commute</option>
                    <option value="Studio Gear">Studio Gear</option>
                    <option value="Software & Cloud">Software & Cloud</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === 'book' && (
            <>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                  Book Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thinking, Fast and Slow"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-medium text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                    Author
                  </label>
                  <input
                    type="text"
                    value={bAuthor}
                    onChange={(e) => setBAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-medium text-[#141413] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60 mb-1 block">
                    Page Count
                  </label>
                  <input
                    type="number"
                    value={bPages}
                    onChange={(e) => setBPages(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-mono text-[#141413] focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full bg-[#efeeea] hover:bg-[#e3e2df] text-[#141413] font-bold text-xs transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full bg-[#141413] hover:bg-black text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Commit Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
