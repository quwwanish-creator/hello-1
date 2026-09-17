import React from 'react';
import { Layers, Calendar, Target, BookOpen, X, Trash2 } from 'lucide-react';
import { AppSpace } from '../types';

interface AndroidRecentsOverviewProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpace: (space: AppSpace) => void;
}

export const AndroidRecentsOverview: React.FC<AndroidRecentsOverviewProps> = ({
  isOpen,
  onClose,
  onSelectSpace
}) => {
  if (!isOpen) return null;

  const tasks: { id: AppSpace; title: string; subtitle: string; icon: any; color: string }[] = [
    {
      id: 'daily-stack',
      title: 'Daily Stack',
      subtitle: 'Recents files & Monthly Expenses',
      icon: Layers,
      color: '#D79A6B'
    },
    {
      id: 'focus-tracker',
      title: 'Focus Tracker',
      subtitle: 'Daily Habit Matrix & Live Timer',
      icon: Calendar,
      color: '#FF5722'
    },
    {
      id: 'goals-horizon',
      title: 'Goals 2027',
      subtitle: 'Concentric Orbital Horizon & Milestones',
      icon: Target,
      color: '#9BB8A7'
    },
    {
      id: 'reading-library',
      title: 'Reading Library',
      subtitle: 'Curated Reading & Knowledge Stack',
      icon: BookOpen,
      color: '#C6A584'
    }
  ];

  return (
    <div className="absolute inset-0 z-50 bg-[#141413]/85 backdrop-blur-md flex flex-col justify-between p-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between text-white pt-6">
        <span className="text-sm font-bold tracking-tight">Active Tasks (4)</span>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Task Thumbnails Slider */}
      <div className="flex items-center space-x-4 overflow-x-auto py-4 px-2 no-scrollbar">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <div
              key={task.id}
              onClick={() => {
                onSelectSpace(task.id);
                onClose();
              }}
              className="w-56 h-80 rounded-[32px] bg-[#FAF9F5] text-[#141413] shadow-2xl p-5 flex flex-col justify-between shrink-0 cursor-pointer hover:scale-102 active:scale-98 transition-all border border-white/15"
            >
              {/* Card Header */}
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: task.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold truncate">{task.title}</h4>
                  <p className="text-[10px] text-[#141413]/50 truncate">Kinfolk Android</p>
                </div>
              </div>

              {/* Card Mini Preview Wireframe */}
              <div className="flex-1 my-3 bg-[#efeeea] rounded-2xl p-3 flex flex-col justify-center items-center text-center space-y-2">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: task.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-[#141413]/70">{task.subtitle}</p>
              </div>

              {/* Bottom Card Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[11px] font-bold text-[#141413]/60">
                <span>Switch to Space</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear All Tasks Button */}
      <div className="flex justify-center pb-4">
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-2 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>
    </div>
  );
};
