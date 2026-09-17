import React from 'react';
import { Wifi, Volume2, Moon, Sparkles, Smartphone, Layers, X, Trash2, CheckCircle2, Sliders } from 'lucide-react';
import { AndroidSystemState } from '../types';

interface AndroidQuickSettingsProps {
  systemState: AndroidSystemState;
  onClose: () => void;
  onToggleWifi: () => void;
  onToggleSound: () => void;
  onToggleDnd: () => void;
  onToggleNavStyle: () => void;
  onToggleDeviceFrame: () => void;
  onClearNotifications: () => void;
}

export const AndroidQuickSettings: React.FC<AndroidQuickSettingsProps> = ({
  systemState,
  onClose,
  onToggleWifi,
  onToggleSound,
  onToggleDnd,
  onToggleNavStyle,
  onToggleDeviceFrame,
  onClearNotifications
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-[#141413]/40 backdrop-blur-md flex flex-col justify-start animate-fadeIn">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Android Quick Settings Drawer Sheet */}
      <div className="w-full bg-[#1e1e1e] text-white rounded-b-[36px] shadow-2xl p-5 pt-3 pb-6 flex flex-col space-y-4 border-b border-white/10 max-h-[85%] overflow-y-auto">
        {/* Pull handle */}
        <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto cursor-pointer" onClick={onClose} />

        {/* Header with Time & Quick Actions */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-2xl font-bold tracking-tight font-sans text-white">
              {systemState.timeStr}
            </span>
            <p className="text-[11px] text-white/50">Tuesday, 11 Feb • Android 15</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Material You Quick Tiles Grid (2x3) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Tile 1: Internet */}
          <button
            onClick={onToggleWifi}
            className={`p-3 rounded-2xl flex items-center space-x-3 transition-all ${
              systemState.wifiConnected ? 'bg-[#D79A6B] text-[#141413] font-semibold' : 'bg-white/10 text-white/70'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-black/15 flex items-center justify-center shrink-0">
              <Wifi className="w-4 h-4" />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold truncate">{systemState.wifiConnected ? 'Kinfolk-5G' : 'Internet Off'}</p>
              <p className="text-[10px] opacity-75">Connected</p>
            </div>
          </button>

          {/* Tile 2: Sound / Haptics */}
          <button
            onClick={onToggleSound}
            className={`p-3 rounded-2xl flex items-center space-x-3 transition-all ${
              systemState.soundEnabled ? 'bg-[#9BB8A7] text-[#141413] font-semibold' : 'bg-white/10 text-white/70'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-black/15 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold truncate">{systemState.soundEnabled ? 'Haptics & Audio' : 'Vibrate Only'}</p>
              <p className="text-[10px] opacity-75">{systemState.soundEnabled ? 'Active' : 'Muted'}</p>
            </div>
          </button>

          {/* Tile 3: Do Not Disturb */}
          <button
            onClick={onToggleDnd}
            className={`p-3 rounded-2xl flex items-center space-x-3 transition-all ${
              systemState.dndEnabled ? 'bg-[#FF5722] text-white font-semibold' : 'bg-white/10 text-white/70'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-black/15 flex items-center justify-center shrink-0">
              <Moon className="w-4 h-4" />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold truncate">Focus Do Not Disturb</p>
              <p className="text-[10px] opacity-75">{systemState.dndEnabled ? 'Silenced' : 'Normal'}</p>
            </div>
          </button>

          {/* Tile 4: Navigation Style */}
          <button
            onClick={onToggleNavStyle}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white flex items-center space-x-3 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4 text-[#F1D97E]" />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold truncate">Nav: {systemState.navStyle === 'gesture' ? 'Gestures' : '3-Button'}</p>
              <p className="text-[10px] opacity-75">Tap to switch</p>
            </div>
          </button>

          {/* Tile 5: Device Frame Toggle */}
          <button
            onClick={onToggleDeviceFrame}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white flex items-center space-x-3 transition-all col-span-2"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-[#9BB8A7]" />
            </div>
            <div className="text-left overflow-hidden flex-1">
              <p className="text-xs font-bold truncate">
                View: {systemState.deviceFrame === 'pixel' ? 'Pixel 9 Phone Shell' : 'Edge-to-Edge Fullscreen'}
              </p>
              <p className="text-[10px] opacity-75">Tap to toggle mobile device frame</p>
            </div>
          </button>
        </div>

        {/* Notifications Section */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
              Android Notifications ({systemState.activeNotifications.length})
            </span>
            {systemState.activeNotifications.length > 0 && (
              <button
                onClick={onClearNotifications}
                className="text-[11px] text-[#FF5722] hover:text-[#ff784e] flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {systemState.activeNotifications.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-3">No new notifications</p>
          ) : (
            <div className="space-y-2">
              {systemState.activeNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 flex items-start space-x-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FF5722]/20 flex items-center justify-center text-[#FF5722] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                      <span className="text-[10px] text-white/40 font-mono">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-white/70 mt-0.5 leading-snug">{notif.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
