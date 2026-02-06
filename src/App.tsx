import { useState, useEffect } from 'react';
import { useMeter } from './hooks/useMeter';
import type { FareSettings } from './hooks/useMeter';
import './App.css';

const STORAGE_KEY = 'taxi-meter-settings';
const HISTORY_KEY = 'taxi-meter-history';

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
    if (confirm('Are you sure you want to clear all history?')) {
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
      <header className="glass header">
        <div className="logo">
          <span className="taxi-icon">🚕</span>
          <h1>TAXI METER</h1>
        </div>
        <div className={`gps-indicator ${isActive && !gpsError ? 'active' : ''} ${accuracy !== null && accuracy < 20 ? 'precise' : ''}`}>
          {gpsError ? 'ERROR' : isActive ? (
            <span className="gps-text">
              GPS LIVE {accuracy !== null && <small>({Math.round(accuracy)}m)</small>}
            </span>
          ) : 'GPS STANDBY'}
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
              <button className="btn-danger stop-btn" onClick={handleStopRide}>
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
        <button className="btn-secondary" onClick={() => setShowHistory(true)}>HISTORY</button>
      </footer>

      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal glass history-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ride History</h2>
              <button className="btn-clear" onClick={clearHistory}>Clear All</button>
            </div>

            <div className="history-list">
              {history.length === 0 ? (
                <div className="empty-history">No rides recorded yet.</div>
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
            <button className="btn-primary" onClick={() => setShowHistory(false)}>CLOSE</button>
          </div>
        </div>
      )}

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
