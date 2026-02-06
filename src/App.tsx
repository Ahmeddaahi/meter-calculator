import { useState, useEffect } from 'react';
import { useMeter } from './hooks/useMeter';
import type { FareSettings } from './hooks/useMeter';
import './App.css';

const STORAGE_KEY = 'taxi-meter-settings';

function App() {
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
    startRide,
    stopRide,
    toggleWaiting
  } = useMeter(settings);
  const [showSettings, setShowSettings] = useState(false);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app-container">
      <header className="glass header">
        <div className="logo">
          <span className="taxi-icon">🚕</span>
          <h1>TAXI METER</h1>
        </div>
        <div className={`gps-indicator ${isActive && !gpsError ? 'active' : ''}`}>
          {gpsError ? 'ERROR' : isActive ? 'GPS LIVE' : 'GPS STANDBY'}
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
            ⏳ Waiting for GPS signal...
          </div>
        )}

        <div className="meter-card glass">
          <div className="label">TOTAL FARE</div>
          <div className="fare-display meter-font">
            <span className="currency">ETB</span>
            {fare.toFixed(2)}
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-label">DISTANCE</div>
              <div className="stat-value meter-font">{distance.toFixed(3)} <small>km</small></div>
            </div>
            <div className="stat-divider"></div>
            <div className={`stat-item ${isWaiting ? 'waiting-active' : ''}`}>
              <div className="stat-label">WAITING</div>
              <div className="stat-value meter-font">{formatTime(waitingSeconds)}</div>
            </div>
          </div>
        </div>

        <div className="actions">
          {!isActive ? (
            <button className="btn-primary start-btn" onClick={startRide}>
              START RIDE
            </button>
          ) : (
            <div className="active-actions">
              <button
                className={`btn-secondary waiting-btn ${isWaiting ? 'active' : ''}`}
                onClick={toggleWaiting}
              >
                {isWaiting ? 'STOP WAITING' : 'START WAITING'}
              </button>
              <button className="btn-danger stop-btn" onClick={stopRide}>
                STOP RIDE
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="footer glass">
        <button className="btn-secondary" onClick={() => setShowSettings(!showSettings)}>
          SETTINGS
        </button>
        <button className="btn-secondary">HISTORY</button>
      </footer>

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal glass" onClick={e => e.stopPropagation()}>
            <h2>Fare Settings</h2>

            <div className="setting-input">
              <label>Rate per KM (ETB)</label>
              <input
                type="number"
                value={tempSettings.perKmRate}
                onChange={e => setTempSettings({ ...tempSettings, perKmRate: Number(e.target.value) })}
              />
            </div>
            <div className="setting-input">
              <label>Waiting Rate (ETB / 10 min)</label>
              <input
                type="number"
                value={tempSettings.waitingRatePerTenMinutes}
                onChange={e => setTempSettings({ ...tempSettings, waitingRatePerTenMinutes: Number(e.target.value) })}
              />
            </div>
            <button className="btn-primary" onClick={handleSave}>SAVE</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
