import { BookItem, CalendarDayItem, ExpenseItem, FileCardItem, FocusSessionItem, HorizonMilestone } from '../types';

export const INITIAL_FILES: FileCardItem[] = [];

export const INITIAL_EXPENSES: ExpenseItem[] = [];

export const INITIAL_CALENDAR_DAYS: CalendarDayItem[] = [
  // Row 1: 5 ghost days, then Sat/Sun
  { dayNumber: 27, status: 'blank', hoursLogged: 0 },
  { dayNumber: 28, status: 'blank', hoursLogged: 0 },
  { dayNumber: 29, status: 'blank', hoursLogged: 0 },
  { dayNumber: 30, status: 'blank', hoursLogged: 0 },
  { dayNumber: 31, status: 'blank', hoursLogged: 0 },
  { dayNumber: 1, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 2, status: 'upcoming', hoursLogged: 0 },

  // Row 2: Feb 3 to Feb 9 all upcoming with 0 hours logged
  { dayNumber: 3, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 4, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 5, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 6, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 7, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 8, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 9, status: 'upcoming', hoursLogged: 0 },

  // Row 3: Feb 10 upcoming, Feb 11 (ACTIVE TODAY) starting with 0 hours logged
  { dayNumber: 10, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 11, status: 'active', hoursLogged: 0 },
  { dayNumber: 12, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 13, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 14, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 15, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 16, status: 'upcoming', hoursLogged: 0 },

  // Row 4: Feb 17 to Feb 23 upcoming
  { dayNumber: 17, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 18, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 19, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 20, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 21, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 22, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 23, status: 'upcoming', hoursLogged: 0 },

  // Row 5: Feb 24 to 28 upcoming
  { dayNumber: 24, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 25, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 26, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 27, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 28, status: 'upcoming', hoursLogged: 0 },
  { dayNumber: 1, status: 'blank', hoursLogged: 0 },
  { dayNumber: 2, status: 'blank', hoursLogged: 0 }
];

export const INITIAL_FOCUS_SESSIONS: FocusSessionItem[] = [];

export const INITIAL_MILESTONES: HorizonMilestone[] = [];

export const INITIAL_QUEUE_BOOKS: BookItem[] = [];

export const INITIAL_DESK_BOOKS: BookItem[] = [];

