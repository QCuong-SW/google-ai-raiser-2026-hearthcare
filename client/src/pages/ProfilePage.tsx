import React, { useState, useEffect } from 'react';
import { User, Phone, ShieldCheck, Heart, AlertCircle, Save, CheckCircle2 } from 'lucide-react';
import type { MedicalProfile } from '../types';
import { fetchMedicalProfile, saveMedicalProfile } from '../services/api';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<MedicalProfile>({
    bloodType: 'O+',
    allergies: ['Penicillin', 'Hải sản (Tôm, Cua)'],
    preExistingConditions: ['Huyết áp cao', 'Viêm dạ dày'],
    currentMedications: ['Amlodipine 5mg'],
    emergencyContactName: 'Mẹ (Nguyễn Thị Mai)',
    emergencyContactPhone: '0901234567',
    insuranceNumber: 'DN4791234567890',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMedicalProfile().then(setProfile);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await saveMedicalProfile(profile);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20 md:pb-8">
      <div className="glass-panel rounded-3xl p-6 border border-emerald-300 shadow-2xl bg-white">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Hồ Sơ Y Tế Cá Nhân</h2>
              <p className="text-xs text-slate-600 font-medium">
                Thông tin dùng để hỗ trợ đội ngũ Cấp cứu & AI Triage trong tình huống khẩn cấp
              </p>
            </div>
          </div>
          {savedSuccess && (
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã lưu thành công!
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Blood Type & Insurance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-500" /> Nhóm máu
              </label>
              <select
                value={profile.bloodType}
                onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                className="w-full py-2.5 px-3 bg-white border border-emerald-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-bold shadow-xs"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((type) => (
                  <option key={type} value={type}>
                    Máu {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Số thẻ BHYT
              </label>
              <input
                type="text"
                value={profile.insuranceNumber || ''}
                onChange={(e) => setProfile({ ...profile, insuranceNumber: e.target.value })}
                placeholder="VD: DN4791234567890"
                className="w-full py-2.5 px-3 bg-white border border-emerald-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-bold shadow-xs"
              />
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Tiền sử Dị ứng (Thức ăn / Thuốc)
            </label>
            <input
              type="text"
              value={profile.allergies.join(', ')}
              onChange={(e) => setProfile({ ...profile, allergies: e.target.value.split(',').map((s) => s.trim()) })}
              placeholder="VD: Penicillin, Tôm cua..."
              className="w-full py-2.5 px-3 bg-white border border-emerald-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-bold shadow-xs"
            />
          </div>

          {/* Pre-existing Conditions */}
          <div>
            <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              Bệnh nền / Bệnh mạn tính
            </label>
            <input
              type="text"
              value={profile.preExistingConditions.join(', ')}
              onChange={(e) => setProfile({ ...profile, preExistingConditions: e.target.value.split(',').map((s) => s.trim()) })}
              placeholder="VD: Huyết áp cao, Tiểu đường type 2..."
              className="w-full py-2.5 px-3 bg-white border border-emerald-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-bold shadow-xs"
            />
          </div>

          {/* Emergency Contact Person */}
          <div className="emergency-contact-box p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
            <h3 className="emergency-contact-title text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-rose-600" /> Người liên hệ Khẩn cấp
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-700 font-bold">Tên người thân:</span>
                <input
                  type="text"
                  value={profile.emergencyContactName}
                  onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
                  className="w-full py-2 px-3 bg-white border border-rose-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 mt-1 font-bold shadow-xs"
                />
              </div>

              <div>
                <span className="text-xs text-slate-700 font-bold">Số điện thoại khẩn cấp:</span>
                <input
                  type="text"
                  value={profile.emergencyContactPhone}
                  onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                  className="w-full py-2 px-3 bg-white border border-rose-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-red-500 mt-1 font-bold shadow-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-white" /> {isSaving ? 'Đang lưu...' : 'Lưu Hồ Sơ Y Tế'}
          </button>
        </form>
      </div>
    </div>
  );
};
