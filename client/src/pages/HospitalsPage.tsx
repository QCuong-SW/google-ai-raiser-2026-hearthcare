import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, Clock } from 'lucide-react';
import type { Hospital } from '../types';
import { HospitalCard } from '../components/HospitalCard';

interface HospitalsPageProps {
  hospitals: Hospital[];
  onSelectScoreInfo: (hosp: Hospital) => void;
  onNavigateToMapWithHospital: (hosp: Hospital) => void;
}

export const HospitalsPage: React.FC<HospitalsPageProps> = ({
  hospitals,
  onSelectScoreInfo,
  onNavigateToMapWithHospital,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [only247, setOnly247] = useState(false);

  const specialtiesList = ['ALL', 'Tim mạch', 'Thần kinh', 'Cấp cứu', 'Nhi khoa', 'Sản phụ khoa', 'Tiêu hóa', 'Đột quỵ'];

  const filteredHospitals = hospitals.filter((hosp) => {
    const matchesQuery =
      hosp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'ALL' ||
      hosp.specialties.some((s) => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));

    const matches247 = !only247 || hosp.isEmergency247;

    return matchesQuery && matchesSpecialty && matches247;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20 md:pb-8">
      {/* Search & Filter Header */}
      <div className="glass-panel rounded-2xl p-4 mb-6 border border-emerald-300 space-y-4 bg-white shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bệnh viện, phòng khám, địa chỉ..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-bold shadow-xs"
            />
          </div>

          {/* 24/7 Button */}
          <button
            onClick={() => setOnly247(!only247)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border shrink-0 w-full sm:w-auto shadow-xs ${
              only247
                ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
                : 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200 font-bold'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-600" /> Chỉ hiện Cấp cứu 24/7
          </button>
        </div>

        {/* Specialty Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs text-slate-700 font-bold flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-emerald-600" /> Chuyên khoa:
          </span>
          {specialtiesList.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border shadow-2xs ${
                selectedSpecialty === spec
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-[1.02]'
                  : 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200 font-bold'
              }`}
            >
              <span className={selectedSpecialty === spec ? 'text-white font-bold' : 'text-emerald-950 font-bold'}>
                {spec === 'ALL' ? 'Tất cả' : spec}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Hospital Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHospitals.map((hosp) => (
          <HospitalCard
            key={hosp.id}
            hospital={hosp}
            onSelectScoreInfo={onSelectScoreInfo}
            onNavigateMap={onNavigateToMapWithHospital}
          />
        ))}

        {filteredHospitals.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 glass-panel rounded-2xl bg-white border border-emerald-200">
            <Clock className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
            <p className="text-sm font-bold text-slate-800">Không tìm thấy bệnh viện phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>
    </div>
  );
};
