import React from 'react';
import { Wifi, Signal, Battery, Bell, Sparkles } from 'lucide-react';
import { AndroidSystemState } from '../types';

interface AndroidStatusBarProps {
  systemState: AndroidSystemState;
  onToggleQuickSettings: () => void;
  spaceTitle: string;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  systemState,
  onToggleQuickSettings,
  spaceTitle
}) => {
  return (
    <header
      onClick={onToggleQuickSettings}
      className="w-full pt-2.5 pb-1 px-5 flex justify-between items-center z-40 select-none cursor-pointer group hover:bg-black/5 transition-colors"
      title="Tap to pull down Android Quick Settings & Notifications"
    >
      {/* Left: Android Time & Notification Badges */}
      <div className="flex items-center space-x-2 text-[#141413]">
        <span className="text-[13px] font-semibold tracking-tight font-sans">
          {systemState.timeStr}
        </span>
        <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] inline-block animate-pulse" />
          <Bell className="w-3 h-3 text-[#141413]" />
        </div>
      </div>

      {/* Center: Android Flagship Punch-Hole Camera (Google Pixel style) */}
      <div className="flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-[#141413] ring-1 ring-black/20 flex items-center justify-center shadow-inner relative">
          <div className="w-1.5 h-1.5 rounded-full bg-[#242426] relative">
            {/* Camera lens reflection shimmer */}
            <div className="w-0.5 h-0.5 rounded-full bg-blue-400/70 absolute top-0 right-0" />
          </div>
        </div>
      </div>

      {/* Right: Android System Status Icons (Wi-Fi, 5G, Battery) */}
      <div className="flex items-center space-x-2 text-[#141413]">
        {/* 5G Badge */}
        <div className="flex items-center space-x-0.5">
          <span className="text-[10px] font-bold tracking-tighter font-mono opacity-85">5G</span>
          <Signal className="w-3.5 h-3.5 fill-current" />
        </div>

        {/* Wi-Fi Icon */}
        <Wifi className="w-3.5 h-3.5" />

        {/* Battery with percentage */}
        <div className="flex items-center space-x-1">
          <span className="text-[11px] font-medium font-mono">{systemState.batteryPct}%</span>
          <div className="w-5 h-2.5 border-[1.5px] border-[#141413] rounded-[3px] p-[1px] flex items-center relative">
            <div
              className="h-full bg-[#141413] rounded-[1px] transition-all"
              style={{ width: `${systemState.batteryPct}%` }}
            />
            <div className="w-[1px] h-1 bg-[#141413] absolute -right-[2.5px] rounded-r-xs" />
          </div>
        </div>
      </div>
    </header>
  );
};
