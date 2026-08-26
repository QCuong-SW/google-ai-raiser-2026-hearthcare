import React from 'react';
import { MapPin, Phone, Clock, Navigation, ShieldCheck, Info } from 'lucide-react';
import type { Hospital } from '../types';

interface HospitalCardProps {
  hospital: Hospital;
  onSelectScoreInfo: (hospital: Hospital) => void;
  onNavigateMap?: (hospital: Hospital) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  onSelectScoreInfo,
  onNavigateMap,
}) => {
  const score = hospital.matchScore ?? 92;

  return (
    <div className="glass-panel rounded-2xl p-4 hover:border-emerald-500 transition-all duration-200 shadow-md group relative overflow-hidden bg-white border border-emerald-300">
      {/* Top Banner Row: Score Badge + Name */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight">
              {hospital.name}
            </h3>
            {hospital.isEmergency247 && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 rounded-full">
                🚨 Cấp cứu 24/7
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-1 line-clamp-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {hospital.address}
          </p>
        </div>

        {/* Score Badge */}
        <button
          onClick={() => onSelectScoreInfo(hospital)}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 hover:bg-emerald-200 transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
          title="Xem chi tiết chấm điểm AI"
        >
          <span className="text-xs font-bold text-emerald-800">Match</span>
          <span className="text-lg font-black text-emerald-950">{score}%</span>
          <span className="text-[9px] text-emerald-800 font-bold flex items-center gap-0.5 mt-0.5">
            <Info className="w-2.5 h-2.5 text-emerald-700" /> Chi tiết
          </span>
        </button>
      </div>

      {/* Clean 2-Column Metrics Row: Distance & ETA */}
      <div className="grid grid-cols-2 gap-2 py-2.5 px-3.5 bg-emerald-100/70 rounded-xl text-xs mb-3 border border-emerald-300 shadow-xs">
        <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{hospital.distanceKm ?? 1.8} km</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-800 font-bold justify-end">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>~{hospital.estimatedMinutes ?? 6} phút</span>
        </div>
      </div>

      {/* Specialty Chips */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {hospital.specialties.slice(0, 4).map((spec, idx) => (
          <span
            key={idx}
            className="hospital-specialty-pill px-2.5 py-1 text-[11px] bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold rounded-lg shadow-2xs"
          >
            {spec}
          </span>
        ))}
        {hospital.acceptsInsurance && (
          <span className="px-2.5 py-1 text-[11px] bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold rounded-lg flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-700" /> BHYT
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-emerald-200">
        {/* Phone Button */}
        <a
          href={`tel:${hospital.phone}`}
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-300 shadow-xs"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-700" />
          <span>{hospital.phone}</span>
        </a>

        {/* Dẫn đường Button */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 text-white" />
          <span className="text-white font-bold">Dẫn đường</span>
        </a>

        {/* Map Pin Button */}
        {onNavigateMap && (
          <button
            onClick={() => onNavigateMap(hospital)}
            className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer shadow-xs"
            title="Xem trên bản đồ"
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
          </button>
        )}
      </div>
    </div>
  );
};
