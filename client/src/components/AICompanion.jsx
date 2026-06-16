import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';
import CURATED_TRACKS from '../data/curatedTracks';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
import { Send, Bot, Sparkles, RefreshCcw } from 'lucide-react';

export default function AICompanion() {
  const { activeMood, themeData } = useTheme();
  const { playTrack } = usePlayer();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [typing, setTyping] = useState(false);
  
  const chatEndRef = useRef(null);

  // Load intro message when mood changes
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: 'ai',
        text: themeData.companion.intro,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [activeMood, themeData]);

  // Autoscroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: userTime
    }]);

    setInputValue('');
    setTyping(true);

    // Simulate AI reply
    setTimeout(async () => {
      let replyText = "I feel that. Let's let the frequencies take care of it.";
      
      const textLower = userText.toLowerCase();

      // Custom triggers
      if (textLower.includes('play') || textLower.includes('recommend') || textLower.includes('song')) {
        // AI recommends a specific song based on mood and triggers playing it!
        try {
          const res = await fetch(`${API_BASE || ''}/api/recommendations?mood=${encodeURIComponent(activeMood)}`);
          if (!res.ok) throw new Error('API failed');
          const tracks = await res.json();
          if (tracks && tracks.length > 0) {
            const index = Math.floor(Math.random() * tracks.length);
            const recommendedTrack = tracks[index];
            replyText = `How about we listen to "${recommendedTrack.title}" by ${recommendedTrack.artist}? I have loaded it into your player.`;
            playTrack(recommendedTrack);
          } else {
            // fallback to local curated tracks filtered by mood
            const local = CURATED_TRACKS.filter(t => t.moods && t.moods.includes(activeMood));
            if (local.length > 0) {
              const pick = local[Math.floor(Math.random() * local.length)];
              replyText = `How about we listen to "${pick.title}" by ${pick.artist}? I have loaded it into your player.`;
              playTrack(pick);
            } else {
              replyText = `I recommend looking up some soothing lo-fi for this ${activeMood} atmosphere.`;
            }
          }
        } catch (err) {
          // API failed — use local curated fallback
          const local = CURATED_TRACKS.filter(t => t.moods && t.moods.includes(activeMood));
          if (local.length > 0) {
            const pick = local[Math.floor(Math.random() * local.length)];
            replyText = `How about we listen to "${pick.title}" by ${pick.artist}? I have loaded it into your player.`;
            playTrack(pick);
          } else {
            replyText = "I suggest playing some soft classical sitar beats to align your chakras.";
          }
        }
      } else if (textLower.includes('banaras') || textLower.includes('kashi') || textLower.includes('ganga')) {
        replyText = "Kashi represents the eternal circle of life. Standing on the ghats, listening to the morning bells, you realize how small our daily worries are. Breathe in the divine energy.";
      } else if (textLower.includes('code') || textLower.includes('programming') || textLower.includes('error')) {
        replyText = "Ah, bugs. Think of them as riddle blocks. Take a sip of water, focus on the low-fi bassline, and check your syntax block. The solution is already in your mind.";
      } else if (textLower.includes('sad') || textLower.includes('depress') || textLower.includes('lonely')) {
        replyText = "I hear you. Sadness is just your heart needing a rest. You don't have to put on a brave face here. Just lie back and let these soft chords carry the weight for a while.";
      } else {
        // Fallback to random theme reply
        const replies = themeData.companion.replies;
        replyText = replies[Math.floor(Math.random() * replies.length)];
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setTyping(false);
    }, 1500);
  };

  const triggerSuggestedPrompt = (promptText) => {
    setInputValue(promptText);
  };

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '380px',
      border: '1px solid var(--card-border)',
      overflow: 'hidden'
    }}>
      {/* Bot Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--card-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(var(--primary-mood), 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(var(--primary-mood), 0.2)'
          }}>
            <Bot size={18} className="glow-text" />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{themeData.companion.name}</h4>
            <span style={{ fontSize: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Active Companion
            </span>
          </div>
        </div>
        <Sparkles size={16} className="glow-text" />
      </div>

      {/* Message List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }} className="chat-scroll-container">
        {messages.map((m) => {
          const isAI = m.sender === 'ai';
          return (
            <div 
              key={m.id}
              style={{
                alignSelf: isAI ? 'flex-start' : 'flex-end',
                maxWidth: '80%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isAI ? 'flex-start' : 'flex-end',
                gap: '4px'
              }}
            >
              <div style={{
                background: isAI ? 'rgba(255,255,255,0.04)' : 'rgba(var(--primary-mood), 0.15)',
                border: '1px solid',
                borderColor: isAI ? 'rgba(255,255,255,0.06)' : 'rgba(var(--primary-mood), 0.3)',
                padding: '10px 14px',
                borderRadius: isAI ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                color: isAI ? '#e2e8f0' : '#fff',
                fontSize: '12.5px',
                lineHeight: '1.4',
                textAlign: 'left'
              }}>
                {m.text}
              </div>
              <span style={{ fontSize: '9px', color: '#475569' }}>{m.time}</span>
            </div>
          );
        })}
        {typing && (
          <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '16px 16px 16px 4px', fontSize: '11px', color: '#64748b' }}>
            {themeData.companion.name} is humming...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick prompts */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '0 20px 8px 20px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {["Play a song", "Tell me about Banaras", "How to fix my bugs?"].map((prompt) => (
          <button
            key={prompt}
            onClick={() => triggerSuggestedPrompt(prompt)}
            style={{
              padding: '4px 10px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--card-border)',
              color: '#94a3b8',
              fontSize: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(var(--primary-mood), 0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Form */}
      <form onSubmit={handleSend} style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--card-border)',
        display: 'flex',
        gap: '8px',
        background: 'rgba(0,0,0,0.15)'
      }}>
        <input 
          type="text"
          placeholder="Speak to your mood companion..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--card-border)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#fff',
            fontSize: '12.5px',
            outline: 'none'
          }}
        />
        <button 
          type="submit"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary-mood)) 0%, hsl(var(--secondary-mood)) 100%)',
            border: 'none',
            borderRadius: '10px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#030712',
            cursor: 'pointer'
          }}
        >
          <Send size={16} fill="currentColor" />
        </button>
      </form>
    </div>
  );
}
