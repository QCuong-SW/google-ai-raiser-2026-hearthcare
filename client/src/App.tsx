import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { EmergencyModal } from './components/EmergencyModal';
import { ScoreBreakdownModal } from './components/ScoreBreakdownModal';
import { SettingsModal } from './components/SettingsModal';
import { ChatPage } from './pages/ChatPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { MapView } from './components/MapView';
import { ProfilePage } from './pages/ProfilePage';
import { ContactPage } from './pages/ContactPage';
import type { Hospital } from './types';
import { fetchEmergencyHospitals } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Light / Dark Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('lifelink_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('lifelink_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
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
    // Fetch initial real geolocation on load
    handleFetchRealLocation();

    // Fetch initial emergency hospitals list in Bình Thạnh
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
    <div className="h-screen w-screen flex overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
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
      />

      {/* 2. Main Right Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Aligned Navbar */}
        <Navbar
          onTriggerEmergency={() => handleTriggerEmergency()}
          userLocationName={userLocationName}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          isSidebarOpen={isSidebarOpen}
        />

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
        theme={theme}
        onToggleTheme={toggleTheme}
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
