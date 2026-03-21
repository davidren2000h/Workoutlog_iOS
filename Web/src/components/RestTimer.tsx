import { useState, useEffect, useRef, useCallback } from 'react';
import { useT } from '../i18n';

const STORAGE_KEY = 'workoutlog-rest-seconds';

function getDefaultRest(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) {
      const n = parseInt(v, 10);
      if (n > 0 && n <= 600) return n;
    }
  } catch { /* ignore */ }
  return 90;
}

function saveDefaultRest(seconds: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(seconds));
  } catch { /* ignore */ }
}

/** Play a short beep using Web Audio API */
function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    // Second beep
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1100;
    gain2.gain.value = 0.3;
    osc2.start(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.35);
    setTimeout(() => ctx.close(), 500);
  } catch { /* audio not available */ }
}

interface Props {
  /** Signal to auto-start the timer (incremented each time a set is completed) */
  trigger: number;
  visible: boolean;
}

export default function RestTimer({ trigger, visible }: Props) {
  const t = useT();
  const [restDuration, setRestDuration] = useState(getDefaultRest);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTrigger = useRef(trigger);

  // Auto-start when trigger changes (set completed)
  useEffect(() => {
    if (trigger !== prevTrigger.current && trigger > 0) {
      prevTrigger.current = trigger;
      setRemaining(restDuration);
      setRunning(true);
      setFinished(false);
    }
  }, [trigger, restDuration]);

  // Countdown logic
  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setRunning(false);
            setFinished(true);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining]);

  const handleStart = useCallback(() => {
    if (remaining === 0) setRemaining(restDuration);
    setRunning(true);
    setFinished(false);
  }, [remaining, restDuration]);

  const handlePause = () => setRunning(false);

  const handleReset = () => {
    setRunning(false);
    setRemaining(restDuration);
    setFinished(false);
  };

  const handleSkip = () => {
    setRunning(false);
    setRemaining(0);
    setFinished(false);
  };

  const handleAdjust = (delta: number) => {
    const newDuration = Math.max(5, Math.min(600, restDuration + delta));
    setRestDuration(newDuration);
    saveDefaultRest(newDuration);
    if (running || remaining > 0) {
      setRemaining((prev) => Math.max(0, prev + delta));
    }
  };

  const handleEditStart = () => {
    setEditing(true);
    const m = Math.floor(restDuration / 60);
    const s = restDuration % 60;
    setEditValue(`${m}:${String(s).padStart(2, '0')}`);
  };

  const handleEditConfirm = () => {
    const parts = editValue.split(':');
    let totalSec = 0;
    if (parts.length === 2) {
      totalSec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    } else if (parts.length === 1) {
      totalSec = parseInt(parts[0], 10);
    }
    if (totalSec > 0 && totalSec <= 600) {
      setRestDuration(totalSec);
      saveDefaultRest(totalSec);
      if (running) {
        setRemaining(totalSec);
      }
    }
    setEditing(false);
  };

  if (!visible) return null;

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  const progress = restDuration > 0 ? remaining / restDuration : 0;
  const isIdle = !running && remaining === 0 && !finished;

  const defaultM = Math.floor(restDuration / 60);
  const defaultS = restDuration % 60;

  return (
    <div className={`rest-timer-bar ${finished ? 'rest-timer-done' : ''} ${running ? 'rest-timer-active' : ''}`}>
      {/* Progress track */}
      {(running || remaining > 0) && (
        <div className="rest-timer-progress" style={{ width: `${progress * 100}%` }} />
      )}

      <div className="rest-timer-content">
        {/* Countdown display */}
        <div className="rest-timer-time-section">
          <span className="rest-timer-label">{t('rest.title')}</span>
          {running || remaining > 0 ? (
            <span className={`rest-timer-countdown ${finished ? 'rest-timer-countdown-done' : ''}`}>
              {pad(m)}:{pad(s)}
            </span>
          ) : (
            <span className="rest-timer-idle">
              {finished ? t('rest.done') : `${defaultM}:${pad(defaultS)}`}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="rest-timer-controls">
          <button className="rest-timer-btn" onClick={() => handleAdjust(-15)} title="-15s">-15</button>
          
          {isIdle || finished ? (
            <button className="rest-timer-btn rest-timer-btn-start" onClick={handleStart}>
              {t('rest.start')}
            </button>
          ) : running ? (
            <button className="rest-timer-btn rest-timer-btn-pause" onClick={handlePause}>
              {t('rest.pause')}
            </button>
          ) : (
            <button className="rest-timer-btn rest-timer-btn-start" onClick={handleStart}>
              {t('rest.resume')}
            </button>
          )}

          <button className="rest-timer-btn" onClick={() => handleAdjust(15)} title="+15s">+15</button>

          {(running || remaining > 0) && (
            <button className="rest-timer-btn rest-timer-btn-skip" onClick={handleSkip}>
              {t('rest.skip')}
            </button>
          )}
        </div>

        {/* Editable default time */}
        <div className="rest-timer-default">
          {editing ? (
            <input
              className="rest-timer-edit-input"
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditConfirm}
              onKeyDown={(e) => { if (e.key === 'Enter') handleEditConfirm(); }}
              placeholder="m:ss"
            />
          ) : (
            <button className="rest-timer-edit-btn" onClick={handleEditStart} title={t('rest.editDefault')}>
              ⏱ {defaultM}:{pad(defaultS)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
