export type AppSpace = 'daily-stack' | 'focus-tracker' | 'goals-horizon' | 'reading-library';

export type DailyStackTab = 'files' | 'expenses';

export interface TodayTaskItem {
  id: string;
  name: string;
  timeToBeDone: string;
  importance: 'Critical' | 'High' | 'Medium' | 'Normal';
  bio: string;
  completed: boolean;
}

export interface FileCardItem {
  id: string;
  title: string;
  subtitle: string;
  startTime: string;
  reminderSet: boolean;
  reminderTriggered?: boolean;
  category: string;
  color: string;
  textColor: string;
  completed?: boolean;
  fileCount?: number;
  fileSize?: string;
  description: string;
  keyInsights: string[];
  tasks?: TodayTaskItem[];
}

export interface ExpenseItem {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  color: string;
  iconName: string;
  time?: string;
}

export interface FocusSessionItem {
  id: string;
  title: string;
  timeRange: string;
  duration: string;
  durationMinutes: number;
  completed: boolean;
  isTimer?: boolean;
  color?: string;
}

export interface CalendarDayItem {
  dayNumber: number;
  status: 'blank' | 'completed' | 'active' | 'upcoming';
  hoursLogged: number;
}

export interface HorizonMilestone {
  id: string;
  title: string;
  category: string;
  dateLabel: string;
  progressPercent?: number;
  metricLabel?: string;
  color: string;
  textColor: string;
  iconName: string;
  completed: boolean;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  tag: string;
  coverImage?: string;
  color?: string;
  startedAt?: string;
}

export interface AndroidSystemState {
  timeStr: string;
  batteryPct: number;
  isCharging: boolean;
  wifiConnected: boolean;
  cellular5G: boolean;
  soundEnabled: boolean;
  dndEnabled: boolean;
  navStyle: 'gesture' | '3-button';
  deviceFrame: 'pixel' | 'edge-to-edge';
  quickSettingsOpen: boolean;
  activeNotifications: Array<{
    id: string;
    title: string;
    body: string;
    time: string;
  }>;
}
