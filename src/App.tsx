import { useState, useEffect } from 'react';
import { useMeter } from './hooks/useMeter';
import type { FareSettings } from './hooks/useMeter';
import './App.css';

const STORAGE_KEY = 'taxi-meter-settings';
const HISTORY_KEY = 'taxi-meter-history';
const LANG_KEY = 'taxi-meter-lang';

type Language = 'en' | 'so';

const translations = {
  en: {
    title: 'METER PRO',
    telemetry: 'LIVE GPS',
    ready: 'READY',
    signalError: 'SIGNAL ERROR',
    connecting: 'ESTABLISHING CONNECTION...',
    currentFare: 'Current Fare',
    distance: 'DISTANCE',
    waiting: 'WAITING',
    startMission: 'START MISSION',
    resumeTrip: 'Stop waiting',
    pauseTrip: 'Start waiting',
    finishTrip: 'FINISH TRIP',
    settings: 'SETTINGS',
    history: 'HISTORY',
    rideHistory: 'Ride History',
    clearAll: 'Clear All',
    close: 'CLOSE',
    fareSettings: 'Fare Settings',
    ratePerKm: 'Rate per KM (ETB)',
    waitingRate: 'Waiting Rate (ETB / 10 min)',
    save: 'SAVE',
    noRides: 'No rides recorded yet.',
    confirmClear: 'Are you sure you want to clear all history?',
  },
  so: {
    title: 'METER PRO',
    telemetry: 'GPS ks TOOSKA AH',
    ready: 'DIYAAR',
    signalError: 'CILAD ISGAARSIINEED',
    connecting: 'ISKU XIRKA AYAA SOCDA...',
    currentFare: 'Lacagta Hadda',
    distance: 'MASAAFADA',
    waiting: 'SUGITAANKA',
    startMission: 'BILOW SAFARKA',
    resumeTrip: 'Jooji sugitaanka',
    pauseTrip: 'Bilaw sugitaanka',
    finishTrip: 'DHAMMEE SAFARKA',
    settings: 'Habaynta',
    history: 'Safaradii Hore',
    rideHistory: 'Taariikhda Safarka',
    clearAll: 'Masax Dhammaan',
    close: 'XIR',
    fareSettings: 'Dejinta Qiimaha',
    ratePerKm: 'Qiimaha KM kasta (ETB)',
    waitingRate: 'Qiimaha Sugitaanka (ETB / 10 daqiiqo)',
    save: 'Ansixi',
    noRides: 'Weli wax safar ah lama duubin.',
    confirmClear: 'Ma hubtaa inaad rabto inaad tirtirto dhammaan taariikhda?',
  }
};

interface RideHistoryEntry {
  id: string;
  timestamp: number;
  fare: number;
  distance: number;
  waitingSeconds: number;
  perKmRate: number;
  waitingRatePerTenMinutes: number;
}

