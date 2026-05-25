import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { ambientEngine } from '../services/ambientEngine';
import { Mic, MicOff, RefreshCw, X } from 'lucide-react';

export default function VoiceAssistant({ onClose }) {
  const { playTrack, togglePlay, playNext, searchSongs } = usePlayer();
  const { activeMood, setActiveMood } = useTheme();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('Click start to speak commands.');
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      setFeedback('Speech recognition is not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-IN'; // support Indian accent English!

    rec.onstart = () => {
      setIsListening(true);
      setFeedback('Listening... Speak now.');
    };

    rec.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      processCommand(result);
    };

    rec.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        setFeedback('No speech detected. Try again.');
      } else {
        setFeedback(`Error: ${event.error}. Click to retry.`);
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
  }, []);

  const toggleListening = () => {
    if (!supported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const processCommand = async (commandText) => {
    const cmd = commandText.toLowerCase().trim();
    console.log("Processing Voice Command:", cmd);
    setFeedback(`Heard: "${commandText}"`);

    // 1. Play / Pause
    if (cmd.includes('pause') || cmd.includes('stop music')) {
      togglePlay();
      setFeedback("Paused playback.");
      return;
    }
    if (cmd.includes('play') && (cmd.includes('song') || cmd.includes('music') || cmd.includes('track'))) {
      togglePlay();
      setFeedback("Resumed playback.");
      return;
    }

    // 2. Next track
    if (cmd.includes('next') || cmd.includes('skip')) {
      playNext();
      setFeedback("Playing next song.");
      return;
    }

    // 3. Mood adjustments (Happy, Sad, Chill, Focus, Workout, Banaras, Coding, Rainy)
    const moodsList = ['happy', 'sad', 'chill', 'focus', 'workout', 'romantic', 'lonely', 'party', 'travel', 'overthinking', 'coding', 'rainy', 'hostel', 'banaras', 'ghat'];
    for (const m of moodsList) {
      if (cmd.includes(m)) {
        let match = 'Chill';
        if (m === 'happy') match = 'Happy';
        else if (m === 'sad') match = 'Sad';
        else if (m === 'focus') match = 'Focus';
        else if (m === 'workout') match = 'Workout';
        else if (m === 'romantic') match = 'Romantic';
        else if (m === 'lonely') match = 'Lonely';
        else if (m === 'party') match = 'Party';
        else if (m === 'travel') match = 'Travel';
        else if (m === 'overthinking') match = 'Overthinking';
        else if (m === 'coding') match = 'Late Night Coding';
        else if (m === 'rainy') match = 'Rainy Mood';
        else if (m === 'hostel') match = 'Hostel Night';
        else if (m === 'banaras' || m === 'ghat') match = 'Banaras Ghat Vibes';

        setActiveMood(match);
        setFeedback(`Shifted mood coordinates to: ${match}`);
        return;
      }
    }

    // 4. Ambient sounds trigger
    if (cmd.includes('ambient') || cmd.includes('sound')) {
      if (cmd.includes('rain')) {
        const on = cmd.includes('on') || cmd.includes('play') || cmd.includes('start');
        ambientEngine.setVolume('rain', on ? 0.4 : 0);
        setFeedback(`Rain ambient sound ${on ? 'Activated' : 'Muted'}.`);
        return;
      }
      if (cmd.includes('bell') || cmd.includes('temple')) {
        const on = cmd.includes('on') || cmd.includes('play') || cmd.includes('start');
        ambientEngine.setVolume('bells', on ? 0.3 : 0);
        setFeedback(`Temple bells ambient sound ${on ? 'Activated' : 'Muted'}.`);
        return;
      }
      if (cmd.includes('keyboard') || cmd.includes('typing')) {
        const on = cmd.includes('on') || cmd.includes('play') || cmd.includes('start');
        ambientEngine.setVolume('keyboard', on ? 0.25 : 0);
        setFeedback(`Keyboard typing ambient sound ${on ? 'Activated' : 'Muted'}.`);
        return;
      }
      if (cmd.includes('train')) {
        const on = cmd.includes('on') || cmd.includes('play') || cmd.includes('start');
        ambientEngine.setVolume('train', on ? 0.35 : 0);
        setFeedback(`Train track ambient sound ${on ? 'Activated' : 'Muted'}.`);
        return;
      }
    }

    // 5. Search & Play Song fallback: "play [song name]"
    if (cmd.startsWith('play ')) {
      const songQuery = cmd.replace('play ', '');
      setFeedback(`Searching for "${songQuery}"...`);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(songQuery)}`);
        const tracks = await res.json();
        if (tracks && tracks.length > 0) {
          playTrack(tracks[0]);
          setFeedback(`Now playing: "${tracks[0].title}"`);
        } else {
          setFeedback(`Could not find any songs matching "${songQuery}".`);
        }
      } catch (e) {
        setFeedback("Failed to perform search query via voice.");
      }
      return;
    }

    setFeedback(`Command not recognized: "${commandText}"`);
  };

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      width: '100%',
      maxWidth: '300px',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'center'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '800' }} className="glow-text">Voice Navigator</h4>
        {onClose && (
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Mic glowing pulsing orb */}
      <button 
        onClick={toggleListening}
        disabled={!supported}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          border: '2px solid',
          borderColor: isListening ? 'hsl(var(--primary-mood))' : 'rgba(255,255,255,0.1)',
          background: isListening ? 'rgba(var(--primary-mood), 0.15)' : 'rgba(255,255,255,0.02)',
          color: isListening ? 'hsl(var(--primary-mood))' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: isListening ? '0 0 25px rgba(var(--primary-mood), 0.5)' : 'none',
          position: 'relative'
        }}
      >
        {isListening ? (
          <>
            <Mic size={28} />
            <span style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid hsl(var(--primary-mood))',
              animation: 'pulseGlow 1.5s infinite',
              opacity: 0.6
            }} />
          </>
        ) : (
          <MicOff size={28} />
        )}
      </button>

      {/* Details Box */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <p style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '600', minHeight: '34px', lineHeight: '1.4' }}>
          {feedback}
        </p>
        {transcript && (
          <p style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', marginTop: '6px' }}>
            "{transcript}"
          </p>
        )}
      </div>

      {/* Commands Cheat Sheet */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '10px',
        padding: '10px',
        width: '100%',
        fontSize: '10px',
        color: '#64748b',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <span style={{ fontWeight: '700', color: '#94a3b8', marginBottom: '2px' }}>Try saying:</span>
        <span>• "Play Kesariya"</span>
        <span>• "Mood Banaras Ghat Vibes"</span>
        <span>• "Ambient rain on"</span>
        <span>• "Skip song" / "Pause"</span>
      </div>
    </div>
  );
}
