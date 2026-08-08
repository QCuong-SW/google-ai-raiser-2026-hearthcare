import React from 'react';
import { MessageSquareText, Hospital, Map, User, History } from 'lucide-react';

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
    { id: 'history', label: 'Lịch sử', icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-slate-800 py-2 px-3 md:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
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
  );
};
