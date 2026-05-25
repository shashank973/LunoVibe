import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ambientEngine } from '../services/ambientEngine';
import { Play, Pause, RotateCcw, CheckSquare, Plus, Trash, Volume2, Radio, Sparkles } from 'lucide-react';

const SCALES = [
  { name: 'C (Safed 1)', freq: 261.63 },
  { name: 'C# (Kali 1)', freq: 277.18 },
  { name: 'D (Safed 2)', freq: 146.83 },
  { name: 'D# (Kali 2)', freq: 155.56 },
  { name: 'E (Safed 3)', freq: 164.81 },
  { name: 'F (Safed 4)', freq: 174.61 },
  { name: 'F# (Kali 3)', freq: 185.00 },
  { name: 'G (Safed 5)', freq: 196.00 },
  { name: 'G# (Kali 4)', freq: 207.65 },
  { name: 'A (Safed 6)', freq: 220.00 },
  { name: 'A# (Kali 5)', freq: 233.08 },
  { name: 'B (Safed 7)', freq: 246.94 }
];


export default function FlowZone() {
  const { setActiveMood, language, t } = useTheme();
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [sessionType, setSessionType] = useState('focus'); // focus, shortBreak, longBreak
  const [sessionCompletedText, setSessionCompletedText] = useState('');

  // Tanpura states
  const [tanpuraActive, setTanpuraActive] = useState(false);
  const [tanpuraScale, setTanpuraScale] = useState(277.18); // default C#
  const [tanpuraTuning, setTanpuraTuning] = useState('Sa-Only'); // default to 'Sa-Only' (Pure Sa)
  const [tanpuraVolume, setTanpuraVolume] = useState(0.4);

  // Tasks list
  const [tasks, setTasks] = useState([
    { id: 1, text: "Focus on deep breathing", completed: false },
    { id: 2, text: "Listen to the background drone", completed: false }
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  // Refs for audio loops
  const tanpuraAudioCtxRef = useRef(null);
  const tanpuraGainNodeRef = useRef(null);
  const tanpuraIntervalRef = useRef(null);

  // Clean, non-blocking React countdown timer loop
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  // Clean trigger for when timer finishes
  useEffect(() => {
    if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      handleSessionEnd();
    }
  }, [timeLeft, timerActive]);

  // Handle non-blocking alerts
  const handleSessionEnd = () => {
    // Play a gentle bell warning chime
    try {
      const warningCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = warningCtx.createOscillator();
      const gain = warningCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, warningCtx.currentTime); // High C
      gain.gain.setValueAtTime(0.15, warningCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, warningCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(warningCtx.destination);
      osc.start();
      osc.stop(warningCtx.currentTime + 1.2);
    } catch (e) {
      console.error(e);
    }

    const typeMsg = sessionType === 'focus' 
      ? (language === 'hi' ? 'एकाग्रता सत्र पूरा हुआ! थोड़ा विश्राम करें।' : 'Focus space completed! Enjoy your break.')
      : (language === 'hi' ? 'विश्राम पूरा हुआ! चलिए वापस ध्यान लगाते हैं।' : 'Break over! Let’s focus back in.');
    
    setSessionCompletedText(typeMsg);
    setTimeout(() => setSessionCompletedText(''), 6000); // clear after 6s
  };

  // Start focus timer
  const startTimer = () => {
    setTimerActive(true);
    if (sessionType === 'focus') {
      setActiveMood('Focus');
      // Cocoon user in nice atmospheric focus settings
      ambientEngine.setVolume('rain', 0.2);
      ambientEngine.setVolume('keyboard', 0.1);
    }
  };

  const pauseTimer = () => {
    setTimerActive(false);
    stopTanpuraDrone();
    ambientEngine.setVolume('rain', 0);
    ambientEngine.setVolume('keyboard', 0);
  };

  const resetTimer = (type = sessionType) => {
    setTimerActive(false);
    setSessionType(type);
    if (type === 'focus') setTimeLeft(25 * 60);
    else if (type === 'shortBreak') setTimeLeft(5 * 60);
    else if (type === 'longBreak') setTimeLeft(15 * 60);
    stopTanpuraDrone();
    ambientEngine.setVolume('rain', 0);
    ambientEngine.setVolume('keyboard', 0);
  };

  // Circular timer geometry math
  const totalDuration = sessionType === 'focus' ? 25 * 60 : (sessionType === 'shortBreak' ? 5 * 60 : 15 * 60);
  const progressRatio = timeLeft / totalDuration;
  const strokeDashoffset = 283 * (1 - progressRatio);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Add tasks
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks(prev => [...prev, {
      id: Date.now(),
      text: newTaskText,
      completed: false
    }]);
    setNewTaskText('');
  };

  // =========================================================================
  // NATIVE TANPURA SYNTHESIS (Web Audio API additive oscillator model)
  // =========================================================================
  const startTanpuraDrone = (overrideFreq, overrideTuning) => {
    // 1. Clean up any existing running AudioContext and loops first to prevent duplicate playbacks
    if (tanpuraIntervalRef.current) {
      clearTimeout(tanpuraIntervalRef.current);
    }
    if (tanpuraAudioCtxRef.current) {
      try {
        tanpuraAudioCtxRef.current.close();
      } catch (e) {}
      tanpuraAudioCtxRef.current = null;
    }

    try {
      const activeFreq = overrideFreq !== undefined ? overrideFreq : tanpuraScale;
      const activeTuning = overrideTuning !== undefined ? overrideTuning : tanpuraTuning;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      tanpuraAudioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(tanpuraVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      tanpuraGainNodeRef.current = masterGain;

      setTanpuraActive(true);

      let stringIndex = 0;

      const pluckString = (pitchHz, stringIdx) => {
        const now = ctx.currentTime;
        const duration = 4.0; // long resonance of string

        // Noise pluck node for the initial pick contact
        const pluckLength = 0.02; // 20ms click
        const pluckBuffer = ctx.createBuffer(1, ctx.sampleRate * pluckLength, ctx.sampleRate);
        const pluckData = pluckBuffer.getChannelData(0);
        for (let i = 0; i < pluckBuffer.length; i++) {
          pluckData[i] = (Math.random() * 2 - 1) * Math.exp(-i / 100);
        }
        const pluckNode = ctx.createBufferSource();
        pluckNode.buffer = pluckBuffer;

        const pluckFilter = ctx.createBiquadFilter();
        pluckFilter.type = 'bandpass';
        pluckFilter.frequency.setValueAtTime(1000, now);
        pluckFilter.Q.setValueAtTime(5, now);

        const pluckGain = ctx.createGain();
        pluckGain.gain.setValueAtTime(0.06, now);
        pluckGain.gain.exponentialRampToValueAtTime(0.001, now + pluckLength);

        // Core string models (Triangle, detuned Sawtooth)
        const osc1 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(pitchHz, now);

        // Jawari buzzing string (sawtooth with slight random detuning)
        const osc2 = ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(pitchHz * 1.003, now);
        osc2.detune.setValueAtTime((Math.random() - 0.5) * 15, now);

        // Harmonic overtones for buzzing Jawari (3rd and 5th harmonics)
        const osc3 = ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(pitchHz * 3.0, now);

        const osc4 = ctx.createOscillator();
        osc4.type = 'sine';
        osc4.frequency.setValueAtTime(pitchHz * 5.0, now);

        // Bandpass filter to sweep frequency and mimic dynamic Jeevala/Jawari buzz
        const buzzFilter = ctx.createBiquadFilter();
        buzzFilter.type = 'bandpass';
        buzzFilter.Q.setValueAtTime(2.0, now);
        buzzFilter.frequency.setValueAtTime(800, now);
        buzzFilter.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
        buzzFilter.frequency.exponentialRampToValueAtTime(320, now + duration * 0.65);

        // Overall lowpass filter to warm the tone
        const lpFilter = ctx.createBiquadFilter();
        lpFilter.type = 'lowpass';
        lpFilter.frequency.setValueAtTime(2200, now);

        // Volume Envelope
        const stringGain = ctx.createGain();
        stringGain.gain.setValueAtTime(0, now);
        stringGain.gain.linearRampToValueAtTime(0.38, now + 0.04);
        stringGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        // Connections
        pluckNode.connect(pluckFilter);
        pluckFilter.connect(pluckGain);
        pluckGain.connect(masterGain);

        osc1.connect(lpFilter);
        osc2.connect(buzzFilter);
        osc3.connect(buzzFilter);
        osc4.connect(buzzFilter);
        buzzFilter.connect(lpFilter);
        lpFilter.connect(stringGain);
        stringGain.connect(masterGain);

        // Start
        pluckNode.start(now);
        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        osc4.start(now);

        // Stop
        osc1.stop(now + duration);
        osc2.stop(now + duration);
        osc3.stop(now + duration);
        osc4.stop(now + duration);
      };

      const triggerSequence = () => {
        let pitch = activeFreq;

        if (activeTuning === 'Sa-Only') {
          // Plays only Sa notes: String 1: Low Sa (0.5), String 2 & 3: Sa (1.0), String 4: Low Sa (0.5)
          if (stringIndex === 0 || stringIndex === 3) {
            pitch = activeFreq * 0.5;
          } else {
            pitch = activeFreq;
          }
        } else if (activeTuning === 'Pa-Sa') {
          // Pa (0.75 of baseFreq) -> Sa -> Sa -> Low Sa (0.5)
          if (stringIndex === 0) {
            pitch = activeFreq * 0.75;
          } else if (stringIndex === 1 || stringIndex === 2) {
            pitch = activeFreq;
          } else {
            pitch = activeFreq * 0.5;
          }
        } else if (activeTuning === 'Ma-Sa') {
          // Ma (0.67 of baseFreq) -> Sa -> Sa -> Low Sa (0.5)
          if (stringIndex === 0) {
            pitch = activeFreq * 0.67;
          } else if (stringIndex === 1 || stringIndex === 2) {
            pitch = activeFreq;
          } else {
            pitch = activeFreq * 0.5;
          }
        }

        pluckString(pitch, stringIndex);

        // Move to the next string (0, 1, 2, 3)
        stringIndex = (stringIndex + 1) % 4;

        // Plucking interval timing
        const delay = stringIndex === 0 ? 1800 : 1200;
        tanpuraIntervalRef.current = setTimeout(triggerSequence, delay);
      };

      triggerSequence();
    } catch (e) {
      console.error("Failed to start Tanpura synthesizer:", e);
    }
  };

  const stopTanpuraDrone = () => {
    setTanpuraActive(false);
    if (tanpuraIntervalRef.current) clearTimeout(tanpuraIntervalRef.current);
    if (tanpuraAudioCtxRef.current) {
      try {
        tanpuraAudioCtxRef.current.close();
      } catch(e) {}
    }
    tanpuraAudioCtxRef.current = null;
  };

  // Update Tanpura settings on the fly
  useEffect(() => {
    if (tanpuraGainNodeRef.current && tanpuraAudioCtxRef.current) {
      tanpuraGainNodeRef.current.gain.setValueAtTime(tanpuraVolume, tanpuraAudioCtxRef.current.currentTime);
    }
  }, [tanpuraVolume]);

  // Clean up Tanpura loops on unmount
  useEffect(() => {
    return () => {
      if (tanpuraIntervalRef.current) clearTimeout(tanpuraIntervalRef.current);
      if (tanpuraAudioCtxRef.current) {
        try {
          tanpuraAudioCtxRef.current.close();
        } catch(e) {}
      }
      ambientEngine.setVolume('rain', 0);
      ambientEngine.setVolume('keyboard', 0);
    };
  }, []);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: '30px',
      alignItems: 'start'
    }} className="pomodoro-grid">
      
      {/* Column 1: Dhyan Space Countdown Timer */}
      <div className="glass-panel" style={{
        padding: '30px 24px',
        border: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800' }} className="glow-text">
            🧘 {language === 'hi' ? 'ध्यान कक्ष' : language === 'hinglish' ? 'Dhyan Space' : 'Dhyan Space (Focus)'}
          </h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Cocoon yourself in deep concentration. Toggle focus cycles below.
          </p>
        </div>

        {/* non-blocking success toast */}
        {sessionCompletedText && (
          <div className="fade-in" style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '600',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.2)'
          }}>
            {sessionCompletedText}
          </div>
        )}

        {/* Selectors */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(0,0,0,0.25)',
          padding: '4px',
          borderRadius: '10px',
          fontSize: '11px',
          fontWeight: '700'
        }}>
          {[
            { id: 'focus', label: language === 'hi' ? 'ध्यान सत्र' : 'Focus' },
            { id: 'shortBreak', label: language === 'hi' ? 'छोटा ब्रेक' : 'Short Break' },
            { id: 'longBreak', label: language === 'hi' ? 'बड़ा ब्रेक' : 'Long Break' }
          ].map(type => (
            <button 
              key={type.id}
              onClick={() => resetTimer(type.id)}
              style={{
                padding: '6px 14px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                background: sessionType === type.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: sessionType === type.id ? '#fff' : '#64748b',
                fontWeight: '700',
                transition: 'all 0.2s'
              }}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Circular Countdown Progress SVG */}
        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
          <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.02)" strokeWidth="4" fill="transparent" />
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              stroke="hsl(var(--primary-mood))" 
              strokeWidth="4" 
              fill="transparent" 
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 1s linear',
                filter: 'drop-shadow(0 0 10px hsl(var(--primary-mood)))'
              }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '32px', fontWeight: '850', fontFamily: 'var(--font-heading)' }}>{formatTime(timeLeft)}</span>
            <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>{sessionType}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {timerActive ? (
            <button onClick={pauseTimer} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontSize: '12.5px', fontWeight: '700' }}>
              <Pause size={14} />
              Pause
            </button>
          ) : (
            <button onClick={startTimer} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', fontSize: '12.5px', fontWeight: '800' }}>
              <Play size={14} fill="currentColor" />
              Start Flow
            </button>
          )}
          <button onClick={() => resetTimer()} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontSize: '12.5px' }}>
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

      </div>

      {/* Column 2: Tanpura & Task Planner Deck */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Section 1: Tanpura Drone generator */}
        <div className="glass-panel" style={{
          padding: '24px',
          border: '1px solid var(--card-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={16} className="glow-text" />
              <h4 style={{ fontSize: '14px', fontWeight: '800' }}>Indian Tanpura Drone</h4>
            </div>
            
            <button
              onClick={tanpuraActive ? stopTanpuraDrone : startTanpuraDrone}
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                background: tanpuraActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                color: tanpuraActive ? '#10b981' : '#cbd5e1',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: tanpuraActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              {tanpuraActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '-4px', textAlign: 'left' }}>
            Play plucking harmonic string layers to align base pitch resonance.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Scale select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <label style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Scale / Shruti</label>
              <select
                value={tanpuraScale}
                onChange={e => {
                  const freq = parseFloat(e.target.value);
                  setTanpuraScale(freq);
                  startTanpuraDrone(freq, tanpuraTuning);
                }}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--card-border)',
                  color: '#fff',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  outline: 'none'
                }}
              >
                {SCALES.map(sc => (
                  <option key={sc.freq} value={sc.freq}>{sc.name}</option>
                ))}
              </select>
            </div>

            {/* Tuning style */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <label style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Tuning / Swar</label>
              <select
                value={tanpuraTuning}
                onChange={e => {
                  const tuningVal = e.target.value;
                  setTanpuraTuning(tuningVal);
                  if (tanpuraActive) {
                    startTanpuraDrone(tanpuraScale, tuningVal);
                  }
                }}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--card-border)',
                  color: '#fff',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  outline: 'none'
                }}
              >
                <option value="Sa-Only">Sa Only (Pure Drone)</option>
                <option value="Pa-Sa">Pa - Sa (Normal)</option>
                <option value="Ma-Sa">Ma - Sa (Fourth)</option>
              </select>
            </div>
          </div>

          {/* Volume slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', fontWeight: '600' }}>
              <span>Tanpura Volume</span>
              <span>{Math.round(tanpuraVolume * 100)}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={tanpuraVolume}
              onChange={e => setTanpuraVolume(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

        </div>

        {/* Section 2: Tasks Checklist */}
        <div className="glass-panel" style={{
          padding: '24px',
          border: '1px solid var(--card-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          height: '210px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={16} className="glow-text" />
            <h4 style={{ fontSize: '14px', fontWeight: '800' }}>Focus Checklist</h4>
          </div>

          {/* Task list view */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }} className="task-scroll-container">
            {tasks.map((task) => (
              <div 
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.02)'
                }}
              >
                <div 
                  onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '11.5px',
                    color: task.completed ? '#475569' : '#e2e8f0',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    textAlign: 'left'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={task.completed} 
                    onChange={() => {}} 
                    style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary-mood))' }}
                  />
                  <span>{task.text}</span>
                </div>
                <button 
                  onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))}
                  style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer' }}
                >
                  <Trash size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Task input */}
          <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '6px' }}>
            <input 
              type="text" 
              placeholder="Add item..."
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: '#fff',
                fontSize: '11.5px',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              className="btn-primary"
              style={{
                borderRadius: '8px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              <Plus size={14} />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
