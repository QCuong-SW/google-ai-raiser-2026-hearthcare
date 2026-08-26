import React, { useEffect, useState } from 'react';
import { Siren, PhoneCall, Navigation, Clock, MapPin, X } from 'lucide-react';
import type { Hospital } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyHospitals: Hospital[];
  reason?: string;
  emergencyContactPhone?: string;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  emergencyHospitals,
  reason,
  emergencyContactPhone = '115',
}) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 20);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300); // 300ms transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait full 300ms for Fade-Out transition before unmounting
  };

  if (!isRendered) return null;

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300 ease-out ${
        isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg glass-emergency rounded-3xl p-6 shadow-2xl border-2 border-red-500/50 text-white overflow-hidden transition-all duration-300 ease-out transform ${
          isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-6'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-600/30 border border-red-500 rounded-2xl animate-beacon">
            <Siren className="w-10 h-10 text-red-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-red-400 uppercase flex items-center gap-2">
              <Siren className="w-6 h-6 text-red-400" /> Cảnh Báo Cấp Cứu 24/7
            </h2>
            <p className="text-xs text-red-200 font-medium">
              Hệ thống phát hiện dấu hiệu khẩn cấp đe dọa tính mạng!
            </p>
          </div>
        </div>

        {/* Reason / Advice Disclaimer */}
        <div className="bg-red-950/60 border border-red-500/30 rounded-2xl p-4 mb-5 text-sm text-red-100 leading-relaxed">
          <p className="font-semibold text-red-300 mb-1">
            {reason || 'Các triệu chứng ngực/hấp/thần kinh dữ dội cần được xử lý y tế gấp.'}
          </p>
          <p className="text-xs text-red-200">
            * Hãy giữ bình tĩnh, nằm nghỉ ở vị trí thoáng mát, nới lỏng quần áo và di chuyển ngay tới khoa Cấp cứu gần nhất.
          </p>
        </div>

        {/* Direct Call Actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <a
            href="tel:115"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/50 active:scale-95 transition-all"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" /> Gọi 115 Ngay
          </a>
          <a
            href={`tel:${emergencyContactPhone}`}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-red-500/40 text-red-200 font-medium text-sm active:scale-95 transition-all"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" /> Gọi Người Thân
          </a>
        </div>

        {/* Nearest 24/7 ER Hospitals */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-red-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Bệnh viện Cấp cứu 24/7 gần bạn nhất:
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {emergencyHospitals.slice(0, 3).map((hosp, idx) => (
              <div
                key={hosp.id}
                className="bg-slate-900/90 border border-red-500/30 rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-sm text-white">{hosp.name}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 pl-7">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" /> {hosp.distanceKm ?? 1.5} km
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-400">
                      <Clock className="w-3 h-3" /> ~{hosp.estimatedMinutes ?? 5} phút
                    </span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hosp.latitude},${hosp.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md active:scale-95 transition-all flex items-center gap-1 text-xs font-bold shrink-0"
                >
                  <Navigation className="w-4 h-4" /> Dẫn đường
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
