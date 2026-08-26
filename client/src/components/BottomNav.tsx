import React from 'react';
import { MessageSquareText, Hospital, Map, User, Info } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'chat', label: 'Triage AI', icon: MessageSquareText },
    { id: 'hospitals', label: 'Bệnh viện', icon: Hospital },
    { id: 'map', label: 'Bản đồ', icon: Map },
    { id: 'profile', label: 'Hồ sơ Y tế', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden flex flex-col">
      {/* Scope Disclaimer Banner */}
      <div className="bg-slate-950/95 border-t border-slate-800/80 px-2 py-1 text-center text-[9px] font-medium text-slate-400 backdrop-blur-md flex items-center justify-center gap-1">
        <Info className="w-2.5 h-2.5 text-sky-400 shrink-0" />
        <span className="truncate">Hiện tại chúng tôi chỉ mới phát triển các vị trí bệnh viện tại khu vực Bình Thạnh</span>
      </div>

      {/* Main Tab Navigation Bar */}
      <nav className="glass-panel border-t border-slate-800 py-1.5 px-3">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-sky-400 bg-sky-500/10 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
