import React, { useState, useEffect } from 'react';
import { ambientEngine } from '../services/ambientEngine';
import { CloudRain, Bell, Keyboard, Train, Volume2, X } from 'lucide-react';

export default function AmbientMixer({ onClose }) {
  const [volumes, setVolumes] = useState({
    rain: 0,
    bells: 0,
    keyboard: 0,
    train: 0
  });

  // Pull initial volume states
  useEffect(() => {
    setVolumes({
      rain: ambientEngine.getVolume('rain'),
      bells: ambientEngine.getVolume('bells'),
      keyboard: ambientEngine.getVolume('keyboard'),
      train: ambientEngine.getVolume('train')
    });
  }, []);

  const handleVolumeChange = (sound, val) => {
    const numericVolume = parseFloat(val);
    setVolumes(prev => ({ ...prev, [sound]: numericVolume }));
    ambientEngine.setVolume(sound, numericVolume);
  };

  const handleMuteAll = () => {
    Object.keys(volumes).forEach(sound => {
      handleVolumeChange(sound, 0);
    });
  };

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      width: '100%',
      maxWidth: '340px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      border: '1px solid rgba(255,255,255,0.08)',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 size={20} className="glow-text" />
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Ambient Soundscapes</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '-10px' }}>
        Blend real-time procedural synthesizers to create your custom acoustic environment.
      </p>

      {/* Sliders Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Rain */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CloudRain size={16} style={{ color: '#6be0ff' }} />
              Monsoon Rain
            </span>
            <span style={{ color: '#94a3b8' }}>{Math.round(volumes.rain * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volumes.rain}
            onChange={(e) => handleVolumeChange('rain', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Temple Bells */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={16} style={{ color: '#ff9100' }} />
              Temple Bells (Kashi)
            </span>
            <span style={{ color: '#94a3b8' }}>{Math.round(volumes.bells * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volumes.bells}
            onChange={(e) => handleVolumeChange('bells', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Keyboard Typing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Keyboard size={16} style={{ color: '#00ff3c' }} />
              Mechanical Typing
            </span>
            <span style={{ color: '#94a3b8' }}>{Math.round(volumes.keyboard * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volumes.keyboard}
            onChange={(e) => handleVolumeChange('keyboard', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Train Tracks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Train size={16} style={{ color: '#7b61ff' }} />
              Train Journey Tracks
            </span>
            <span style={{ color: '#94a3b8' }}>{Math.round(volumes.train * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volumes.train}
            onChange={(e) => handleVolumeChange('train', e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

      </div>

      {/* Footer controls */}
      <button 
        onClick={handleMuteAll}
        className="btn-secondary"
        style={{
          width: '100%',
          fontSize: '12px',
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.02)',
          textAlign: 'center'
        }}
      >
        Mute All Ambient sounds
      </button>
    </div>
  );
}
