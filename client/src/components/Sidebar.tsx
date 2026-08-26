import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Plus,
  Stethoscope,
  Building2,
  MapPin,
  Settings,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Trash2,
  X,
  Info,
  User as UserIcon,
  PhoneCall,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { fetchChatSessions, deleteChatSession } from '../services/api';
import type { AuthUser } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  user?: AuthUser | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
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
  user,
  onOpenAuth,
  onLogout,
}) => {
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
  const [isTriageExpanded, setIsTriageExpanded] = useState(true);

  // Fetch real chat sessions from NestJS backend (Isolated per user)
  useEffect(() => {
    async function loadSessions() {
      const data = await fetchChatSessions();
      setSessions(data);
    }
    loadSessions();
  }, [activeSessionId, activeTab, user]);

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await deleteChatSession(id);
    if (ok) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        onNewChat();
      }
    }
  };

  const navMenuItems = [
    {
      id: 'triage_group',
      label: 'AI Triage & Tư vấn',
      icon: Stethoscope,
      isGroup: true,
    },
    {
      id: 'hospitals',
      label: 'Danh sách Bệnh viện',
      icon: Building2,
      badge: 'Bình Thạnh',
    },
    {
      id: 'map',
      label: 'Bản đồ Khẩn cấp',
      icon: MapPin,
      badge: 'GPS Live',
    },
    {
      id: 'profile',
      label: 'Hồ sơ Y tế cá nhân',
      icon: UserIcon,
    },
    {
      id: 'contact',
      label: 'Liên hệ & Hỗ trợ',
      icon: PhoneCall,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 animate-in fade-in"
        />
      )}

      {/* Main Collapsible Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-emerald-300 transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:pointer-events-none'
        } flex flex-col h-full shrink-0 shadow-xl md:shadow-none overflow-hidden`}
      >
        <div className="flex flex-col h-full w-72 bg-white">
          {/* Header Brand Section */}
          <div className="p-4 border-b border-emerald-200 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
                <HeartPulse className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="brand-title-text font-black text-lg text-emerald-800 tracking-tight leading-none">
                  LifeLink AI
                </h2>
                <p className="text-[10px] text-emerald-700 font-extrabold mt-0.5">
                  Quận Bình Thạnh • Y Tế Thông Minh
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-emerald-100 transition-colors"
              title="Ẩn Sidebar Nav"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-3 shrink-0 bg-white">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Tạo Đoạn Chat Y Tế Mới</span>
            </button>
          </div>

          {/* Navigation Menu + Chat Sessions List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 bg-white">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-800 px-2 py-1">
              Menu Tính Năng
            </div>

            {navMenuItems.map((item) => {
              const Icon = item.icon;

              if (item.isGroup) {
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => setIsTriageExpanded(!isTriageExpanded)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'chat'
                          ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                          : 'text-slate-800 hover:bg-emerald-100/90'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${activeTab === 'chat' ? 'text-white' : 'text-emerald-700'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isTriageExpanded ? (
                        <ChevronDown className="w-4 h-4 opacity-75" />
                      ) : (
                        <ChevronRight className="w-4 h-4 opacity-75" />
                      )}
                    </button>

                    {/* Expandable Chat History List */}
                    {isTriageExpanded && (
                      <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-emerald-300 ml-4 animate-in slide-in-from-top-1 duration-200">
                        <div className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider px-2 py-0.5">
                          Lịch sử đoạn chat:
                        </div>

                        {sessions.length === 0 ? (
                          <div className="text-[11px] text-slate-500 italic px-2 py-1">
                            Chưa có lịch sử chat
                          </div>
                        ) : (
                          sessions.map((sess) => {
                            const isSessionActive = activeTab === 'chat' && activeSessionId === sess.id;
                            return (
                              <div
                                key={sess.id}
                                onClick={() => {
                                  setActiveTab('chat');
                                  if (onSelectSession) onSelectSession(sess.id);
                                  if (window.innerWidth < 768) onClose();
                                }}
                                className={`w-full group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border ${
                                  isSessionActive
                                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm scale-[1.01]'
                                    : 'text-slate-800 hover:text-emerald-900 hover:bg-emerald-100/90 border-transparent hover:translate-x-0.5'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate min-w-0">
                                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 transition-colors duration-200 ${isSessionActive ? 'text-white' : 'text-emerald-700'}`} />
                                  <span className={`truncate text-[11px] font-bold ${isSessionActive ? 'text-white' : 'text-slate-800'}`}>{sess.title}</span>
                                </div>

                                <button
                                  onClick={(e) => handleDeleteSession(e, sess.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity duration-200 cursor-pointer shrink-0"
                                  title="Xóa đoạn chat"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                      : 'text-slate-800 hover:bg-emerald-100/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-700'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`sidebar-badge-pill px-2 py-0.5 rounded-full text-[9.5px] font-extrabold ${
                        isActive
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom User Profile & Settings Button Container */}
          <div className="sidebar-bottom-container p-3 border-t border-emerald-200 bg-emerald-50/60 shrink-0 space-y-2.5">
            {user ? (
              <div className="p-3 rounded-2xl bg-white border border-emerald-300 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="w-9 h-9 rounded-full object-cover shrink-0 border border-emerald-400" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="truncate">
                    <div className="text-xs font-black text-slate-900 truncate">{user.fullName}</div>
                    <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{user.role === 'ADMIN' ? 'Quản trị viên' : 'Đã xác thực JWT'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={onOpenSettings}
                    className="p-1.5 rounded-lg text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                    title="Cài đặt"
                  >
                    <Settings className="w-4 h-4 text-emerald-700" />
                  </button>
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-white border border-emerald-300 shadow-xs space-y-2.5">
                {/* Guest Profile Top Row */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-300">
                    <UserIcon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Khách ghé thăm</div>
                    <div className="text-[10px] text-slate-500 font-bold">Chưa đăng nhập hệ thống</div>
                  </div>
                </div>

                {/* Standalone Prominent Emerald Login Button */}
                <button
                  onClick={onOpenAuth}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-98"
                >
                  <LogIn className="w-4 h-4 text-white" />
                  <span>Đăng Nhập / Đăng Ký</span>
                </button>
              </div>
            )}

            {/* Scope Disclaimer Banner */}
            <div className="text-[9.5px] font-bold text-slate-800 text-center leading-tight bg-emerald-100/90 p-2 rounded-xl border border-emerald-300 flex items-center justify-center gap-1.5">
              <Info className="w-3 h-3 text-emerald-700 shrink-0" />
              <span>Hiện tại chúng tôi chỉ mới phát triển các vị trí bệnh viện tại khu vực Bình Thạnh</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
