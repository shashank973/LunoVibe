import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ambientEngine } from '../services/ambientEngine';
import { Play, Pause, RotateCcw, CheckSquare, Plus, Trash } from 'lucide-react';

export default function Pomodoro() {
  const { setActiveMood } = useTheme();
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [sessionType, setSessionType] = useState('focus'); // focus, shortBreak, longBreak
  
  // Tasks list
  const [tasks, setTasks] = useState([
    { id: 1, text: "Write clean modular CSS files", completed: true },
    { id: 2, text: "Configure Web Audio oscillators", completed: false }
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  const timerRef = useRef(null);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const handleSessionEnd = () => {
    // Play local synthesizer bell chime to warn user!
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.0);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.0);

    alert(`${sessionType === 'focus' ? 'Focus session completed! Time for a break.' : 'Break over! Let’s lock back in.'}`);
  };

  const startTimer = () => {
    setTimerActive(true);
    // Shift context mood to Focus automatically!
    if (sessionType === 'focus') {
      setActiveMood('Focus');
      // Apply nice productivity focus soundscape preset
      ambientEngine.setVolume('rain', 0.25);
      ambientEngine.setVolume('keyboard', 0.15);
      ambientEngine.setVolume('bells', 0);
      ambientEngine.setVolume('train', 0);
    }
  };

  const pauseTimer = () => {
    setTimerActive(false);
  };

  const resetTimer = (type = sessionType) => {
    setTimerActive(false);
    setSessionType(type);
    if (type === 'focus') setTimeLeft(25 * 60);
    else if (type === 'shortBreak') setTimeLeft(5 * 60);
    else if (type === 'longBreak') setTimeLeft(15 * 60);
  };

  // SVG Circular progress math
  const totalDuration = sessionType === 'focus' ? 25 * 60 : (sessionType === 'shortBreak' ? 5 * 60 : 15 * 60);
  const progressRatio = timeLeft / totalDuration;
  const strokeDashoffset = 283 * (1 - progressRatio); // 283 is circumference of r=45 circle

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Task actions
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

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: '24px',
      alignItems: 'start'
    }} className="pomodoro-grid">
      
      {/* Timer Circular visualizer */}
      <div className="glass-panel" style={{
        padding: '24px',
        border: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Session Type Selectors */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(0,0,0,0.2)',
          padding: '4px',
          borderRadius: '10px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          <button 
            onClick={() => resetTimer('focus')}
            style={{
              padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              background: sessionType === 'focus' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: sessionType === 'focus' ? '#fff' : '#64748b'
            }}
          >
            Focus
          </button>
          <button 
            onClick={() => resetTimer('shortBreak')}
            style={{
              padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              background: sessionType === 'shortBreak' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: sessionType === 'shortBreak' ? '#fff' : '#64748b'
            }}
          >
            Short Break
          </button>
          <button 
            onClick={() => resetTimer('longBreak')}
            style={{
              padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              background: sessionType === 'longBreak' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: sessionType === 'longBreak' ? '#fff' : '#64748b'
            }}
          >
            Long Break
          </button>
        </div>

        {/* Circular Countdown Progress SVG */}
        <div style={{ position: 'relative', width: '150px', height: '150px' }}>
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
                filter: 'drop-shadow(0 0 8px hsl(var(--primary-mood)))'
              }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{formatTime(timeLeft)}</span>
            <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>{sessionType}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {timerActive ? (
            <button onClick={pauseTimer} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '12px' }}>
              <Pause size={14} />
              Pause
            </button>
          ) : (
            <button onClick={startTimer} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', fontSize: '12px' }}>
              <Play size={14} fill="currentColor" />
              Start Flow
            </button>
          )}
          <button onClick={() => resetTimer()} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '12px' }}>
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

      </div>

      {/* Focus Micro-Tasks Checklist */}
      <div className="glass-panel" style={{
        padding: '24px',
        border: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '272px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare size={16} className="glow-text" />
          <h4 style={{ fontSize: '14px', fontWeight: '800' }}>Tasks to Complete</h4>
        </div>

        {/* Task List */}
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
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.02)'
              }}
            >
              <div 
                onClick={() => toggleTask(task.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
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
                onClick={() => deleteTask(task.id)}
                style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer' }}
              >
                <Trash size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '6px' }}>
          <input 
            type="text" 
            placeholder="Add a focus task..."
            value={newTaskText}
            onChange={e => setNewTaskText(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#fff',
              fontSize: '12px',
              outline: 'none'
            }}
          />
          <button 
            type="submit"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary-mood)) 0%, hsl(var(--secondary-mood)) 100%)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#030712',
              cursor: 'pointer'
            }}
          >
            <Plus size={14} />
          </button>
        </form>

      </div>

    </div>
  );
}
