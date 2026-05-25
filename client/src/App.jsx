import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PlayerProvider } from './context/PlayerContext';
import { ambientEngine } from './services/ambientEngine';
import Visualizer from './components/Visualizer';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MusicPlayer from './components/MusicPlayer';
import { Music, Radio, Sparkles, BookOpen, Compass, Power, Sunrise } from 'lucide-react';

function LunoVibeApp() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lunovibe_session_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuth, setShowAuth] = useState(false); // Controls Landing Page -> Auth transition
  const { activeMood, t } = useTheme();

  // If session exists, automatically bypass landing page
  useEffect(() => {
    if (user) {
      setShowAuth(true);
    }
  }, []);

  // Helper to trigger audio engine activation on first interaction
  const handleLaunch = () => {
    // Start Audio Context to bypass browser policies
    ambientEngine.init();
    ambientEngine.resume();
    // Save state globally so PlayerContext can trigger resume
    window.ambientEngineReady = () => {
      ambientEngine.init();
      ambientEngine.resume();
    };
    setShowAuth(true);
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('lunovibe_session_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    setShowAuth(false);
    localStorage.removeItem('lunovibe_session_user');
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('lunovibe_session_user', JSON.stringify(updatedUser));
  };

  return (
    <div className="app-container">
      
      {/* Cinematic Floating Canvas Visualizer Backdrop */}
      <Visualizer />

      {/* Glow Orbs */}
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />

      {/* Main Content Router */}
      {!user ? (
        !showAuth ? (
          /* SECTION: Cinematic Landing Page */
          <div className="landing-page" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '40px 20px',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div className="glass-panel" style={{
              width: '100%',
              maxWidth: '800px',
              padding: '60px 40px',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px'
            }}>
              
              {/* Header Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '30px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '12px',
                fontWeight: '700',
                color: 'hsl(var(--primary-mood))'
              }} className="pulse-glow-element">
                <Sparkles size={12} />
                <span>MEET THE FUTURE OF SOUNDSCAPES</span>
              </div>

              {/* Title Header */}
              <div>
                <h1 style={{
                  fontSize: '56px',
                  fontWeight: '900',
                  lineHeight: '1.1',
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.7) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Emotional Music Ecosystem
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#94a3b8',
                  maxWidth: '580px',
                  margin: '0 auto',
                  lineHeight: '1.6'
                }}>
                  LunoVibe balances your frequency. A cinematic dashboard combining YouTube Music, real-time procedural synthesizers, and Indian cultural vibes.
                </p>
              </div>

              {/* Launcher CTA */}
              <button 
                onClick={handleLaunch} 
                className="btn-primary" 
                style={{
                  fontSize: '15px',
                  padding: '14px 40px',
                  borderRadius: '30px',
                  letterSpacing: '0.5px'
                }}
              >
                Launch LunoVibe Space
              </button>

              {/* Feature Grid Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                width: '100%',
                marginTop: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.15)' }}>
                  <Sunrise size={20} style={{ color: 'hsl(var(--primary-mood))' }} />
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>Banaras Ghat & Indian Vibes</h4>
                  <p style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>Immerse in floating diyas, temple bells, and monsoon chai tracks.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.15)' }}>
                  <Radio size={20} style={{ color: 'hsl(var(--primary-mood))' }} />
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>Synthesized Ambience</h4>
                  <p style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>Blend custom procedural rain, key clicks, and train tracks.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.15)' }}>
                  <BookOpen size={20} style={{ color: 'hsl(var(--primary-mood))' }} />
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>Mood Journal Memories</h4>
                  <p style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>Save text reflections tied automatically to the song playing.</p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* SECTION: Auth Mode */
          <Auth onLoginSuccess={handleLoginSuccess} />
        )
      ) : (
        /* SECTION: Dashboard + Bottom Player Mode */
        <>
          {/* Top minimal navbar */}
          <div className="glass-panel" style={{
            padding: '14px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '0',
            borderWidth: '0 0 1px 0',
            borderBottomColor: 'var(--card-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Music size={22} className="glow-text" />
              <h1 style={{ fontSize: '20px', fontWeight: '800' }} className="glow-text">LunoVibe</h1>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--card-border)',
                color: '#ef4444',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              <Power size={12} />
              {t('logout')}
            </button>
          </div>

          {/* Main Dashboard Panel */}
          <Dashboard user={user} onUserUpdate={handleUserUpdate} />

          {/* Immersive Bottom Floating Player console */}
          <MusicPlayer />
        </>
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <LunoVibeApp />
      </PlayerProvider>
    </ThemeProvider>
  );
}
