import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Hospital } from '../types';
import { Phone, Navigation, ShieldAlert, Radar, Compass, Layers, Map as MapIcon, Crosshair } from 'lucide-react';

interface MapViewProps {
  hospitals: Hospital[];
  userLocation: { lat: number; lng: number };
  selectedHospital?: Hospital | null;
  onSelectHospital?: (hospital: Hospital) => void;
  onRefreshLocation?: () => void;
}

// Custom High-Res Vector Pulse Markers
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div class="relative flex items-center justify-center">
    <span class="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-emerald-400 opacity-75"></span>
    <div class="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow-2xl flex items-center justify-center text-white font-black text-[10px]">BẠN</div>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const getHospitalIcon = (isEmergency: boolean, isSelected: boolean) => {
  const bg = isEmergency ? 'bg-gradient-to-tr from-red-600 to-rose-500' : 'bg-emerald-600';
  const border = isSelected ? 'border-amber-400 border-3 scale-125 z-50 shadow-amber-500/50' : 'border-white border-2';
  return L.divIcon({
    className: 'custom-hospital-marker',
    html: `<div class="w-9 h-9 rounded-full ${bg} ${border} shadow-2xl flex items-center justify-center text-white font-bold text-sm transition-transform hover:scale-110">
      🏥
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Map Recenter Helper Component
const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.2 });
  }, [center, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  hospitals,
  userLocation,
  selectedHospital,
  onSelectHospital,
  onRefreshLocation,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [mapLayerStyle, setMapLayerStyle] = useState<'google' | 'satellite' | 'dark'>('google');

  // FAST 0.5-SECOND (500MS) Loading Radar Effect - RUNS ONLY ONCE UPON INITIAL MAP TAB ENTRY
  useEffect(() => {
    setIsLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 40);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const mapCenter: [number, number] = selectedHospital
    ? [selectedHospital.latitude, selectedHospital.longitude]
    : [userLocation.lat, userLocation.lng];

  // Tile Layer Providers
  const tileProviders = {
    google: {
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps Vector',
    },
    satellite: {
      url: 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps Satellite HD',
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO Voyager HD Vector',
    },
  };

  return (
    <div className="w-full h-full min-h-[420px] rounded-3xl overflow-hidden border border-emerald-300 relative shadow-2xl bg-white">
      {/* Top Map Layer Switcher & High Accuracy GPS Recenter Buttons */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 flex-wrap justify-end">
        {/* GPS High Accuracy Recenter Button */}
        {onRefreshLocation && (
          <button
            onClick={onRefreshLocation}
            className="py-1.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xl transition-all active:scale-95 cursor-pointer border border-emerald-400"
            title="Định vị GPS thực của thiết bị"
          >
            <Crosshair className="w-3.5 h-3.5 animate-pulse text-white" />
            <span>VỊ TRÍ HIỆN TẠI</span>
          </button>
        )}

        {/* Map Layer Switcher Control */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xl border border-emerald-300 p-1.5 rounded-2xl shadow-xl">
          <span className="text-[10px] font-bold text-emerald-800 px-2 flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-600" /> Mode:
          </span>
          <button
            onClick={() => setMapLayerStyle('google')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              mapLayerStyle === 'google'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-800 hover:text-emerald-700'
            }`}
          >
            Google Vector
          </button>
          <button
            onClick={() => setMapLayerStyle('satellite')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              mapLayerStyle === 'satellite'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-800 hover:text-emerald-700'
            }`}
          >
            Vệ Tinh
          </button>
          <button
            onClick={() => setMapLayerStyle('dark')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              mapLayerStyle === 'dark'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-800 hover:text-emerald-700'
            }`}
          >
            HD Dark
          </button>
        </div>
      </div>

      {/* 1. Fast 0.5s Loading Radar Overlay */}
      {isLoading && (
        <div className="map-loading-overlay absolute inset-0 z-40 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-200 bg-white/95">
          <div className="relative mb-6">
            <div className="radar-ring w-20 h-20 rounded-full flex items-center justify-center relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-30 bg-emerald-500"></span>
              <Radar className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-emerald-600 text-white shadow-lg">
              <Compass className="w-4 h-4 animate-bounce text-white" />
            </div>
          </div>

          <h3 className="text-base font-bold mb-1 tracking-wide flex items-center gap-2 text-slate-900">
            <MapIcon className="w-4 h-4 text-emerald-600" /> Khởi tạo Bản đồ Google Maps Vector & GPS
          </h3>
          <p className="text-xs text-slate-600 mb-5 text-center max-w-sm font-medium">
            Kết nối dữ liệu Google Maps Places API và quét vị trí thực thiết bị...
          </p>

          {/* Fast 0.5s Progress Bar */}
          <div className="w-64 bg-emerald-100 rounded-full h-2 overflow-hidden border border-emerald-300 shadow-inner">
            <div
              className="progress-bar-fill h-full rounded-full transition-all duration-75 ease-out bg-emerald-600"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 font-bold mt-2">{progress}%</span>
        </div>
      )}

      {/* 2. Map Container */}
      <div className={`w-full h-full transition-all duration-300 ease-out ${isLoading ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100 blur-none'}`}>
        <MapContainer
          center={mapCenter}
          zoom={15}
          zoomControl={false}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            key={mapLayerStyle}
            attribution={tileProviders[mapLayerStyle].attribution}
            url={tileProviders[mapLayerStyle].url}
          />

          <RecenterMap center={mapCenter} />

          {/* User Location Marker */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="p-1 text-xs font-bold text-slate-900">
                <div className="text-emerald-600 font-extrabold mb-0.5">🎯 Vị trí thực của bạn (GPS)</div>
                <div className="text-[10px] text-slate-600 font-mono">Tọa độ: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</div>
              </div>
            </Popup>
          </Marker>

          {/* Hospital Markers */}
          {hospitals.map((hosp) => {
            const isSelected = selectedHospital?.id === hosp.id;
            return (
              <Marker
                key={hosp.id}
                position={[hosp.latitude, hosp.longitude]}
                icon={getHospitalIcon(hosp.isEmergency247, isSelected)}
                eventHandlers={{
                  click: () => onSelectHospital && onSelectHospital(hosp),
                }}
              >
                <Popup>
                  <div className="p-1.5 max-w-xs text-slate-900 font-bold">
                    <div className="font-extrabold text-sm text-emerald-700 mb-1">{hosp.name}</div>
                    <p className="text-[11px] text-slate-600 mb-2 font-medium">{hosp.address}</p>

                    <div className="flex items-center gap-2 text-[11px] mb-2.5">
                      <span className="font-bold text-emerald-600">~{hosp.distanceKm ?? 2} km</span>
                      {hosp.isEmergency247 && (
                        <span className="text-red-600 font-bold flex items-center gap-0.5 ml-auto">
                          <ShieldAlert className="w-3 h-3" /> Cấp cứu 24/7
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${hosp.phone}`}
                        className="flex-1 py-1.5 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 border border-emerald-300"
                      >
                        <Phone className="w-3 h-3 text-emerald-700" /> Gọi điện
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${hosp.latitude},${hosp.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-md"
                      >
                        <Navigation className="w-3 h-3 text-white" /> Chỉ đường
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
