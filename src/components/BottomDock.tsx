import React from 'react';
import { Plus, Layers, Calendar, Target, BookOpen } from 'lucide-react';
import { AppSpace } from '../types';

interface BottomDockProps {
  currentSpace: AppSpace;
  onSelectSpace: (space: AppSpace) => void;
  onOpenQuickAdd: () => void;
  onOpenSpacesDrawer?: () => void;
  activeSubTab?: string;
  onSelectSubTab?: (subTab: string) => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  currentSpace,
  onSelectSpace,
  onOpenQuickAdd
}) => {
  const navItems: { id: AppSpace; label: string; icon: React.ReactNode }[] = [
    {
      id: 'daily-stack',
      label: 'Daily Stack',
      icon: <Layers className="w-5 h-5" />
    },
    {
      id: 'focus-tracker',
      label: 'Focus Tracker',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 'goals-horizon',
      label: 'Goals 2027',
      icon: <Target className="w-5 h-5" />
    },
    {
      id: 'reading-library',
      label: 'Reading Library',
      icon: <BookOpen className="w-5 h-5" />
    }
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="absolute bottom-5 inset-x-0 flex justify-center z-30 pointer-events-none px-4"
    >
      <div className="pointer-events-auto bg-[#141413]/95 backdrop-blur-xl px-3 py-2 rounded-full shadow-[0_14px_36px_rgba(0,0,0,0.35)] flex items-center space-x-1.5 sm:space-x-2 border border-white/10 text-white">
        {/* Screen 1: Daily Stack (Icon Only) */}
        <button
          onClick={() => onSelectSpace(navItems[0].id)}
          aria-label={navItems[0].label}
          title={navItems[0].label}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
            currentSpace === navItems[0].id
              ? 'bg-white text-[#141413] shadow-md scale-105'
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          {navItems[0].icon}
        </button>

        {/* Screen 2: Focus Tracker (Icon Only) */}
        <button
          onClick={() => onSelectSpace(navItems[1].id)}
          aria-label={navItems[1].label}
          title={navItems[1].label}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
            currentSpace === navItems[1].id
              ? 'bg-white text-[#141413] shadow-md scale-105'
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          {navItems[1].icon}
        </button>

        {/* Center Elevated Action: Quick Add (+) */}
        <button
          onClick={onOpenQuickAdd}
          aria-label="Quick Add"
          title="Quick Add"
          className="w-12 h-12 -my-1 mx-1 rounded-full bg-[#FF5722] hover:bg-[#ff6f43] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(255,87,34,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[2.8]" />
        </button>

        {/* Screen 3: Goals 2027 (Icon Only) */}
        <button
          onClick={() => onSelectSpace(navItems[2].id)}
          aria-label={navItems[2].label}
          title={navItems[2].label}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
            currentSpace === navItems[2].id
              ? 'bg-white text-[#141413] shadow-md scale-105'
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          {navItems[2].icon}
        </button>

        {/* Screen 4: Reading Library (Icon Only) */}
        <button
          onClick={() => onSelectSpace(navItems[3].id)}
          aria-label={navItems[3].label}
          title={navItems[3].label}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
            currentSpace === navItems[3].id
              ? 'bg-white text-[#141413] shadow-md scale-105'
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          {navItems[3].icon}
        </button>
      </div>
    </nav>
  );
};
