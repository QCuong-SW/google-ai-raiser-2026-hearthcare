import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, HeartPulse, Hospital as HospitalIcon, Bot, User as UserIcon, ImageIcon, X, ShieldAlert, ChevronDown, Check, Mic, MicOff } from 'lucide-react';
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

  // Speech Recognition (Voice-to-Text) State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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
    text: 'Xin chào! Tôi là LifeLink AI Medical Assistant (Sử dụng Google Gemini Flash Vision). Bạn cần hỗ trợ gì?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultWelcomeMsg]);

  const aiModesList = [
    {
      id: 'triage_hospital' as const,
      label: 'Tìm nơi khám & Bệnh viện',
      desc: 'Phân loại mức độ y tế & Gợi ý bệnh viện Bình Thạnh theo GPS',
      icon: HospitalIcon,
      color: 'text-emerald-600',
    },
    {
      id: 'analyze_symptom' as const,
      label: 'Phân tích triệu chứng & Ảnh',
      desc: 'Đánh giá nguy cơ từ triệu chứng chữ hoặc ảnh tổn thương',
      icon: HeartPulse,
      color: 'text-emerald-700',
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

  // Initialize Web Speech Recognition API (Vietnamese vi-VN)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript.trim()) {
          setInputMessage((prev) => {
            const trimmedPrev = prev.trim();
            const trimmedFinal = finalTranscript.trim();
            if (!trimmedPrev) return trimmedFinal;
            if (trimmedPrev.endsWith(trimmedFinal)) return trimmedPrev;
            return `${trimmedPrev} ${trimmedFinal}`;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói (Web Speech API). Vui lòng dùng Google Chrome, Microsoft Edge hoặc Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  };

  const loadedSessionIdRef = useRef<string | null>(null);

  // Load Session History if selecting a thread from Sidebar
  useEffect(() => {
    async function loadSession() {
      if (activeSessionId) {
        if (loadedSessionIdRef.current === activeSessionId) {
          return;
        }
        loadedSessionIdRef.current = activeSessionId;
        setSessionId(activeSessionId);
        try {
          const history = await fetchChatHistory(activeSessionId);
          if (history && Array.isArray(history) && history.length > 0) {
            const formattedHistory: ChatMessage[] = history.map((m: any) => ({
              id: m.id || `msg-${Math.random()}`,
              sender: m.sender || 'ai',
              text: m.text || '',
              imageUrl: m.imageUrl || undefined,
              triageResult: m.triageResult || undefined,
              recommendedHospitals: m.recommendedHospitals || undefined,
              timestamp: m.createdAt
                ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }));
            setMessages(formattedHistory);
          } else {
            setMessages([
              {
                id: `empty-${activeSessionId}`,
                sender: 'ai',
                text: 'Đoạn chat này hiện chưa có dữ liệu tin nhắn cũ. Bạn hãy nhập câu hỏi mới bên dưới để bắt đầu hội thoại nhé!',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }
        } catch (err) {
          console.error('Error loading session history:', err);
          setMessages([defaultWelcomeMsg]);
        }
      } else {
        loadedSessionIdRef.current = null;
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

  // Dropdown Outer Click & ESC Listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const openDropdown = () => {
    setIsDropdownRendered(true);
    setTimeout(() => {
      setIsDropdownAnimating(true);
    }, 10);
  };

  const closeDropdown = () => {
    setIsDropdownAnimating(false);
    setTimeout(() => {
      setIsDropdownRendered(false);
    }, 300);
  };

  const toggleDropdown = () => {
    if (isDropdownRendered) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    const text = textToSend || inputMessage;
    if ((!text.trim() && !selectedImage) || isLoading) return;

    let currentSessionId = sessionId;

    if (!currentSessionId) {
      try {
        const sessionTitle = text.slice(0, 30) || 'Hội thoại Y tế';
        const newSession = await createChatSession(activeAiMode, sessionTitle);
        currentSessionId = newSession.id;
        loadedSessionIdRef.current = currentSessionId;
        setSessionId(currentSessionId);
        if (onSessionCreated) {
          onSessionCreated(currentSessionId);
        }
      } catch (e) {
        console.error('Failed to auto-create session:', e);
      }
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      imageUrl: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    const imageToAnalyze = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const data = await fetchTriage(
        text,
        userLocation,
        currentSessionId || undefined,
        activeAiMode,
        imageToAnalyze
      );

      const aiMsgText = data.triage.medical_advice_disclaimer
        ? (data.triage.suggested_action && !data.triage.medical_advice_disclaimer.includes(data.triage.suggested_action)
            ? `${data.triage.medical_advice_disclaimer}\n\n📌 Khuyến nghị hành động: ${data.triage.suggested_action}`
            : data.triage.medical_advice_disclaimer)
        : data.triage.suggested_action;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiMsgText,
        triageResult: data.triage,
        recommendedHospitals: data.hospitals,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (data.triage.is_emergency) {
        onTriggerEmergencyWithReason(
          data.triage.emergency_reason || 'Phát hiện dấu hiệu cấp cứu y tế từ AI Triage'
        );
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Rất tiếc, đã xảy ra lỗi trong quá trình kết nối với AI Triage. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Dung lượng hình ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setSelectedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-2 sm:p-4 pb-20 md:pb-4">
      {/* Header Info Banner */}
      <div className="glass-panel p-3.5 rounded-2xl mb-3 flex items-center justify-between border border-emerald-300 shadow-sm bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              LifeLink AI Emergency Triage
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-bold border border-emerald-300">
                Google Gemini Vision
              </span>
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Chế độ hiện tại: <span className="font-extrabold text-emerald-700">{currentModeInfo.label}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs shadow-md ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {msg.sender === 'user' ? <UserIcon className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-emerald-700" />}
            </div>

            <div className={`max-w-[85%] sm:max-w-[78%] space-y-3 ${msg.sender === 'user' ? 'items-end' : ''}`}>
              <div
                className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none font-bold'
                    : 'bg-white border border-emerald-300 text-slate-900 rounded-tl-none shadow-md'
                }`}
              >
                {msg.imageUrl && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-emerald-200 shadow-sm max-w-xs">
                    <img src={msg.imageUrl} alt="Uploaded symptom" className="w-full h-auto object-cover max-h-56" />
                  </div>
                )}

                <p className="whitespace-pre-line">{msg.text}</p>
                <div className={`text-[10px] mt-2 text-right ${msg.sender === 'user' ? 'text-emerald-100 font-normal' : 'text-slate-600 font-bold'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {/* Triage Badge Display */}
              {msg.triageResult && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-700">Đánh giá mức độ y tế:</span>
                    <span
                      className={`px-2.5 py-1 rounded-full font-black text-[11px] ${
                        msg.triageResult.severity === 'CRITICAL'
                          ? 'bg-red-600 text-white animate-pulse'
                          : msg.triageResult.severity === 'HIGH'
                          ? 'bg-orange-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {msg.triageResult.severity === 'CRITICAL' ? 'RẤT NGUY CẤP (115)' : msg.triageResult.severity === 'HIGH' ? 'CẦN KHÁM GẤP' : 'THEO DÕI TẠI NHÀ'}
                    </span>
                  </div>

                  {msg.triageResult.specialty_needed && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-slate-500 font-bold">Chuyên khoa gợi ý:</span>
                      {msg.triageResult.specialty_needed.map((spec: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-200/60 text-emerald-950 font-extrabold rounded-md text-[10px]">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recommended Hospital Cards Stream */}
              {msg.recommendedHospitals && msg.recommendedHospitals.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <HospitalIcon className="w-4 h-4 text-emerald-600" />
                    <span>Bệnh viện phù hợp nhất gần bạn (Bình Thạnh):</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {msg.recommendedHospitals.map((hosp: Hospital) => (
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
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <Bot className="w-4 h-4 text-emerald-700 animate-spin" />
            </div>
            <div className="p-3 bg-white border border-emerald-200 rounded-2xl rounded-tl-none text-xs font-bold text-slate-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-bounce" />
              LifeLink AI đang phân tích dữ liệu triệu chứng & vị trí bệnh viện...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar & Controls Container */}
      <div className="mt-3 pt-3 border-t border-emerald-200 bg-white/80 backdrop-blur-md rounded-2xl p-2 sm:p-3 border border-emerald-300 shadow-lg space-y-2">
        {/* Selected Image Preview Pill */}
        {selectedImage && (
          <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-300 rounded-xl w-fit animate-in fade-in">
            <img src={selectedImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-emerald-400" />
            <span className="text-xs font-bold text-emerald-900">Đã đính kèm 1 ảnh triệu chứng</span>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-1 text-slate-400 hover:text-red-600 rounded-full hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Form */}
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

          {/* Attach Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`image-upload-btn p-3 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
              selectedImage
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200 shadow-xs'
            }`}
            title="Đính kèm ảnh triệu chứng / vết thương / toa thuốc"
          >
            <ImageIcon className="w-4 h-4 text-emerald-800" />
          </button>

          {/* Voice-to-Text Microphone Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-3 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
              isListening
                ? 'bg-red-600 text-white border-red-500 shadow-lg animate-pulse ring-2 ring-red-400'
                : 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200 shadow-xs'
            }`}
            title={isListening ? 'Đang lắng nghe giọng nói tiếng Việt... Bấm để dừng' : 'Nói bằng giọng nói (Voice-to-Text)'}
          >
            {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-emerald-800" />}
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onPaste={handlePaste}
              placeholder={
                isListening
                  ? '🎙️ Đang lắng nghe giọng nói tiếng Việt của bạn...'
                  : activeAiMode === 'triage_hospital'
                  ? 'Nhập triệu chứng, chọn/dán ảnh (Ctrl+V) hoặc bấm Mic để nói...'
                  : activeAiMode === 'analyze_symptom'
                  ? 'Mô tả triệu chứng, chọn/dán ảnh (Ctrl+V) hoặc bấm Mic để nói...'
                  : 'Nhập tình trạng cần hướng dẫn sơ cứu khẩn cấp...'
              }
              className={`w-full py-3 pl-4 pr-10 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none text-sm shadow-sm transition-all font-bold ${
                isListening ? 'border-red-500 ring-2 ring-red-300 animate-pulse' : 'border-emerald-300 focus:border-emerald-500'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
            className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-sm shadow-lg flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>

        {/* CHATGPT-STYLE SPRING POP-OUT ANIMATED COMBOBOX */}
        <div className="relative inline-block text-left" ref={dropdownRef}>
          {/* Dropdown Trigger Button */}
          <button
            type="button"
            onClick={toggleDropdown}
            className="py-1.5 px-3.5 rounded-xl bg-white hover:bg-emerald-100 border border-emerald-300 text-slate-900 font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Đổi Chế độ AI (ChatGPT Model Picker Style)"
          >
            <CurrentModeIcon className={`w-3.5 h-3.5 ${currentModeInfo.color}`} />
            <span>{currentModeInfo.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ease-out ${isDropdownAnimating ? 'rotate-180 text-emerald-600' : ''}`} />
          </button>

          {/* Liquid Spring Pop-out Dropdown Popup */}
          {isDropdownRendered && (
            <div
              style={{
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className={`absolute bottom-full left-0 mb-2 w-72 sm:w-80 rounded-2xl bg-white backdrop-blur-2xl border-2 border-emerald-400 shadow-2xl p-2 z-50 transition-all duration-300 origin-bottom-left ${
                isDropdownAnimating
                  ? 'opacity-100 scale-100 translate-y-0 blur-none'
                  : 'opacity-0 scale-[0.82] translate-y-3 blur-xs pointer-events-none'
              }`}
            >
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 py-1.5 border-b border-emerald-200 mb-1 flex items-center justify-between">
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
                          ? 'bg-emerald-100 text-emerald-950 font-bold border border-emerald-400 shadow-xs'
                          : 'hover:bg-emerald-50 text-slate-800 border border-transparent'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-xs leading-tight">{mode.label}</h5>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">{mode.desc}</p>
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
