import React from 'react';
import { HeartPulse, Siren, Sparkles, PanelLeft } from 'lucide-react';

interface NavbarProps {
  onTriggerEmergency: () => void;
  userLocationName?: string;
  onToggleSidebar: () => void;
  onOpenSettings?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onTriggerEmergency,
  onToggleSidebar,
  isSidebarOpen = true,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-emerald-300 dark:border-slate-800 px-4 py-3 shrink-0">
      <div className="flex items-center justify-between">
        {/* Left Section: Sidebar Toggle + Title */}
        <div className="flex items-center gap-3">
          {/* Bold Vibrant Emerald Green Button with White Icon */}
          <button
            onClick={onToggleSidebar}
            className="sidebar-toggle-btn p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 shadow-md shadow-emerald-600/30 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20 dark:text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Ẩn/Hiện Menu Sidebar (ChatGPT/Gemini Style)"
          >
            <PanelLeft className="w-5 h-5 text-white dark:text-sky-400" />
          </button>

          {/* Show Title & Logo in Navbar when Sidebar is closed */}
          {!isSidebarOpen && (
            <div className="flex items-center gap-2.5 animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 dark:bg-sky-600 flex items-center justify-center shadow-lg">
                <HeartPulse className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-extrabold text-emerald-800 dark:text-sky-400">
                  LifeLink AI
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-100 text-emerald-950 dark:bg-white/20 dark:text-white border border-emerald-300 dark:border-white/30 rounded-md flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-700 dark:text-white" /> MVP
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: 1-Tap Emergency Beacon Button ONLY */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerEmergency}
            className="group relative px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all active:scale-95 animate-beacon cursor-pointer"
          >
            <Siren className="w-4 h-4 text-red-100 animate-bounce" />
            <span className="uppercase tracking-wider">Cấp cứu 1-Tap</span>
          </button>
        </div>
      </div>
    </header>
  );
};
