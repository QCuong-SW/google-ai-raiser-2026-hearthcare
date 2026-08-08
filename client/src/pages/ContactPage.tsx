import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, ShieldCheck, Building2, MapPin } from 'lucide-react';
import { sendFeedback } from '../services/api';

export const ContactPage: React.FC = () => {
  const [feedbackText, setFeedbackText] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await sendFeedback(senderName, senderPhone, feedbackText);
    setIsSubmitting(false);

    setIsSent(true);
    setTimeout(() => {
      setFeedbackText('');
      setSenderName('');
      setSenderPhone('');
      setIsSent(false);
    }, 4000);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20 md:pb-8 space-y-6">
      {/* Dedicated Support & Feature Request Form Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-emerald-300 dark:border-slate-800 shadow-2xl bg-white/95 dark:bg-slate-900/90">
        <div className="flex items-center gap-3.5 pb-4 border-b border-emerald-200 dark:border-slate-800 mb-6">
          <div className="w-12 h-12 rounded-2xl theme-accent-bg flex items-center justify-center text-white shadow-lg">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Gửi Yêu Cầu Phát Triển & Góp Ý</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Gửi trực tiếp ý kiến đóng góp tính năng hoặc thắc mắc tới đội ngũ phát triển LifeLink AI</p>
          </div>
        </div>

        {isSent ? (
          <div className="p-6 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-sm font-bold flex items-center gap-3 animate-in fade-in my-6 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
            <span>Cảm ơn bạn! Ý kiến đóng góp của bạn đã được gửi thành công đến hệ thống NestJS Backend LifeLink AI.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-300 mb-1.5">Họ & Tên của bạn:</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full py-3 px-3.5 rounded-xl bg-white dark:bg-slate-950 border border-emerald-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-300 mb-1.5">Số điện thoại liên hệ:</label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="Ví dụ: 0901234567"
                  className="w-full py-3 px-3.5 rounded-xl bg-white dark:bg-slate-950 border border-emerald-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-300 mb-1.5">Nội dung phản hồi / Yêu cầu phát triển tính năng:</label>
              <textarea
                rows={5}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Mô tả nội dung góp ý nâng cấp giao diện, thuật toán AI Triage, hoặc đề xuất tính năng mới cho ứng dụng..."
                className="w-full py-3 px-3.5 rounded-xl bg-white dark:bg-slate-950 border border-emerald-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={!feedbackText.trim() || isSubmitting}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl theme-accent-bg disabled:opacity-40 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" /> {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Phát Triển'}
            </button>
          </form>
        )}
      </div>

      {/* Development Team Footer Card */}
      <div className="glass-panel rounded-3xl p-5 border border-emerald-300 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 theme-accent-text shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm text-slate-950 dark:text-white">Đội Ngũ Phân Tích & Phát Triển LifeLink AI</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> TP. Hồ Chí Minh, Việt Nam
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-emerald-100 text-emerald-950 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 rounded-full text-xs font-extrabold shrink-0 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Phản hồi 24/7
        </span>
      </div>
    </div>
  );
};
