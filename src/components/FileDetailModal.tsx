import React, { useState } from 'react';
import { X, Tag, Share2, Bookmark, CheckCircle2, Circle, Clock, Plus, Bell, BellOff, Zap } from 'lucide-react';
import { FileCardItem, TodayTaskItem } from '../types';

interface FileDetailModalProps {
  file: FileCardItem | null;
  onClose: () => void;
  onToast: (msg: string) => void;
  onToggleTask?: (taskId: string) => void;
  onAddTask?: (task: { name: string; timeToBeDone: string; importance: TodayTaskItem['importance']; bio: string }) => void;
  onToggleReminder?: (fileId: string) => void;
  onTriggerReminder?: (file: FileCardItem) => void;
  onToggleComplete?: (fileId: string) => void;
}

export const FileDetailModal: React.FC<FileDetailModalProps> = ({
  file,
  onClose,
  onToast,
  onToggleTask,
  onAddTask,
  onToggleReminder,
  onTriggerReminder,
  onToggleComplete
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('15:00');
  const [newImportance, setNewImportance] = useState<TodayTaskItem['importance']>('High');
  const [newBio, setNewBio] = useState('');

  if (!file) return null;

  const hasTasks = Boolean(file.tasks && file.tasks.length > 0);

  const getImportanceBadge = (importance: TodayTaskItem['importance']) => {
    switch (importance) {
      case 'Critical':
        return 'bg-[#E63926] text-white';
      case 'High':
        return 'bg-[#FF5722] text-white';
      case 'Medium':
        return 'bg-[#141413] text-[#F5F4F0]';
      case 'Normal':
      default:
        return 'bg-black/10 text-[#141413]';
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddTask?.({
      name: newName.trim(),
      timeToBeDone: newTime,
      importance: newImportance,
      bio: newBio.trim() || 'Scheduled priority task for daily agenda.'
    });

    setNewName('');
    setNewBio('');
    setShowAddForm(false);
    onToast(`Added task: ${newName}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#141413]/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#FAF9F5] rounded-t-[36px] sm:rounded-[36px] shadow-2xl p-6 flex flex-col space-y-4 border border-[#141413]/10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C6A584]">
              {file.category}
            </span>
            <div className="flex items-center space-x-2 mt-0.5">
              <button
                type="button"
                onClick={() => onToggleComplete?.(file.id)}
                title={file.completed ? 'Mark incomplete' : 'Mark completed'}
                className="shrink-0 text-[#141413] hover:text-[#FF5722] transition-colors"
              >
                {file.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                ) : (
                  <Circle className="w-6 h-6 text-[#141413]/50" />
                )}
              </button>
              <h3
                className={`text-2xl font-black text-[#141413] tracking-tight ${
                  file.completed ? 'line-through opacity-60' : ''
                }`}
              >
                {file.title}
              </h3>
            </div>
            <p className="text-xs font-medium text-[#141413]/60 mt-1 flex items-center space-x-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>{file.subtitle || `Starts at ${file.startTime}`}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#efeeea] hover:bg-[#e3e2df] flex items-center justify-center text-[#141413] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reminder Status & Quick Alert Bar */}
        <div className="p-3 rounded-2xl bg-[#f5f4f0] border border-black/5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleReminder?.(file.id)}
              className={`p-2 rounded-full flex items-center justify-center transition-all ${
                file.reminderSet ? 'bg-[#FF5722] text-white shadow-xs' : 'bg-black/10 text-[#141413]/70'
              }`}
            >
              {file.reminderSet ? <Bell className="w-4 h-4 fill-white" /> : <BellOff className="w-4 h-4" />}
            </button>
            <div>
              <span className="text-xs font-bold text-[#141413] block">
                {file.reminderSet ? `Reminder Active (${file.startTime})` : `Reminder Disabled`}
              </span>
              <span className="text-[11px] text-[#141413]/60 font-mono">
                {file.reminderSet ? 'Will notify at start time' : 'Tap bell to enable alert'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onTriggerReminder?.(file)}
            className="px-3 py-1.5 rounded-full bg-[#141413] hover:bg-black text-white text-xs font-bold flex items-center space-x-1.5 active:scale-95 transition-all shadow-xs"
          >
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>Remind Now</span>
          </button>
        </div>

        {/* Synopsis & Overview */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#141413]/60">
            Task Description
          </h4>
          <p className="text-xs text-[#141413]/80 leading-relaxed font-sans">
            {file.description}
          </p>
        </div>

        {/* Key Deliverables / Field Insights */}
        {file.keyInsights && file.keyInsights.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-black/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#141413]/60">
              Focus Goals &amp; Deliverables
            </h4>
            <div className="space-y-2">
              {file.keyInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5722] shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-[#141413]/85">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subtasks if present */}
        {hasTasks && (
          <div className="space-y-3 pt-2 border-t border-black/5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#141413]/70">
                Scheduled Subtasks
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs font-bold text-[#FF5722] hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Cancel' : 'Add Task'}</span>
              </button>
            </div>

            {/* Inline Add Task Form */}
            {showAddForm && (
              <form
                onSubmit={handleCreateTask}
                className="p-3.5 bg-[#efeeea] rounded-2xl space-y-2.5 border border-black/5 animate-fadeIn"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413]/60">
                  New Task Details
                </span>
                <input
                  type="text"
                  required
                  placeholder="Task Name (e.g., Code Review)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs text-[#141413] focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[#141413]/60">Due Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 11:30 AM"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white rounded-xl text-xs text-[#141413] focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#141413]/60">Importance</label>
                    <select
                      value={newImportance}
                      onChange={(e) => setNewImportance(e.target.value as any)}
                      className="w-full px-2 py-1.5 bg-white rounded-xl text-xs text-[#141413] focus:outline-none font-sans"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Normal">Normal</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#141413]/60">Task Bio / Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief bio of scope and execution parameters..."
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white rounded-xl text-xs text-[#141413] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#141413] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-black transition-all"
                >
                  Save Subtask
                </button>
              </form>
            )}

            {/* List of Tasks */}
            <div className="space-y-2.5">
              {file.tasks?.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-[#f5f4f0] rounded-2xl border border-black/5 space-y-1.5 transition-all hover:bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold font-mono text-[#141413]">
                      <Clock className="w-3.5 h-3.5 text-[#FF5722]" />
                      <span>Due: {task.timeToBeDone}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-mono ${getImportanceBadge(
                        task.importance
                      )}`}
                    >
                      {task.importance}
                    </span>
                  </div>

                  <div className="flex items-start space-x-2.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => onToggleTask?.(task.id)}
                      className="mt-0.5 shrink-0 text-[#141413] hover:text-[#FF5722] transition-colors cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#141413]/50" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h5
                        className={`text-xs font-extrabold text-[#141413] ${
                          task.completed ? 'line-through opacity-50' : ''
                        }`}
                      >
                        {task.name}
                      </h5>
                      <p className="text-[11px] text-[#141413]/70 leading-relaxed mt-0.5">
                        {task.bio}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Android Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-black/5">
          <button
            onClick={() => {
              onToast(`Shared "${file.title}" via Android Share Sheet`);
              onClose();
            }}
            className="py-3 px-4 rounded-full bg-[#efeeea] hover:bg-[#e3e2df] text-[#141413] font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Android Share</span>
          </button>
          <button
            onClick={() => {
              onTriggerReminder?.(file);
              onClose();
            }}
            className="py-3 px-4 rounded-full bg-[#141413] hover:bg-black text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95"
          >
            <Bookmark className="w-4 h-4" />
            <span>Pin Notification</span>
          </button>
        </div>
      </div>
    </div>
  );
};

