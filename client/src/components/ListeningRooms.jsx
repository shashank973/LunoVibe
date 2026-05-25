import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { Users, Send, Radio, Check } from 'lucide-react';

const MOCK_USERS = [
  { name: "Ananya Sen", avatar: "👩‍🎤", color: "#ff3c8a" },
  { name: "Kabir Singh", avatar: "🧔", color: "#ff9100" },
  { name: "Devika Rao", avatar: "👩", color: "#3ba3fc" },
  { name: "Rohit Varma", avatar: "👨‍💻", color: "#00ff3c" }
];

const MOCK_CHAT_POOL = [
  "This rhythm matches the rain so perfectly.",
  "Banaras Ghat sunrise is something else... missing it.",
  "Har Har Mahadev! Cosmic energies right here.",
  "Perfect track to compile code to.",
  "Is anyone else studying right now?",
  "Love the temple bell ringing in the background, pure magic.",
  "LunoVibe is officially my new favorite hangout.",
  "Arijit's voice hits different at midnight."
];

export default function ListeningRooms() {
  const { currentTrack } = usePlayer();
  const { activeMood } = useTheme();
  
  const [messages, setMessages] = useState([
    { user: MOCK_USERS[0], text: "Welcome to the group vibe room!", time: "14:32" },
    { user: MOCK_USERS[1], text: "What song is this? It sounds gorgeous.", time: "14:33" }
  ]);
  const [inputText, setInputText] = useState('');
  const [activeUsers, setActiveUsers] = useState(MOCK_USERS.slice(0, 3));
  const [isSynced, setIsSynced] = useState(true);
  
  const chatEndRef = useRef(null);

  // Auto-scrolling
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate incoming real-time messages from other group members
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random user
      const speaker = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      // Pick a random text
      let text = MOCK_CHAT_POOL[Math.floor(Math.random() * MOCK_CHAT_POOL.length)];
      
      // Customize message slightly based on active song/mood
      if (currentTrack && Math.random() > 0.5) {
        text = `Listening to "${currentTrack.title.slice(0, 20)}..." right now. Pure magic.`;
      }

      setMessages(prev => [...prev, {
        user: speaker,
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      // Randomly trigger mock sync event
      if (Math.random() > 0.8) {
        setIsSynced(false);
        setTimeout(() => setIsSynced(true), 2000);
      }

    }, 12000); // message every 12 seconds

    return () => clearInterval(interval);
  }, [currentTrack]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      user: { name: "You", avatar: "🛸", color: "hsl(var(--primary-mood))" },
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Trigger immediate simulated response
    setTimeout(() => {
      const respondent = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      setMessages(prev => [...prev, {
        user: respondent,
        text: `Vibing with that, @You!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <div className="glass-panel" style={{
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      height: '380px',
      border: '1px solid var(--card-border)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--card-border)',
        background: 'rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} className="glow-text" />
          <h4 style={{ fontSize: '14px', fontWeight: '800' }}>Vibe Room: {activeMood}</h4>
        </div>
        
        {/* Sync Status Badge */}
        <button 
          onClick={() => setIsSynced(true)}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            fontWeight: '700',
            color: isSynced ? '#10b981' : 'hsl(var(--primary-mood))',
            cursor: 'pointer'
          }}
        >
          {isSynced ? (
            <>
              <Check size={12} />
              <span>Synced</span>
            </>
          ) : (
            <>
              <Radio size={12} className="pulse-glow-element" />
              <span>Click to Sync</span>
            </>
          )}
        </button>
      </div>

      {/* Messages Viewport */}
      <div style={{
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }} className="chat-scroll-container">
        {messages.map((m, idx) => {
          const isMe = m.user.name === "You";
          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}>
              {/* Sender Tag */}
              <span style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px', alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                {m.user.avatar} {m.user.name}
              </span>
              
              {/* Bubble */}
              <div style={{
                background: isMe ? 'rgba(var(--primary-mood), 0.15)' : 'rgba(255,255,255,0.03)',
                border: '1px solid',
                borderColor: isMe ? 'rgba(var(--primary-mood), 0.3)' : 'rgba(255,255,255,0.06)',
                borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                padding: '8px 12px',
                fontSize: '11.5px',
                lineHeight: '1.4',
                color: '#fff',
                textAlign: 'left'
              }}>
                {m.text}
              </div>
              <span style={{ fontSize: '8px', color: '#475569', marginTop: '2px', alignSelf: isMe ? 'flex-end' : 'flex-start' }}>{m.time}</span>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Send Message Form */}
      <form onSubmit={handleSend} style={{
        padding: '10px 16px',
        borderTop: '1px solid var(--card-border)',
        display: 'flex',
        gap: '8px',
        background: 'rgba(0,0,0,0.15)'
      }}>
        <input 
          type="text"
          placeholder="Share a vibe in the room..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            padding: '8px 12px',
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
          <Send size={14} fill="currentColor" />
        </button>
      </form>
    </div>
  );
}