function App() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem(LANG_KEY) as Language) || 'en';
  });

  const t = (key: keyof typeof translations['en']) => translations[language][key];

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'so' : 'en';
    setLanguage(nextLang);
    localStorage.setItem(LANG_KEY, nextLang);
  };

  const [settings, setSettings] = useState<FareSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      perKmRate: 50,
      waitingRatePerTenMinutes: 20,
    };
  });

  const {
    isActive,
    isWaiting,
    distance,
    waitingSeconds,
    fare,
    gpsError,
    isWaitingForLock,
    accuracy,
    startRide,
    stopRide,
    toggleWaiting
  } = useMeter(settings);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<RideHistoryEntry[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Buffer state for modal inputs
  const [tempSettings, setTempSettings] = useState<FareSettings>(settings);

  useEffect(() => {
    if (showSettings) {
      setTempSettings(settings);
    }
  }, [showSettings, settings]);

  const handleSave = () => {
    setSettings(tempSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tempSettings));
    setShowSettings(false);
  };

  const handleStopRide = () => {
    if (fare > 0 || distance > 0) {
      const newEntry: RideHistoryEntry = {
        id: new Date().toISOString(),
        timestamp: Date.now(),
        fare,
        distance,
        waitingSeconds,
        perKmRate: settings.perKmRate,
        waitingRatePerTenMinutes: settings.waitingRatePerTenMinutes,
      };
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    }
    stopRide();
  };

  const clearHistory = () => {
    if (confirm(t('confirmClear'))) {
      setHistory([]);
      localStorage.removeItem(HISTORY_KEY);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app-container">
      <header className="header backdrop-blur">
        <div className="logo">
          <span className="taxi-icon">⚡</span>
          <h1>{t('title')}</h1>
        </div>
        <div className="header-actions">
          <button className="lang-toggle" onClick={toggleLanguage} title="Switch Language">
            🌐 <span className="lang-text">{language.toUpperCase()}</span>
          </button>
          <div className={`gps-indicator ${isActive && !gpsError ? 'active' : ''} ${accuracy !== null && accuracy < 20 ? 'precise' : ''}`}>
            {gpsError ? t('signalError') : isActive ? (
              <span className="gps-text">
                {t('telemetry')} {accuracy !== null && <small>{Math.round(accuracy)}m</small>}
              </span>
            ) : t('ready')}
          </div>
        </div>
      </header>

      <main className="content">
        {gpsError && (
          <div className="gps-status-banner error">
            ⚠️ {gpsError}
          </div>
        )}

        {isActive && isWaitingForLock && !gpsError && (
          <div className="gps-status-banner waiting">
            📡 {t('connecting')}
          </div>
        )}

        <div className="meter-card">
          <div className="label">{t('currentFare')}</div>
          <div className="fare-display meter-font">
            <span className="currency">ETB</span>
            {fare.toFixed(2)}
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-label">{t('distance')}</div>
              <div className="stat-value meter-font">{distance.toFixed(3)} <small>km</small></div>
            </div>
            <div className="stat-divider"></div>
            <div className={`stat-item ${isWaiting ? 'waiting-active' : ''}`}>
              <div className="stat-label">{t('waiting')}</div>
              <div className="stat-value meter-font">{formatTime(waitingSeconds)}</div>
            </div>
          </div>
        </div>

        <div className="actions">
          {!isActive ? (
            <button className="btn-primary start-btn" onClick={startRide}>
              {t('startMission')}
            </button>
          ) : (
            <div className="active-actions">
              <button
                className={`btn-secondary waiting-btn ${isWaiting ? 'active' : ''}`}
                onClick={toggleWaiting}
              >
                {isWaiting ? t('resumeTrip') : t('pauseTrip')}
              </button>
              <button className="btn-danger stop-btn" onClick={handleStopRide}>
                {t('finishTrip')}
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="footer glass">
        <button className="btn-secondary" onClick={() => setShowSettings(!showSettings)}>
          {t('settings')}
        </button>
        <button className="btn-secondary" onClick={() => setShowHistory(true)}>{t('history')}</button>
      </footer>

      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal glass history-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('rideHistory')}</h2>
              <button className="btn-clear" onClick={clearHistory}>{t('clearAll')}</button>
            </div>

            <div className="history-list">
              {history.length === 0 ? (
                <div className="empty-history">{t('noRides')}</div>
              ) : (
                history.map(ride => (
                  <div key={ride.id} className="history-item glass">
                    <div className="history-date">
                      {new Date(ride.timestamp).toLocaleString()}
                    </div>
                    <div className="history-stats">
                      <div className="history-fare">ETB {ride.fare.toFixed(2)}</div>
                      <div className="history-details">
                        {ride.distance.toFixed(3)} km | {formatTime(ride.waitingSeconds)} wait
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="btn-primary" onClick={() => setShowHistory(false)}>{t('close')}</button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal glass" onClick={e => e.stopPropagation()}>
            <h2>{t('fareSettings')}</h2>

            <div className="setting-input">
              <label>{t('ratePerKm')}</label>
              <input
                type="number"
                value={tempSettings.perKmRate}
                onChange={e => setTempSettings({ ...tempSettings, perKmRate: Number(e.target.value) })}
              />
            </div>
            <div className="setting-input">
              <label>{t('waitingRate')}</label>
              <input
                type="number"
                value={tempSettings.waitingRatePerTenMinutes}
                onChange={e => setTempSettings({ ...tempSettings, waitingRatePerTenMinutes: Number(e.target.value) })}
              />
            </div>
            <button className="btn-primary" onClick={handleSave}>{t('save')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
