import React from 'react';
import { X, Settings, Bell, ShieldCheck, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      {/* Settings Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden border border-emerald-300 shadow-2xl p-6 text-slate-900 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-emerald-100 transition-all cursor-pointer hover:rotate-90"
          title="Đóng Cài Đặt"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-200">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Cài Đặt Hệ Thống</h3>
            <p className="text-xs text-slate-600 font-medium">Tùy chỉnh thông báo & quyền ứng dụng LifeLink AI</p>
          </div>
        </div>

        {/* Settings Form Content */}
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-0.5">
                <Bell className="w-4 h-4 text-emerald-600" /> Âm thanh & Rung Khẩn cấp
              </div>
              <div className="text-[11px] text-slate-600 font-medium">Báo động khi AI phát hiện triệu chứng khẩn cấp 115</div>
            </div>
            <input type="checkbox" defaultChecked className="w-4.5 h-4.5 accent-emerald-600 cursor-pointer" />
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Định vị GPS Tự động
              </div>
              <div className="text-[11px] text-slate-600 font-medium">Cập nhật tọa độ thiết bị để tìm bệnh viện Bình Thạnh gần nhất</div>
            </div>
            <input type="checkbox" defaultChecked className="w-4.5 h-4.5 accent-emerald-600 cursor-pointer" />
          </div>

          <div className="p-3.5 bg-emerald-100/70 border border-emerald-300 rounded-2xl text-[11px] text-emerald-950 font-bold flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Ứng dụng được thiết kế tối ưu trên giao diện Light Mode (Xanh Ngọc Bích + Trắng Sáng).</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer active:scale-98"
          >
            Lưu & Đóng Cài Đặt
          </button>
        </div>
      </div>
    </div>
  );
};
