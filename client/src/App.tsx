import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { EmergencyModal } from './components/EmergencyModal';
import { ScoreBreakdownModal } from './components/ScoreBreakdownModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { ChatPage } from './pages/ChatPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { MapView } from './components/MapView';
import { ProfilePage } from './pages/ProfilePage';
import { ContactPage } from './pages/ContactPage';
import type { Hospital, AuthUser } from './types';
import { fetchEmergencyHospitals, fetchCurrentUser, logoutUser, verifyEmailApi, resendVerificationApi, instantVerifyEmailApi } from './services/api';
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Authentication State
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('lifelink_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Email Verification Banner & Alert Toast State
  const [verifyNotice, setVerifyNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // 100% Permanently enforce Light Mode
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.className = 'light';
    localStorage.removeItem('lifelink_theme');

    // Check if URL has ?verifyToken=...
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('verifyToken');

    if (verifyToken) {
      verifyEmailApi(verifyToken)
        .then((res) => {
          setVerifyNotice({ type: 'success', msg: res.message });
          fetchCurrentUser().then((u) => {
            if (u) setUser(u);
          });
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          setVerifyNotice({ type: 'error', msg: err.message });
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    } else {
      fetchCurrentUser().then((u) => {
        if (u) setUser(u);
      });
    }
  }, []);

  const handleResendEmail = async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      const res = await resendVerificationApi();
      setVerifyNotice({ type: 'success', msg: res.message });
    } catch (err: any) {
      setVerifyNotice({ type: 'error', msg: err.message || 'Không thể gửi lại email' });
    } finally {
      setIsResending(false);
    }
  };

  const handleInstantVerify = async () => {
    try {
      const res = await instantVerifyEmailApi();
      setVerifyNotice({ type: 'success', msg: res.message });
      if (user) {
        const updatedUser = { ...user, emailVerified: true };
        setUser(updatedUser);
        localStorage.setItem('lifelink_user', JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      setVerifyNotice({ type: 'error', msg: err.message || 'Không thể xác minh email' });
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setActiveSessionId(null);
  };

  // User Geolocation State (Defaulting to Bình Thạnh, HCMC)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 10.8028,
    lng: 106.6947,
  });
  const [userLocationName, setUserLocationName] = useState<string>('Quận Bình Thạnh, TP. Hồ Chí Minh');

  // HIGH ACCURACY REAL GPS GEOLOCATION FETCH
  const handleFetchRealLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setUserLocationName(`GPS Vị trí thực: (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          alert('Không thể lấy vị trí GPS thực. Vui lòng cho phép quyền truy cập vị trí trên trình duyệt.');
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
    }
  };

  // Emergency Modal State
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState<string>('');
  const [emergencyHospitals, setEmergencyHospitals] = useState<Hospital[]>([]);

  // Explainability Score Breakdown Modal State
  const [selectedHospitalScore, setSelectedHospitalScore] = useState<Hospital | null>(null);

  // Selected Hospital on Map
  const [selectedMapHospital, setSelectedMapHospital] = useState<Hospital | null>(null);

  // All Hospitals list for search/map
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    handleFetchRealLocation();

    fetchEmergencyHospitals(userLocation).then((hosps) => {
      setEmergencyHospitals(hosps);
      setAllHospitals(hosps);
    });
  }, []);

  const handleTriggerEmergency = (reason?: string) => {
    setEmergencyReason(reason || 'Bạn vừa nhấn nút Cấp cứu khẩn cấp 1-Tap.');
    fetchEmergencyHospitals(userLocation).then(setEmergencyHospitals);
    setIsEmergencyOpen(true);
  };

  const handleNavigateToMapWithHospital = (hosp: Hospital) => {
    setSelectedMapHospital(hosp);
    setActiveTab('map');
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden font-sans bg-emerald-50/40 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* 1. Left Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewChat={() => {
          setActiveSessionId(null);
          setActiveTab('chat');
        }}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setActiveTab('chat');
        }}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Main Right Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-emerald-50/30">
        {/* Top Aligned Navbar */}
        <Navbar
          onTriggerEmergency={() => handleTriggerEmergency()}
          userLocationName={userLocationName}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isSidebarOpen={isSidebarOpen}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Phase 2: Email Verification Notice Toast */}
        {verifyNotice && (
          <div className={`px-4 py-2.5 flex items-center justify-between text-xs font-bold shrink-0 ${
            verifyNotice.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            <div className="flex items-center gap-2">
              {verifyNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-white" /> : <AlertCircle className="w-4 h-4 text-white" />}
              <span>{verifyNotice.msg}</span>
            </div>
            <button onClick={() => setVerifyNotice(null)} className="text-white hover:opacity-80 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Phase 2: Unverified Email Prompt Banner for Logged-In User */}
        {user && user.emailVerified === false && (
          <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-amber-950 text-xs font-extrabold shrink-0 gap-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Email của bạn ({user.email}) chưa được xác minh.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstantVerify}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Xác minh tức thì (1-Click Dev Test)</span>
              </button>
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 text-white ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Đang gửi...' : 'Gửi lại Email'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area - Full Viewport Height for Chat */}
        <main className={`flex-1 w-full ${activeTab === 'chat' ? 'h-full flex flex-col p-2 sm:p-3 overflow-hidden pb-16 md:pb-3' : 'overflow-y-auto p-2 sm:p-4 pb-20 md:pb-4'}`}>
          {activeTab === 'chat' && (
            <ChatPage
              userLocation={userLocation}
              activeSessionId={activeSessionId}
              onSessionCreated={(id) => setActiveSessionId(id)}
              onTriggerEmergencyWithReason={(r) => handleTriggerEmergency(r)}
              onSelectScoreInfo={(h) => setSelectedHospitalScore(h)}
              onNavigateToMapWithHospital={handleNavigateToMapWithHospital}
            />
          )}

          {activeTab === 'hospitals' && (
            <HospitalsPage
              hospitals={allHospitals}
              onSelectScoreInfo={(h) => setSelectedHospitalScore(h)}
              onNavigateToMapWithHospital={handleNavigateToMapWithHospital}
            />
          )}

          {activeTab === 'map' && (
            <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] p-2">
              <MapView
                hospitals={allHospitals}
                userLocation={userLocation}
                selectedHospital={selectedMapHospital}
                onSelectHospital={(h) => setSelectedMapHospital(h)}
                onRefreshLocation={handleFetchRealLocation}
              />
            </div>
          )}

          {activeTab === 'profile' && <ProfilePage />}

          {activeTab === 'contact' && <ContactPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          setActiveSessionId(null);
        }}
      />

      {/* Emergency Full-screen Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        emergencyHospitals={emergencyHospitals}
        reason={emergencyReason}
      />

      {/* Explainable AI Score Breakdown Modal */}
      <ScoreBreakdownModal
        hospital={selectedHospitalScore}
        onClose={() => setSelectedHospitalScore(null)}
      />
    </div>
  );
}

export default App;
