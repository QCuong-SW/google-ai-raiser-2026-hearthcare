import React, { useEffect, useState } from 'react';
import { X, Award, CheckCircle2 } from 'lucide-react';
import type { Hospital } from '../types';

interface ScoreBreakdownModalProps {
  hospital: Hospital | null;
  onClose: () => void;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({ hospital, onClose }) => {
  const [activeHospital, setActiveHospital] = useState<Hospital | null>(hospital);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (hospital) {
      setActiveHospital(hospital);
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 20);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setActiveHospital(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [hospital]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait full 300ms fade-out transition before notifying parent
  };

  if (!activeHospital) return null;

  const score = activeHospital.matchScore ?? 90;

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-300 ease-out ${
        isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md glass-panel rounded-3xl p-6 shadow-2xl border border-emerald-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white transition-all duration-300 ease-out transform ${
          isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-6'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Match % Badge */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl theme-accent-bg flex items-center justify-center font-black text-xl text-white shadow-lg">
            {score}%
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-950 dark:text-white leading-tight">{activeHospital.name}</h3>
            <p className="text-xs theme-accent-text font-bold flex items-center gap-1 mt-0.5">
              <Award className="w-3.5 h-3.5 theme-accent-text" /> Ranking Engine Score Breakdown
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 mb-4 bg-emerald-50/70 dark:bg-slate-900/60 p-3 rounded-xl border border-emerald-200 dark:border-slate-800 font-medium">
          Thuật toán AI chấm điểm dựa trên 5 yếu tố trọng số được tối ưu hóa cho cứu hộ và khám chữa bệnh:
        </p>

        {/* 5 Weighted Factors */}
        <div className="space-y-3 mb-5">
          <div className="bg-emerald-50/80 dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-200 dark:border-slate-800">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="theme-accent-text">1. Chuyên khoa phù hợp (35%)</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">100 / 100</span>
            </div>
            <div className="w-full bg-emerald-200/60 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="theme-accent-bg h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-emerald-50/80 dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-200 dark:border-slate-800">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="theme-accent-text">2. Khoảng cách địa lý (25%)</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{activeHospital.distanceKm ? Math.max(70, Math.round(100 - activeHospital.distanceKm * 5)) : 90} / 100</span>
            </div>
            <div className="w-full bg-emerald-200/60 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="theme-accent-bg h-full rounded-full" style={{ width: `${activeHospital.distanceKm ? Math.max(70, Math.round(100 - activeHospital.distanceKm * 5)) : 90}%` }}></div>
            </div>
          </div>

          <div className="bg-emerald-50/80 dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-200 dark:border-slate-800">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="theme-accent-text">3. Giờ mở cửa 24/7 (15%)</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{activeHospital.isEmergency247 ? '100 / 100 (Cấp cứu 24/7)' : '70 / 100'}</span>
            </div>
            <div className="w-full bg-emerald-200/60 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full" style={{ width: activeHospital.isEmergency247 ? '100%' : '70%' }}></div>
            </div>
          </div>

          <div className="bg-emerald-50/80 dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-200 dark:border-slate-800">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="theme-accent-text">4. Đánh giá chất lượng (15%)</span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold">{Math.round((activeHospital.rating / 5) * 100)} / 100 ({activeHospital.rating}★)</span>
            </div>
            <div className="w-full bg-emerald-200/60 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-500 dark:bg-amber-400 h-full rounded-full" style={{ width: `${(activeHospital.rating / 5) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-emerald-50/80 dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-200 dark:border-slate-800">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="theme-accent-text">5. Thời gian di chuyển ETA (10%)</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{Math.max(75, 100 - (activeHospital.estimatedMinutes ?? 5) * 2)} / 100 (~{activeHospital.estimatedMinutes ?? 5} phút)</span>
            </div>
            <div className="w-full bg-emerald-200/60 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="theme-accent-bg h-full rounded-full" style={{ width: `${Math.max(75, 100 - (activeHospital.estimatedMinutes ?? 5) * 2)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Explainability Highlights */}
        {activeHospital.matchReasons && activeHospital.matchReasons.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-emerald-200 dark:border-slate-800">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-400 uppercase tracking-wider mb-2">Lý do gợi ý chính:</h4>
            {activeHospital.matchReasons.map((reason, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
