/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppSpace,
  DailyStackTab,
  FileCardItem,
  ExpenseItem,
  CalendarDayItem,
  FocusSessionItem,
  HorizonMilestone,
  BookItem,
  TodayTaskItem,
  AndroidSystemState
} from './types';
import {
  INITIAL_FILES,
  INITIAL_EXPENSES,
  INITIAL_CALENDAR_DAYS,
  INITIAL_FOCUS_SESSIONS,
  INITIAL_MILESTONES,
  INITIAL_DESK_BOOKS,
  INITIAL_QUEUE_BOOKS
} from './data/initialData';

import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidNavBar } from './components/AndroidNavBar';
import { AndroidQuickSettings } from './components/AndroidQuickSettings';
import { SpacesDrawer } from './components/SpacesDrawer';
import { BottomDock } from './components/BottomDock';
import { DailyStackView } from './components/DailyStackView';
import { FocusTrackerView } from './components/FocusTrackerView';
import { FocusTimerView } from './components/FocusTimerView';
import { GoalsHorizonView } from './components/GoalsHorizonView';
import { ReadingLibraryView } from './components/ReadingLibraryView';
import { FileDetailModal } from './components/FileDetailModal';
import { QuickAddModal } from './components/QuickAddModal';
import { AndroidToast } from './components/AndroidToast';
import { AndroidRecentsOverview } from './components/AndroidRecentsOverview';
import { playReminderChime } from './utils/audio';
import { Smartphone, Monitor, Volume2, Power } from 'lucide-react';

