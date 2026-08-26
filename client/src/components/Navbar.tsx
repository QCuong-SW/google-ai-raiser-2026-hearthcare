import React from 'react';
import { HeartPulse, Siren, PanelLeft } from 'lucide-react';
import type { AuthUser } from '../types';

interface NavbarProps {
  onTriggerEmergency: () => void;
  userLocationName?: string;
  onToggleSidebar: () => void;
  onOpenSettings?: () => void;
  isSidebarOpen?: boolean;
  user?: AuthUser | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onTriggerEmergency,
  onToggleSidebar,
  isSidebarOpen = true,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-emerald-300 px-4 py-3 shrink-0 shadow-xs">
      <div className="flex items-center justify-between">
        {/* Left Section: Sidebar Toggle + Title */}
        <div className="flex items-center gap-3">
          {/* Bold Vibrant Emerald Green Button with White Icon */}
          <button
            onClick={onToggleSidebar}
            className="sidebar-toggle-btn p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            title="Ẩn/Hiện Menu Sidebar"
          >
            <PanelLeft className="w-5 h-5 text-white" />
          </button>

          {/* Show Title & Logo in Navbar when Sidebar is closed */}
          {!isSidebarOpen && (
            <div className="flex items-center gap-2.5 animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
                <HeartPulse className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-extrabold text-emerald-800">
                  LifeLink AI
                </h1>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Emergency 1-Tap Button Only */}
        <div className="flex items-center gap-2.5">
          {/* Emergency 1-Tap Button */}
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
