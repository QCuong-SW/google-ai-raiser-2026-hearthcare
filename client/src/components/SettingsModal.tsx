import { useState, useEffect } from 'react';
import { X, Settings, User, ShieldCheck, Heart, AlertCircle, Phone, Moon, Sun, Bell, CheckCircle2 } from 'lucide-react';
import type { MedicalProfile } from '../types';
import { fetchMedicalProfile } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const SettingsModal = ({ isOpen, onClose, theme, onToggleTheme }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'general'>('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profile, setProfile] = useState<MedicalProfile>({
    bloodType: 'O+',
    allergies: ['Penicillin', 'Hải sản (Tôm, Cua)'],
    preExistingConditions: ['Huyết áp cao', 'Viêm dạ dày'],
    currentMedications: ['Amlodipine 5mg'],
    emergencyContactName: 'Người thân (Anh/Chị/Mẹ)',
    emergencyContactPhone: '0901234567',
    insuranceNumber: 'DN4791234567890',
  });

  useEffect(() => {
    fetchMedicalProfile().then(setProfile);
  }, []);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Settings Modal Box with Spring Zoom-In Animation */}
      <div className="relative w-full max-w-2xl h-[520px] glass-panel rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl flex flex-col md:flex-row text-white animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Left Sidebar inside Settings Modal */}
        <div className="w-full md:w-56 bg-slate-900/90 border-b md:border-b-0 md:border-r border-slate-800 p-3 flex flex-row md:flex-col gap-1.5 shrink-0">
          <div className="hidden md:flex items-center gap-2 p-2 mb-2 border-b border-slate-800">
            <Settings className="w-4 h-4 text-sky-400 animate-spin-slow" />
            <span className="font-bold text-sm text-white">Cài đặt (Settings)</span>
          </div>

          {[
            { id: 'profile', label: 'Hồ sơ Y tế', icon: User },
            { id: 'general', label: 'Tùy chọn chung', icon: Moon },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex-1 md:flex-none flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'theme-accent-bg shadow-md scale-[1.02] active:scale-95'
                    : 'text-slate-400 theme-accent-hover hover:scale-[1.01]'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'text-white scale-110' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area with Smooth Slide-In Keyframe Transitions */}
        <div className="flex-1 p-6 overflow-y-auto relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/80 transition-all cursor-pointer hover:rotate-90"
            title="Đóng Bảng Cài đặt"
          >
            <X className="w-5 h-5" />
          </button>

          {/* TAB 1: Medical Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <User className="w-4 h-4 theme-accent-text" /> Hồ sơ Y tế Cấp cứu
                </h3>
                <p className="text-xs text-slate-400">Dùng cho thuật toán AI Triage và đội ngũ Cấp cứu 115</p>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                  <span>Đã cập nhật hồ sơ y tế thành công!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-sky-400 uppercase mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" /> Nhóm máu
                    </label>
                    <select
                      value={profile.bloodType}
                      onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-sky-500 transition-all"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((t) => (
                        <option key={t} value={t}>Máu {t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-sky-400 uppercase mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Thẻ BHYT
                    </label>
                    <input
                      type="text"
                      value={profile.insuranceNumber || ''}
                      onChange={(e) => setProfile({ ...profile, insuranceNumber: e.target.value })}
                      className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-sky-400 uppercase mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-400" /> Dị ứng (Thức ăn / Thuốc)
                  </label>
                  <input
                    type="text"
                    value={profile.allergies.join(', ')}
                    onChange={(e) => setProfile({ ...profile, allergies: e.target.value.split(',').map((s) => s.trim()) })}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-sky-500 transition-all"
                  />
                </div>

                {/* Clean Emergency Contact Section */}
                <div className="emergency-contact-box p-3.5 rounded-xl space-y-2 border">
                  <h4 className="text-[11px] font-bold uppercase flex items-center gap-1 emergency-contact-title">
                    <Phone className="w-3 h-3 text-red-500" /> Người liên hệ khẩn cấp
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={profile.emergencyContactName}
                      onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
                      placeholder="Họ tên"
                      className="py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      value={profile.emergencyContactPhone}
                      onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                      placeholder="Số điện thoại"
                      className="py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl theme-accent-bg font-bold text-xs text-white shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  Lưu thay đổi hồ sơ
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: General Options */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Moon className="w-4 h-4 theme-accent-text" /> Tùy chọn chung (Preferences)
                </h3>
                <p className="text-xs text-slate-400">Tùy chỉnh giao diện và âm thanh cảnh báo cấp cứu</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-xs font-bold text-white">Chế độ giao diện (Theme)</div>
                    <div className="text-[11px] text-slate-400">Chuyển đổi giữa Light Mode & Dark Mode</div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="px-3.5 py-2 theme-accent-bg text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" /> Bật Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5 text-white" /> Bật Dark Mode
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-400" /> Âm thanh & Rung khẩn cấp
                    </div>
                    <div className="text-[11px] text-slate-400">Cảnh báo khi AI phát hiện triệu chứng nguy cấp</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-500 cursor-pointer" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