export default function App() {
  // Navigation & Space State
  const [currentSpace, setCurrentSpace] = useState<AppSpace>('daily-stack');
  const [spaceHistory, setSpaceHistory] = useState<AppSpace[]>(['daily-stack']);
  const [activeDailySubTab, setActiveDailySubTab] = useState<DailyStackTab>('files');
  const [activeGoalsSubTab, setActiveGoalsSubTab] = useState<'orbit' | 'cards'>('orbit');
  const [activeLibrarySubTab, setActiveLibrarySubTab] = useState<'desk' | 'queue'>('desk');

  // Modals & Panels State
  const [isSpacesDrawerOpen, setIsSpacesDrawerOpen] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isRecentsOpen, setIsRecentsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileCardItem | null>(null);
  const [activeTimerSession, setActiveTimerSession] = useState<FocusSessionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScreenStandby, setIsScreenStandby] = useState(false);

  // App Data State
  const [files, setFiles] = useState<FileCardItem[]>(INITIAL_FILES);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [calendarDays, setCalendarDays] = useState<CalendarDayItem[]>(INITIAL_CALENDAR_DAYS);
  const [focusSessions, setFocusSessions] = useState<FocusSessionItem[]>(INITIAL_FOCUS_SESSIONS);
  const [milestones, setMilestones] = useState<HorizonMilestone[]>(INITIAL_MILESTONES);
  const [deskBooks, setDeskBooks] = useState<BookItem[]>(INITIAL_DESK_BOOKS);
  const [queueBooks, setQueueBooks] = useState<BookItem[]>(INITIAL_QUEUE_BOOKS);

  // Android System State
  const [systemState, setSystemState] = useState<AndroidSystemState>({
    timeStr: '10:00',
    batteryPct: 98,
    isCharging: false,
    wifiConnected: true,
    cellular5G: true,
    soundEnabled: true,
    dndEnabled: false,
    navStyle: 'gesture',
    deviceFrame: 'pixel',
    quickSettingsOpen: false,
    activeNotifications: []
  });

  // Keep live time synchronized
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setSystemState((prev) => ({ ...prev, timeStr: `${hours}:${mins}` }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Toast helper with auto-dismiss
  const showToast = (msg: string) => {
    setToastMessage(msg);
    // Haptic vibration simulation if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(20);
      } catch (e) {
        // Safe fallback
      }
    }
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Space switching with history stack for authentic Android Back button
  const handleSelectSpace = (newSpace: AppSpace) => {
    if (newSpace === currentSpace) return;
    setSpaceHistory((prev) => [...prev, newSpace]);
    setCurrentSpace(newSpace);
  };

  // Android Back Button handler
  const handleAndroidBack = () => {
    if (isQuickSettingsOpen) {
      setIsQuickSettingsOpen(false);
      return;
    }
    if (isSpacesDrawerOpen) {
      setIsSpacesDrawerOpen(false);
      return;
    }
    if (isQuickAddOpen) {
      setIsQuickAddOpen(false);
      return;
    }
    if (selectedFile) {
      setSelectedFile(null);
      return;
    }
    if (activeTimerSession) {
      setActiveTimerSession(null);
      return;
    }
    if (isRecentsOpen) {
      setIsRecentsOpen(false);
      return;
    }

    // Go back in space history
    if (spaceHistory.length > 1) {
      const newHistory = [...spaceHistory];
      newHistory.pop(); // remove current
      const prevSpace = newHistory[newHistory.length - 1];
      setSpaceHistory(newHistory);
      setCurrentSpace(prevSpace);
    } else {
      showToast('Press Back again to exit app');
    }
  };

  // Android Home Button handler
  const handleAndroidHome = () => {
    setIsQuickSettingsOpen(false);
    setIsSpacesDrawerOpen(false);
    setIsQuickAddOpen(false);
    setSelectedFile(null);
    setIsRecentsOpen(false);
    handleSelectSpace('daily-stack');
  };

  // Android Recents Button handler
  const handleAndroidRecents = () => {
    setIsRecentsOpen(true);
  };

  // Toggle navigation style
  const handleToggleNavStyle = () => {
    setSystemState((prev) => {
      const nextStyle = prev.navStyle === 'gesture' ? '3-button' : 'gesture';
      showToast(`Navigation set to ${nextStyle === 'gesture' ? 'Gesture Bar' : '3-Button Bar'}`);
      return { ...prev, navStyle: nextStyle };
    });
  };

  // Toggle device frame
  const handleToggleDeviceFrame = () => {
    setSystemState((prev) => {
      const nextFrame = prev.deviceFrame === 'pixel' ? 'edge-to-edge' : 'pixel';
      showToast(`Display mode: ${nextFrame === 'pixel' ? 'Pixel 9 Phone Shell' : 'Edge-to-Edge'}`);
      return { ...prev, deviceFrame: nextFrame };
    });
  };

  // Session toggling
  const handleToggleFocusSession = (id: string) => {
    setFocusSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
    showToast('Updated focus session status');
  };

  // Delete focus session (via swipe or 3-dot menu)
  const handleDeleteFocusSession = (sessionId: string) => {
    const sessionToDelete = focusSessions.find((s) => s.id === sessionId);
    setFocusSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast(`Deleted session: "${sessionToDelete?.title || 'Session'}"`);
  };

  // Edit focus session title (via 3-dot menu)
  const handleEditFocusSessionTitle = (sessionId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setFocusSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: trimmed } : s))
    );
    showToast(`Updated session to "${trimmed}"`);
  };

  // Milestone toggling
  const handleToggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
    showToast('Updated milestone horizon status');
  };

  // Delete milestone (via swipe or 3-dot menu)
  const handleDeleteMilestone = (milestoneId: string) => {
    const itemToDelete = milestones.find((m) => m.id === milestoneId);
    setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    showToast(`Deleted milestone: "${itemToDelete?.title || 'Milestone'}"`);
  };

  // Edit milestone (title, date, percent, etc.)
  const handleEditMilestone = (milestoneId: string, updates: Partial<HorizonMilestone>) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, ...updates } : m))
    );
    showToast(`Updated milestone "${updates.title || 'details'}"`);
  };

  // Reading Library page logging
  const handleLogPages = (bookId: string, increment: number) => {
    setDeskBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const nextPages = Math.min(b.totalPages, b.currentPage + increment);
          return { ...b, currentPage: nextPages };
        }
        return b;
      })
    );
    showToast(`Logged +${increment} pages`);
  };

  // Move book from queue to desk
  const handleActivateBook = (book: BookItem) => {
    setDeskBooks((prev) => [...prev, { ...book, currentPage: 0 }]);
    setQueueBooks((prev) => prev.filter((b) => b.id !== book.id));
    showToast(`Opened "${book.title}" on Reading Desk`);
  };

  // Delete book from desk or queue
  const handleDeleteBook = (bookId: string, fromQueue = false) => {
    if (fromQueue) {
      const b = queueBooks.find((item) => item.id === bookId);
      setQueueBooks((prev) => prev.filter((item) => item.id !== bookId));
      showToast(`Deleted from queue: "${b?.title || 'Book'}"`);
    } else {
      const b = deskBooks.find((item) => item.id === bookId);
      setDeskBooks((prev) => prev.filter((item) => item.id !== bookId));
      showToast(`Deleted from desk: "${b?.title || 'Book'}"`);
    }
  };

  // Edit book details
  const handleEditBook = (bookId: string, updates: Partial<BookItem>, inQueue = false) => {
    if (inQueue) {
      setQueueBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, ...updates } : b))
      );
    } else {
      setDeskBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, ...updates } : b))
      );
    }
    showToast(`Updated "${updates.title || 'book details'}"`);
  };

  // Toggle task reminder state (bell chime & system notification)
  const handleToggleReminder = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== fileId) return f;
        const nextReminder = !f.reminderSet;
        if (nextReminder) {
          playReminderChime();
          showToast(`⏰ Reminder set for ${f.startTime}: ${f.title}`);
          setSystemState((sys) => ({
            ...sys,
            activeNotifications: [
              {
                id: 'remind-' + f.id,
                title: `⏰ Task Reminder: ${f.title}`,
                body: `Starts at ${f.startTime}. Tap to open.`,
                time: f.startTime
              },
              ...sys.activeNotifications.filter((n) => n.id !== 'remind-' + f.id)
            ]
          }));
        } else {
          showToast(`Reminder disabled for ${f.title}`);
          setSystemState((sys) => ({
            ...sys,
            activeNotifications: sys.activeNotifications.filter((n) => n.id !== 'remind-' + f.id)
          }));
        }
        return { ...f, reminderSet: nextReminder };
      })
    );

    setSelectedFile((prev) => {
      if (!prev || prev.id !== fileId) return prev;
      return { ...prev, reminderSet: !prev.reminderSet };
    });
  };

  // Trigger task reminder instantly (plays chime, notifies in Android shade & toast)
  const handleTriggerReminder = (file: FileCardItem) => {
    playReminderChime();
    showToast(`⏰ TIME TO START: ${file.title} (${file.startTime})`);
    setSystemState((sys) => ({
      ...sys,
      activeNotifications: [
        {
          id: 'trigger-' + Date.now(),
          title: `🔔 TIME TO START: ${file.title}`,
          body: `Scheduled start time ${file.startTime} reached! Time to focus on this task.`,
          time: sys.timeStr
        },
        ...sys.activeNotifications
      ]
    }));
  };

  // Toggle task completion
  const handleToggleTaskComplete = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== fileId) return f;
        const nextCompleted = !f.completed;
        showToast(nextCompleted ? `Completed: "${f.title}"` : `Marked incomplete: "${f.title}"`);
        return { ...f, completed: nextCompleted };
      })
    );
    setSelectedFile((prev) => {
      if (!prev || prev.id !== fileId) return prev;
      return { ...prev, completed: !prev.completed };
    });
  };

  // Delete task card (via swipe or 3-dot menu)
  const handleDeleteTask = (fileId: string) => {
    const taskToDelete = files.find((f) => f.id === fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
    showToast(`Deleted: "${taskToDelete?.title || 'Task'}"`);
  };

  // Edit task title (via 3-dot menu)
  const handleEditTaskTitle = (fileId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, title: trimmed } : f))
    );
    if (selectedFile?.id === fileId) {
      setSelectedFile((prev) => (prev ? { ...prev, title: trimmed } : null));
    }
    showToast(`Updated title to "${trimmed}"`);
  };

  // Delete expense (via swipe or 3-dot menu)
  const handleDeleteExpense = (expId: string) => {
    const expToDelete = expenses.find((e) => e.id === expId);
    setExpenses((prev) => prev.filter((e) => e.id !== expId));
    showToast(`Deleted expense: "${expToDelete?.merchant || 'Expense'}"`);
  };

  // Edit expense title (via 3-dot menu)
  const handleEditExpenseTitle = (expId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setExpenses((prev) =>
      prev.map((e) => (e.id === expId ? { ...e, merchant: trimmed } : e))
    );
    showToast(`Updated expense to "${trimmed}"`);
  };

  // Add new task card to deck
  const handleAddTask = (newTask: {
    name: string;
    timeToBeDone?: string;
    startTime?: string;
    importance?: TodayTaskItem['importance'];
    bio?: string;
  }) => {
    const time = newTask.startTime || newTask.timeToBeDone || '03:00 PM';
    const colors = ['#D79A6B', '#9EAFA0', '#D6C5B3', '#CAC7C0', '#F1D97E', '#B9897B'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newTaskCard: FileCardItem = {
      id: 'task-' + Date.now(),
      title: newTask.name,
      subtitle: `Starts at ${time}`,
      startTime: time,
      reminderSet: true,
      category: 'Daily Focus',
      color: randomColor,
      textColor: '#141413',
      completed: false,
      fileCount: 1,
      fileSize: 'Today',
      description: newTask.bio || 'Scheduled operational task for today.',
      keyInsights: [
        'Target completion within scheduled window',
        'Maintain uninterrupted focus block'
      ]
    };

    setFiles((prev) => [newTaskCard, ...prev]);
    showToast(`Scheduled task: ${newTask.name} for ${time}`);
    playReminderChime();

    setSystemState((sys) => ({
      ...sys,
      activeNotifications: [
        {
          id: 'remind-' + newTaskCard.id,
          title: `⏰ Reminder: ${newTask.name}`,
          body: `Scheduled start at ${time}. Tap to focus.`,
          time
        },
        ...sys.activeNotifications
      ]
    }));
  };

  return (
    <div className="min-h-screen w-full bg-[#E5E3DD] flex flex-col items-center justify-center relative p-0 sm:p-4 md:p-6 overflow-x-hidden font-sans">
      {/* Desktop Helper Bar: Quick Controls */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[420px] mb-2 px-2 text-xs font-semibold text-[#141413]/70">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Android 15 • Pixel 9 Pro</span>
        </div>
        <button
          onClick={handleToggleDeviceFrame}
          className="hover:text-[#141413] flex items-center space-x-1 bg-white/60 hover:bg-white px-2.5 py-1 rounded-full border border-black/5 transition-all shadow-2xs"
        >
          {systemState.deviceFrame === 'pixel' ? (
            <>
              <Monitor className="w-3.5 h-3.5" />
              <span>Edge-to-Edge</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pixel Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Device Chassis Wrapper */}
      <div className="relative flex items-center justify-center w-full max-w-[420px]">
        {/* Physical Pixel Phone Buttons on Outer Frame */}
        {systemState.deviceFrame === 'pixel' && (
          <>
            {/* Power Button (Right side) */}
            <button
              onClick={() => setIsScreenStandby(!isScreenStandby)}
              title="Power button (standby/wake)"
              className="hidden sm:block absolute -right-2 top-28 w-1.5 h-10 bg-[#3a3a3a] hover:bg-[#FF5722] rounded-r-md transition-colors cursor-pointer z-0"
            />
            {/* Volume Rocker (Right side) */}
            <button
              onClick={() => showToast('Volume: 75%')}
              title="Volume Rocker"
              className="hidden sm:block absolute -right-2 top-42 w-1.5 h-18 bg-[#3a3a3a] hover:bg-[#555] rounded-r-md transition-colors cursor-pointer z-0"
            />
          </>
        )}

        {/* Android Phone Frame Screen */}
        <main
          className={`w-full bg-[#FAF9F5] text-[#141413] relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
            systemState.deviceFrame === 'pixel'
              ? 'max-w-[404px] h-[100dvh] sm:h-[852px] sm:rounded-[48px] sm:border-[8px] sm:border-[#222120] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/10'
              : 'w-full max-w-[420px] h-[100dvh] rounded-none border-0 shadow-none'
          }`}
        >
          {/* Simulated Screen Standby Overlay */}
          {isScreenStandby ? (
            <div
              onClick={() => setIsScreenStandby(false)}
              className="absolute inset-0 z-50 bg-black text-white/70 flex flex-col items-center justify-center p-6 text-center cursor-pointer animate-fadeIn"
            >
              <Power className="w-8 h-8 text-[#FF5722] mb-3 animate-pulse" />
              <p className="text-3xl font-light tracking-tight font-sans text-white">
                {systemState.timeStr}
              </p>
              <p className="text-xs text-white/50 mt-1">Tuesday, 11 Feb</p>
              <p className="text-[11px] text-white/40 mt-8 font-mono">
                Tap screen to wake Pixel device
              </p>
            </div>
          ) : (
            <>
              {/* Android Top Status Bar */}
              <AndroidStatusBar
                systemState={systemState}
                onToggleQuickSettings={() => setIsQuickSettingsOpen(true)}
                spaceTitle={currentSpace}
              />

              {/* Scrollable Main Screen Content */}
              <div
                id="main-scroll-container"
                className="flex-1 overflow-y-auto overflow-x-hidden relative"
              >
                {currentSpace === 'daily-stack' && (
                  <DailyStackView
                    files={files}
                    expenses={expenses}
                    activeSubTab={activeDailySubTab}
                    onSelectSubTab={setActiveDailySubTab}
                    onDeleteCard={handleDeleteTask}
                    onEditTitle={handleEditTaskTitle}
                    onDeleteExpense={handleDeleteExpense}
                    onEditExpenseTitle={handleEditExpenseTitle}
                    onAddExpense={() => setIsQuickAddOpen(true)}
                    onAddTaskClick={() => setIsQuickAddOpen(true)}
                    onToast={showToast}
                  />
                )}

                {currentSpace === 'focus-tracker' && (
                  activeTimerSession ? (
                    <FocusTimerView
                      session={activeTimerSession}
                      onClose={() => setActiveTimerSession(null)}
                      onToast={showToast}
                      onCompleteSession={(id) => handleToggleFocusSession(id)}
                    />
                  ) : (
                    <FocusTrackerView
                      days={calendarDays}
                      sessions={focusSessions}
                      onToggleSession={handleToggleFocusSession}
                      onAddSession={() => setIsQuickAddOpen(true)}
                      onDeleteSession={handleDeleteFocusSession}
                      onEditSessionTitle={handleEditFocusSessionTitle}
                      onDayClick={(dayNum) => showToast(`Selected February ${dayNum}`)}
                      onStartTimer={(session) => {
                        setActiveTimerSession(session);
                        showToast(`Opened Focus Timer for "${session.title}"`);
                      }}
                    />
                  )
                )}

                {currentSpace === 'goals-horizon' && (
                  <GoalsHorizonView
                    milestones={milestones}
                    onToggleMilestone={handleToggleMilestone}
                    onAddMilestone={() => setIsQuickAddOpen(true)}
                    onDeleteMilestone={handleDeleteMilestone}
                    onEditMilestone={handleEditMilestone}
                    subTab={activeGoalsSubTab}
                    onSelectSubTab={setActiveGoalsSubTab}
                  />
                )}

                {currentSpace === 'reading-library' && (
                  <ReadingLibraryView
                    deskBooks={deskBooks}
                    queueBooks={queueBooks}
                    onActivateBook={handleActivateBook}
                    onLogPages={handleLogPages}
                    onOpenAddBook={() => setIsQuickAddOpen(true)}
                    onDeleteBook={handleDeleteBook}
                    onEditBook={handleEditBook}
                    subTab={activeLibrarySubTab}
                    onSelectSubTab={setActiveLibrarySubTab}
                  />
                )}
              </div>

              {/* Floating Bottom Navigation Capsule Dock (Images 1, 3, 8) */}
              <BottomDock
                currentSpace={currentSpace}
                onSelectSpace={handleSelectSpace}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                onOpenSpacesDrawer={() => setIsSpacesDrawerOpen(true)}
                activeSubTab={
                  currentSpace === 'daily-stack'
                    ? activeDailySubTab
                    : currentSpace === 'goals-horizon'
                    ? activeGoalsSubTab
                    : activeLibrarySubTab
                }
                onSelectSubTab={(tab) => {
                  if (currentSpace === 'daily-stack') setActiveDailySubTab(tab as DailyStackTab);
                  if (currentSpace === 'goals-horizon') setActiveGoalsSubTab(tab as 'orbit' | 'cards');
                  if (currentSpace === 'reading-library') setActiveLibrarySubTab(tab as 'desk' | 'queue');
                }}
              />

              {/* Android System Navigation Bar (Gesture Pill or 3-Button) */}
              <AndroidNavBar
                navStyle={systemState.navStyle}
                onBack={handleAndroidBack}
                onHome={handleAndroidHome}
                onRecents={handleAndroidRecents}
                onToggleNavStyle={handleToggleNavStyle}
              />
            </>
          )}

          {/* Quick Settings & Notifications Pull-Down Shade */}
          {isQuickSettingsOpen && (
            <AndroidQuickSettings
              systemState={systemState}
              onClose={() => setIsQuickSettingsOpen(false)}
              onToggleWifi={() =>
                setSystemState((p) => ({ ...p, wifiConnected: !p.wifiConnected }))
              }
              onToggleSound={() =>
                setSystemState((p) => ({ ...p, soundEnabled: !p.soundEnabled }))
              }
              onToggleDnd={() =>
                setSystemState((p) => ({ ...p, dndEnabled: !p.dndEnabled }))
              }
              onToggleNavStyle={handleToggleNavStyle}
              onToggleDeviceFrame={handleToggleDeviceFrame}
              onClearNotifications={() =>
                setSystemState((p) => ({ ...p, activeNotifications: [] }))
              }
            />
          )}

          {/* Android Recents Multitasking Switcher */}
          <AndroidRecentsOverview
            isOpen={isRecentsOpen}
            onClose={() => setIsRecentsOpen(false)}
            onSelectSpace={handleSelectSpace}
          />

          {/* Slide-out Spaces Navigation Drawer (Right edge handle) */}
          <SpacesDrawer
            currentSpace={currentSpace}
            isOpen={isSpacesDrawerOpen}
            onToggle={() => setIsSpacesDrawerOpen(!isSpacesDrawerOpen)}
            onSelectSpace={handleSelectSpace}
          />

          {/* Card Reader / Discovery Modal */}
          <FileDetailModal
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
            onToast={showToast}
            onToggleReminder={handleToggleReminder}
            onTriggerReminder={handleTriggerReminder}
            onToggleComplete={handleToggleTaskComplete}
            onAddTask={handleAddTask}
          />

          {/* Quick Record Modal */}
          {isQuickAddOpen && (
            <QuickAddModal
              initialTab={
                currentSpace === 'daily-stack'
                  ? (activeDailySubTab === 'expenses' ? 'expense' : 'task')
                  : currentSpace === 'goals-horizon'
                  ? 'milestone'
                  : currentSpace === 'focus-tracker'
                  ? 'focus'
                  : currentSpace === 'reading-library'
                  ? 'book'
                  : 'expense'
              }
              onClose={() => setIsQuickAddOpen(false)}
              onAddMilestone={(m) => setMilestones((prev) => [m, ...prev])}
              onAddFocusSession={(s) => setFocusSessions((prev) => [s, ...prev])}
              onAddBook={(b) => setDeskBooks((prev) => [b, ...prev])}
              onAddExpense={(e) => setExpenses((prev) => [e, ...prev])}
              onAddTask={handleAddTask}
              onToast={showToast}
            />
          )}

          {/* Android Toast Notification */}
          <AndroidToast
            message={toastMessage}
            onDismiss={() => setToastMessage(null)}
          />
        </main>
      </div>
    </div>
  );
}
