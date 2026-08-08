import React, { useState, useEffect } from 'react';
import { Plus, Bot, Hospital as HospitalIcon, MapPin, Settings, X, HeartPulse, User as UserIcon, PhoneCall, MessageSquare, ChevronRight, Trash2 } from 'lucide-react';
import { fetchChatSessions, deleteChatSession } from '../services/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
  activeSessionId?: string | null;
  onSelectSession?: (sessionId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onNewChat,
  activeSessionId,
  onSelectSession,
}) => {
  const [isChatTreeExpanded, setIsChatTreeExpanded] = useState(true);
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);

  // Load chat sessions from Backend API
  const loadSessions = async () => {
    try {
      const data = await fetchChatSessions();
      setSessions(data);
    } catch (err) {
      console.warn('Could not load sidebar chat sessions:', err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [activeSessionId, activeTab]);

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteChatSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const menuItems = [
    { id: 'chat', label: 'AI Triage & Tư vấn', icon: Bot, badge: 'Realtime AI' },
    { id: 'hospitals', label: 'Danh sách Bệnh viện', icon: HospitalIcon, badge: '5-Factor Rank' },
    { id: 'map', label: 'Bản đồ Khẩn cấp', icon: MapPin, badge: 'GPS Maps' },
    { id: 'contact', label: 'Liên hệ & Hỗ trợ', icon: PhoneCall, badge: 'Hotline 24/7' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-40 h-full bg-slate-900/95 md:bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isOpen
            ? 'w-72 translate-x-0 opacity-100'
            : 'w-0 -translate-x-full opacity-0 pointer-events-none border-none'
        }`}
      >
        <div className="w-72 flex flex-col h-full">
          {/* Brand Header & New Chat Button */}
          <div className="p-4 border-b border-slate-800/80 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl theme-accent-bg flex items-center justify-center text-white shadow-md">
                  <HeartPulse className="w-5 h-5 animate-pulse text-white" />
                </div>
                <span className="font-bold text-base brand-title-text">
                  LifeLink AI
                </span>
              </div>

              {/* High Contrast Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-emerald-950 dark:text-slate-400 bg-emerald-100 hover:bg-emerald-200 dark:bg-slate-800 dark:hover:text-white border border-emerald-300 dark:border-slate-700 cursor-pointer transition-colors shadow-xs"
                title="Ẩn Sidebar Nav"
              >
                <X className="w-5 h-5 text-emerald-950 dark:text-slate-300" />
              </button>
            </div>

            {/* "+ New Chat" Button */}
            <button
              onClick={() => {
                onNewChat();
                setActiveTab('chat');
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 dark:bg-slate-800/80 dark:hover:bg-sky-600 dark:hover:text-white dark:text-slate-200 font-bold text-xs flex items-center justify-between border border-emerald-300 dark:border-slate-700/80 shadow-sm transition-all active:scale-95 cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 theme-accent-text group-hover:rotate-90 transition-transform" />
                Đoạn Triage mới
              </span>
              <span className="text-[10px] bg-white text-emerald-900 font-bold px-1.5 py-0.5 rounded border border-emerald-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700">
                New
              </span>
            </button>
          </div>

          {/* Navigation Menu List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
              Menu Tính Năng
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isChat = item.id === 'chat';

              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      if (isChat) setIsChatTreeExpanded(!isChatTreeExpanded);
                      if (window.innerWidth < 768 && !isChat) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isActive
                        ? 'theme-accent-bg shadow-md scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 theme-accent-hover border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'theme-accent-text'}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-md border ${
                            isActive
                              ? 'bg-white/20 text-white border-white/30'
                              : 'bg-emerald-50 text-emerald-950 border-emerald-300 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700 font-bold'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isChat && (
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isChatTreeExpanded ? 'rotate-90' : ''}`} />
                      )}
                    </div>
                  </button>

                  {/* COLLAPSIBLE CHAT THREADS SUB-TREE UNDER "AI TRIAGE & TƯ VẤN" */}
                  {isChat && isChatTreeExpanded && (
                    <div className="pl-4 pr-1 space-y-1 border-l-2 border-emerald-300/60 dark:border-slate-700 ml-3.5 mt-1 animate-in fade-in duration-200">
                      {sessions.length === 0 ? (
                        <div className="px-2 py-1.5 text-[10px] text-slate-400 font-medium italic">
                          Chưa có đoạn chat nào
                        </div>
                      ) : (
                        sessions.map((sess) => {
                          const isSessionActive = activeSessionId === sess.id;
                          return (
                            <div
                              key={sess.id}
                              onClick={() => {
                                setActiveTab('chat');
                                if (onSelectSession) onSelectSession(sess.id);
                                if (window.innerWidth < 768) onClose();
                              }}
                              className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                isSessionActive
                                  ? 'bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-slate-800 dark:text-white dark:border-slate-600 shadow-2xs'
                                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate min-w-0">
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-sky-400 shrink-0" />
                                <span className="truncate text-[11px] font-medium">{sess.title}</span>
                              </div>

                              <button
                                onClick={(e) => handleDeleteSession(e, sess.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity cursor-pointer shrink-0"
                                title="Xóa đoạn chat"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom User Profile & Settings Button Container */}
          <div className="sidebar-bottom-container p-3 border-t border-emerald-200 dark:border-slate-800/80 bg-emerald-50/80 dark:bg-slate-950/60 shrink-0">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-slate-800 hover:border-emerald-500/60 transition-colors shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full theme-accent-bg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Hồ sơ Bệnh nhân</div>
                  <div className="text-[10px] theme-accent-text font-bold">Máu O+ • BHYT</div>
                </div>
              </div>

              {/* Gear Settings Trigger Icon Button */}
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg text-emerald-800 dark:text-slate-400 theme-accent-hover transition-colors cursor-pointer shrink-0"
                title="Cài đặt (Settings)"
              >
                <Settings className="w-4 h-4 theme-accent-text" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
