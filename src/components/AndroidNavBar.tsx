import React from 'react';
import { ChevronLeft, Circle, Square } from 'lucide-react';
import { AndroidSystemState } from '../types';

interface AndroidNavBarProps {
  navStyle: 'gesture' | '3-button';
  onBack: () => void;
  onHome: () => void;
  onRecents: () => void;
  onToggleNavStyle: () => void;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  navStyle,
  onBack,
  onHome,
  onRecents,
  onToggleNavStyle
}) => {
  return (
    <footer className="w-full pt-1 pb-2 flex flex-col items-center justify-center select-none shrink-0 z-40">
      {navStyle === 'gesture' ? (
        <div className="flex flex-col items-center group cursor-pointer" onClick={onToggleNavStyle} title="Tap to switch Android navigation style">
          {/* Android Gesture Navigation Pill */}
          <div className="w-28 h-1 bg-[#141413]/35 rounded-full transition-all group-hover:bg-[#141413]/70 group-hover:w-32 active:scale-95" />
          <span className="text-[9px] text-[#141413]/40 tracking-wider font-mono opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
            Android Gesture Bar
          </span>
        </div>
      ) : (
        /* Classic Android 3-Button Navigation (Back, Home, Recents) */
        <div className="w-full max-w-[280px] h-9 px-6 flex items-center justify-between text-[#141413]/70">
          <button
            onClick={onBack}
            aria-label="Android Back Button"
            className="w-10 h-8 flex items-center justify-center rounded-full hover:bg-black/10 active:scale-90 transition-all text-[#141413]"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            onClick={onHome}
            aria-label="Android Home Button"
            className="w-10 h-8 flex items-center justify-center rounded-full hover:bg-black/10 active:scale-90 transition-all text-[#141413]"
          >
            <Circle className="w-4 h-4 fill-current stroke-none" />
          </button>
          <button
            onClick={onRecents}
            aria-label="Android Recents Button"
            className="w-10 h-8 flex items-center justify-center rounded-full hover:bg-black/10 active:scale-90 transition-all text-[#141413]"
          >
            <Square className="w-3.5 h-3.5 fill-current stroke-none rounded-xs" />
          </button>
        </div>
      )}
    </footer>
  );
};
