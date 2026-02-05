import { useState } from 'react';
import { useMeter } from './hooks/useMeter';
import './App.css';

function App() {
  const { isActive, distance, waitingMinutes, fare, startRide, stopRide } = useMeter();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="app-container">
      <header className="glass header">
        <div className="logo">
          <span className="taxi-icon">🚕</span>
          <h1>TAXI METER</h1>
        </div>
        <div className={`gps-indicator ${isActive ? 'active' : ''}`}>
          {isActive ? 'GPS LIVE' : 'GPS STANDBY'}
        </div>
      </header>

      <main className="content">
        <div className="meter-card glass">
          <div className="label">TOTAL FARE</div>
          <div className="fare-display meter-font">
            <span className="currency">ETB</span>
            {fare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-label">DISTANCE</div>
              <div className="stat-value meter-font">{distance.toFixed(2)} <small>km</small></div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-label">WAITING</div>
              <div className="stat-value meter-font">{waitingMinutes} <small>min</small></div>
            </div>
          </div>
        </div>

        <div className="actions">
          {!isActive ? (
            <button className="btn-primary start-btn" onClick={startRide}>
              START RIDE
            </button>
          ) : (
            <button className="btn-danger stop-btn" onClick={stopRide}>
              STOP RIDE
            </button>
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
              <label>Base Fare (ETB)</label>
              <input type="number" defaultValue={100} />
            </div>
            <div className="setting-input">
              <label>Rate per KM</label>
              <input type="number" defaultValue={50} />
            </div>
            <button className="btn-primary" onClick={() => setShowSettings(false)}>SAVE</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
