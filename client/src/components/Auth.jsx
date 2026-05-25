import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { User, Lock, Mail, ArrowRight, Music, Shield, Sparkles } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const { activeMood, setActiveMood } = useTheme();
  const [activeTab, setActiveTab] = useState('login'); // login, register, guest
  
  // Login states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register states
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle local user database
  const getUsers = () => {
    try {
      const u = localStorage.getItem('lunovibe_registered_users');
      return u ? JSON.parse(u) : [];
    } catch(e) {
      return [];
    }
  };

  const saveUser = (newUser) => {
    const users = getUsers();
    users.push(newUser);
    localStorage.setItem('lunovibe_registered_users', JSON.stringify(users));
  };

  const handleMoodSelect = (moodName) => {
    setActiveMood(moodName);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setError("Please fill in all login fields");
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      const users = getUsers();
      const matched = users.find(u => u.username.toLowerCase() === loginUsername.trim().toLowerCase());
      
      if (!matched || matched.password !== loginPassword) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      onLoginSuccess({
        username: matched.username,
        avatar: matched.avatar || "🎧",
        email: matched.email,
        isGuest: false
      });
      setLoading(false);
    }, 1000);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError("Please fill in all registration fields");
      return;
    }
    if (regUsername.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (regPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      const users = getUsers();
      const exists = users.some(u => u.username.toLowerCase() === regUsername.trim().toLowerCase());
      
      if (exists) {
        setError("Username is already taken");
        setLoading(false);
        return;
      }

      const avatars = ["🇮🇳", "🎧", "⚡", "🛸", "🔥", "🔮", "🧘"];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

      const newUser = {
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        avatar: randomAvatar
      };

      saveUser(newUser);
      setSuccess("Account created successfully!");
      
      setTimeout(() => {
        onLoginSuccess({
          username: newUser.username,
          avatar: newUser.avatar,
          email: newUser.email,
          isGuest: false
        });
        setLoading(false);
      }, 800);
    }, 1000);
  };

  const handleGuestLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        username: "Guest Voyager",
        avatar: "🛸",
        isGuest: true
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="auth-wrapper" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      position: 'relative'
    }}>
      <div className="glass-panel auth-card" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* Logo Section */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, hsl(var(--primary-mood)) 0%, hsl(var(--secondary-mood)) 100%)',
            boxShadow: '0 0 20px rgba(var(--primary-mood), 0.4)',
            marginBottom: '16px'
          }}>
            <Music size={32} color="#030712" />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0' }} className="glow-text">LunoVibe</h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>Your Futuristic Emotional Music Ecosystem</p>
        </div>

        {/* Dynamic Mood Onboarding */}
        <div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '12px', textAlign: 'left' }}>
            Pick your current frequency:
          </p>
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            justifyContent: 'flex-start'
          }} className="mood-scroll-container">
            {["Banaras Ghat Vibes", "Late Night Coding", "Sad", "Chill", "Happy", "Focus"].map((mood) => {
              const active = activeMood === mood;
              return (
                <button
                  key={mood}
                  onClick={() => handleMoodSelect(mood)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: active ? 'hsl(var(--primary-mood))' : 'rgba(255,255,255,0.08)',
                    background: active ? 'rgba(var(--primary-mood), 0.1)' : 'rgba(255,255,255,0.02)',
                    color: active ? 'hsl(var(--primary-mood))' : '#94a3b8',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: active ? '700' : '500',
                    transition: 'all 0.3s'
                  }}
                >
                  {mood}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
          padding: '4px'
        }}>
          {['login', 'register', 'guest'].map(tab => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab); setError(''); setSuccess(''); }} 
              style={{
                background: activeTab === tab ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none', color: activeTab === tab ? '#fff' : '#64748b',
                padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'login' ? 'Sign In' : tab === 'register' ? 'Sign Up' : 'Guest'}
            </button>
          ))}
        </div>

        {/* Notifications */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '10px',
            borderRadius: '10px',
            fontSize: '12px'
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            padding: '10px',
            borderRadius: '10px',
            fontSize: '12px'
          }}>
            {success}
          </div>
        )}

        {/* Tab Contents */}
        <div style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input 
                  type="text"
                  placeholder="Username"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    padding: '10px 12px 10px 38px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input 
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    padding: '10px 12px 10px 38px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                {loading ? "Verifying..." : "Sign In"}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input 
                  type="text"
                  placeholder="Username (at least 3 chars)"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    padding: '10px 12px 10px 38px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input 
                  type="email"
                  placeholder="Email Address"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    padding: '10px 12px 10px 38px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input 
                  type="password"
                  placeholder="Password (at least 4 chars)"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    padding: '10px 12px 10px 38px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          {activeTab === 'guest' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                Access the ecosystem immediately with guest credentials. No password needed, profile resets on logout.
              </p>
              <button 
                onClick={handleGuestLogin} 
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? "Entering Space..." : "Enter as Guest"} 
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
          )}

        </div>

        {/* Footer notes */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#475569' }}>
          <Shield size={12} />
          <span>Persistent Local Credentials. Safe & Secure Sandbox.</span>
        </div>
      </div>
    </div>
  );
}
