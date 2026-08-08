import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, HeartPulse, Hospital as HospitalIcon, Info, Bot, User as UserIcon, ImageIcon, X, Stethoscope, ShieldAlert, ChevronDown, Check } from 'lucide-react';
import type { ChatMessage, Hospital } from '../types';
import { HospitalCard } from '../components/HospitalCard';
import { fetchTriage, createChatSession, fetchChatHistory } from '../services/api';

interface ChatPageProps {
  userLocation: { lat: number; lng: number };
  activeSessionId?: string | null;
  onSessionCreated?: (sessionId: string) => void;
  onTriggerEmergencyWithReason: (reason: string) => void;
  onSelectScoreInfo: (hosp: Hospital) => void;
  onNavigateToMapWithHospital: (hosp: Hospital) => void;
}

export const ChatPage = ({
  userLocation,
  activeSessionId,
  onSessionCreated,
  onTriggerEmergencyWithReason,
  onSelectScoreInfo,
  onNavigateToMapWithHospital,
}: ChatPageProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeAiMode, setActiveAiMode] = useState<'triage_hospital' | 'analyze_symptom' | 'first_aid'>('triage_hospital');
  const [sessionId, setSessionId] = useState<string | null>(activeSessionId || null);

  // Smooth Animated Dropdown State
  const [isDropdownRendered, setIsDropdownRendered] = useState(false);
  const [isDropdownAnimating, setIsDropdownAnimating] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultWelcomeMsg: ChatMessage = {
    id: 'welcome-msg',
    sender: 'ai',
    text: 'Xin chào! Tôi là LifeLink AI Medical Assistant (Sử dụng Google Gemini Flash Vision). Bạn có thể chọn Chế độ AI (Dropdown góc dưới), nhập câu hỏi, tải ảnh hoặc dán ảnh (Ctrl+V) vào ô chat để tôi phân tích nhé!',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultWelcomeMsg]);

  const aiModesList = [
    {
      id: 'triage_hospital' as const,
      label: 'Tìm nơi khám & Bệnh viện',
      desc: 'Phân loại triệu chứng & xếp hạng 5 yếu tố bệnh viện Bình Thạnh',
      icon: HospitalIcon,
      color: 'text-emerald-600',
    },
    {
      id: 'analyze_symptom' as const,
      label: 'Phân tích triệu chứng',
      desc: 'Chẩn đoán lâm sàng sâu & chuyên khoa khuyên dùng',
      icon: Stethoscope,
      color: 'text-teal-600',
    },
    {
      id: 'first_aid' as const,
      label: 'Sơ cứu với triệu chứng',
      desc: 'Hướng dẫn các bước sơ cứu khẩn cấp & xử lý ngắt cơn',
      icon: ShieldAlert,
      color: 'text-red-500',
    },
  ];

  const currentModeInfo = aiModesList.find((m) => m.id === activeAiMode) || aiModesList[0];
  const CurrentModeIcon = currentModeInfo.icon;

  // Load Session History if selecting a thread from Sidebar
  useEffect(() => {
    async function loadSession() {
      if (activeSessionId) {
        setSessionId(activeSessionId);
        const history = await fetchChatHistory(activeSessionId);
        if (history && history.length > 0) {
          const formattedHistory: ChatMessage[] = history.map((m: any) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            imageUrl: m.imageUrl,
            triageResult: m.triageResult,
            recommendedHospitals: m.recommendedHospitals,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setMessages(formattedHistory);
        }
      } else {
        setSessionId(null);
        setMessages([defaultWelcomeMsg]);
      }
    }
    loadSession();
  }, [activeSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Toggle Dropdown Animation
  const toggleDropdown = () => {
    if (!isDropdownRendered) {
      setIsDropdownRendered(true);
      const timer = setTimeout(() => {
        setIsDropdownAnimating(true);
      }, 15);
      return () => clearTimeout(timer);
    } else {
      closeDropdown();
    }
  };

  const closeDropdown = () => {
    setIsDropdownAnimating(false);
    const timer = setTimeout(() => {
      setIsDropdownRendered(false);
    }, 280);
    return () => clearTimeout(timer);
  };

  // Click outside to close dropdown smoothly
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // PASTE IMAGE DIRECTLY FROM CLIPBOARD (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onloadend = () => {
            setSelectedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  };

  const handleSendMessage = async (textToSend?: string, imageToSend?: string | null) => {
    const query = textToSend || inputMessage;
    const attachedImage = imageToSend !== undefined ? imageToSend : selectedImage;

    if ((!query.trim() && !attachedImage) || isLoading) return;

    // Create session ONLY when first user message is actually sent!
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const newSession = await createChatSession(activeAiMode, query || 'Phân tích ảnh lâm sàng đính kèm');
      currentSessionId = newSession.id;
      setSessionId(newSession.id);
      if (onSessionCreated) onSessionCreated(newSession.id);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query || 'Phân tích hình ảnh lâm sàng đính kèm.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: attachedImage || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const { triage, hospitals } = await fetchTriage(
        query || 'Tải lên hình ảnh triệu chứng lâm sàng',
        userLocation,
        currentSessionId || undefined,
        activeAiMode,
        attachedImage,
      );

      let responseText = triage.medical_advice_disclaimer;

      if (activeAiMode === 'analyze_symptom') {
        responseText = `🔍 [MODE: PHÂN TÍCH TRIỆU CHỨNG LÂM SÀNG SÂU]\n- Triệu chứng ghi nhận: "${query}"\n- Chẩn đoán sơ bộ: Phát hiện dấu hiệu liên quan đến ${triage.specialty_needed.join(', ')}.\n- Mức độ nguy cơ: ${triage.severity}.\n\n🩺 Khuyên dùng: ${triage.suggested_action}`;
      } else if (activeAiMode === 'first_aid') {
        responseText = `🆘 [MODE: HƯỚNG DẪN SƠ CỨU NÔNG & CẤP CỨU]\n1. Hãy giữ bình tĩnh, cho bệnh nhân nằm nghỉ ở nơi thoáng mát, nới lỏng cổ áo.\n2. Nếu có dấu hiệu ${query}: Không tự ý dùng thuốc ngắt cơn khi chưa có chỉ định.\n3. Nếu khó thở/tím tái: Gọi 115 ngay lập tức và đặt tư thế đầu cao 30 độ.`;
      }

      if (attachedImage && !responseText.includes('📸')) {
        responseText = `📸 [Phân tích hình ảnh Vision AI]: ${responseText}`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triageResult: triage,
        recommendedHospitals: activeAiMode === 'triage_hospital' ? hospitals : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Trigger Emergency Modal if critical
      if (triage.is_emergency || triage.severity === 'CRITICAL' || triage.severity === 'HIGH') {
        setTimeout(() => {
          onTriggerEmergencyWithReason(triage.emergency_reason || 'Triệu chứng khẩn cấp đe dọa tính mạng');
        }, 800);
      }
    } catch (err) {
      console.error('Triage error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto relative rounded-3xl overflow-hidden glass-panel border border-emerald-300 dark:border-slate-800 shadow-2xl bg-white/95 dark:bg-slate-950/90">
      {/* 1. Top Header Bar */}
      <div className="px-4 py-3 bg-emerald-50/90 dark:bg-slate-900 border-b border-emerald-300 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl theme-accent-bg flex items-center justify-center text-white shadow-md">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">LifeLink AI Triage & Vision</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Gemini 3.6 Flash Vision AI • Paste Clipboard Image (Ctrl+V) Supported</p>
          </div>
        </div>
      </div>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white'
                  : 'theme-accent-bg text-white'
              }`}
            >
              {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble & Cards */}
            <div className={`max-w-[88%] sm:max-w-[82%] space-y-2`}>
              <div
                className={`rounded-2xl p-4 shadow-md text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-sky-600 dark:to-indigo-600 text-white rounded-tr-none font-medium'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-tl-none border border-emerald-300 dark:border-slate-800 shadow-sm font-medium'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-emerald-200 dark:border-slate-800 text-xs font-bold theme-accent-text">
                    <HeartPulse className="w-4 h-4 theme-accent-text animate-pulse" />
                    <span>Đánh giá Triage AI</span>
                    <span className="text-[10px] text-slate-400 ml-auto">{msg.timestamp}</span>
                  </div>
                )}

                {/* Attached User Image Display */}
                {msg.imageUrl && (
                  <div className="mb-3 overflow-hidden rounded-xl border border-white/30 max-w-sm shadow-md">
                    <img src={msg.imageUrl} alt="Đính kèm lâm sàng" className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                )}

                <p className="whitespace-pre-line font-medium text-slate-900 dark:text-slate-100">{msg.text}</p>

                {/* Structured Triage Status Card */}
                {msg.triageResult && (
                  <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">Mức độ phân loại:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          msg.triageResult.severity === 'CRITICAL'
                            ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/40'
                            : msg.triageResult.severity === 'HIGH'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                            : msg.triageResult.severity === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                            : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                        }`}
                      >
                        {msg.triageResult.severity}
                      </span>
                    </div>

                    {msg.triageResult.specialty_needed.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">Chuyên khoa phù hợp:</span>
                        {msg.triageResult.specialty_needed.map((spec: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 bg-emerald-50 dark:bg-sky-500/20 text-emerald-950 dark:text-sky-300 text-xs font-bold rounded-lg border border-emerald-300 dark:border-sky-500/30"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bright Light Mint Green Suggested Action Disclaimer Box */}
                    {msg.triageResult.suggested_action && (
                      <div className="bg-emerald-50 border border-emerald-300 dark:bg-slate-950 dark:border-slate-800 p-3 rounded-xl text-xs text-emerald-950 dark:text-slate-300 flex items-start gap-2 shadow-xs mt-2 font-bold">
                        <Info className="w-4 h-4 text-emerald-700 dark:text-sky-400 shrink-0 mt-0.5" />
                        <span className="font-bold text-emerald-950 dark:text-slate-200">{msg.triageResult.suggested_action}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recommended Hospital List inside Chat */}
              {msg.recommendedHospitals && msg.recommendedHospitals.length > 0 && (
                <div className="space-y-3 pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider theme-accent-text flex items-center gap-1.5 pl-1">
                    <HospitalIcon className="w-4 h-4 theme-accent-text" /> Bệnh viện xếp hạng cao nhất tại Bình Thạnh:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {msg.recommendedHospitals.map((hosp) => (
                      <HospitalCard
                        key={hosp.id}
                        hospital={hosp}
                        onSelectScoreInfo={onSelectScoreInfo}
                        onNavigateMap={onNavigateToMapWithHospital}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl max-w-xs text-slate-800 dark:text-slate-300 text-xs border border-emerald-300 dark:border-slate-800 shadow-xl font-bold">
            <Sparkles className="w-5 h-5 theme-accent-text animate-spin" />
            <span>Google Gemini Flash Vision AI đang xử lý...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. FIXED ALWAYS-VISIBLE BOTTOM CHAT INPUT CONTAINER WITH SPRING POP-OUT ANIMATED COMBOBOX */}
      <div className="sticky bottom-0 left-0 right-0 p-3 sm:p-4 bg-emerald-50/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-emerald-300 dark:border-slate-800 z-30 shadow-2xl shrink-0 space-y-2">
        {/* Selected Image Thumbnail Preview Bar */}
        {selectedImage && (
          <div className="mb-2 relative inline-block group">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md">
              <img src={selectedImage} alt="Preview đính kèm" className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                title="Xóa ảnh"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <span className="text-[9px] text-emerald-800 font-bold block mt-0.5">Đã đính kèm ảnh</span>
          </div>
        )}

        {/* Input Form Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Image File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
              selectedImage
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-slate-300 border-emerald-300 dark:border-slate-700 hover:bg-emerald-100/80 shadow-xs'
            }`}
            title="Đính kèm ảnh triệu chứng / vết thương / toa thuốc"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onPaste={handlePaste}
              placeholder={
                activeAiMode === 'triage_hospital'
                  ? 'Nhập triệu chứng, chọn/dán ảnh (Ctrl+V) để tìm bệnh viện Bình Thạnh...'
                  : activeAiMode === 'analyze_symptom'
                  ? 'Mô tả triệu chứng, chọn/dán ảnh (Ctrl+V) để AI phân tích...'
                  : 'Nhập tình trạng cần hướng dẫn sơ cứu khẩn cấp...'
              }
              className="w-full py-3 pl-4 pr-10 rounded-xl bg-white dark:bg-slate-950 border border-emerald-300 dark:border-slate-700/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm shadow-sm transition-all font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
            className="py-3 px-5 rounded-xl theme-accent-bg disabled:opacity-40 text-white font-bold text-sm shadow-lg flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* CHATGPT-STYLE SPRING POP-OUT ANIMATED COMBOBOX */}
        <div className="relative inline-block text-left" ref={dropdownRef}>
          {/* Dropdown Trigger Button */}
          <button
            type="button"
            onClick={toggleDropdown}
            className="py-1.5 px-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-100/80 dark:hover:bg-slate-700 border border-emerald-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Đổi Chế độ AI (ChatGPT Model Picker Style)"
          >
            <CurrentModeIcon className={`w-3.5 h-3.5 ${currentModeInfo.color}`} />
            <span>{currentModeInfo.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ease-out ${isDropdownAnimating ? 'rotate-180 text-emerald-600' : ''}`} />
          </button>

          {/* Liquid Spring Pop-out Dropdown Popup sprouting seamlessly from button */}
          {isDropdownRendered && (
            <div
              style={{
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className={`absolute bottom-full left-0 mb-2 w-72 sm:w-80 rounded-2xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border-2 border-emerald-400/80 dark:border-slate-700 shadow-2xl p-2 z-50 transition-all duration-300 origin-bottom-left ${
                isDropdownAnimating
                  ? 'opacity-100 scale-100 translate-y-0 blur-none'
                  : 'opacity-0 scale-[0.82] translate-y-3 blur-xs pointer-events-none'
              }`}
            >
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1.5 border-b border-emerald-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                <span>Chọn Chế độ AI</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-extrabold">Gemini Vision</span>
              </div>

              <div className="space-y-1">
                {aiModesList.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = activeAiMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setActiveAiMode(mode.id);
                        closeDropdown();
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-950 dark:text-white font-bold border border-emerald-300 dark:border-slate-700 shadow-xs'
                          : 'hover:bg-emerald-50/60 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-slate-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-xs leading-tight">{mode.label}</h5>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">{mode.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
