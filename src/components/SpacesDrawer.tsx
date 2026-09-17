import React from 'react';
import { ChevronLeft, X, Layers, Calendar, Target, BookOpen, Smartphone } from 'lucide-react';
import { AppSpace } from '../types';

interface SpacesDrawerProps {
  currentSpace: AppSpace;
  isOpen: boolean;
  onToggle: () => void;
  onSelectSpace: (space: AppSpace) => void;
}

export const SpacesDrawer: React.FC<SpacesDrawerProps> = ({
  currentSpace,
  isOpen,
  onToggle,
  onSelectSpace
}) => {
  const spaces: { id: AppSpace; label: string; icon: React.ReactNode }[] = [
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
      label: 'Library',
      icon: <BookOpen className="w-5 h-5" />
    }
  ];

  return (
    <>
      {/* Floating Toggle Tab Handle on Right Edge (matches reference design) */}
      <button
        onClick={onToggle}
        aria-label="Toggle Spaces Drawer"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-10 h-14 bg-[#f5f4f0]/95 backdrop-blur-md rounded-l-2xl shadow-[0_4px_20px_rgba(20,20,19,0.12)] border-y border-l border-[#141413]/10 flex items-center justify-center cursor-pointer select-none hover:w-11 transition-all active:scale-95"
      >
        <ChevronLeft
          className={`w-5 h-5 text-[#141413] transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-[#141413]/25 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Slide-out Drawer Panel */}
      <aside
        className={`fixed right-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] flex flex-col justify-center items-end pr-4 pointer-events-none transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="pointer-events-auto bg-[#FAF9F5]/95 backdrop-blur-2xl p-5 rounded-[32px] shadow-[0_20px_50px_rgba(20,20,19,0.18)] border border-[#141413]/10 flex flex-col gap-4 w-full">
          {/* Drawer Header */}
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#141413]/5 px-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#141413]/50">
              Spaces
            </span>
            <button
              onClick={onToggle}
              className="w-8 h-8 rounded-full bg-[#efeeea] hover:bg-[#e3e2df] flex items-center justify-center transition-colors text-[#141413]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-2 w-full">
            {spaces.map((item) => {
              const isActive = currentSpace === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSpace(item.id);
                    onToggle();
                  }}
                  className={`flex items-center justify-between gap-4 p-2 pl-4 rounded-full transition-all group ${
                    isActive
                      ? 'bg-[#141413] text-white shadow-md font-semibold'
                      : 'text-[#141413]/70 hover:text-[#141413] hover:bg-[#efeeea]'
                  }`}
                >
                  <span className="text-sm font-medium tracking-tight group-hover:translate-x-0.5 transition-transform">
                    {item.label}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#efeeea] text-[#141413] group-hover:bg-[#e3e2df]'
                    }`}
                  >
                    {item.icon}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
