import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, VolumeX, Mic, AlignLeft, ChevronDown, Heart } from 'lucide-react';
import AmbientMixer from './AmbientMixer';
import VoiceAssistant from './VoiceAssistant';

export default function MusicPlayer() {
  const {
    isPlaying,
    currentTrack,
    progress,
    duration,
    volume,
    isMuted,
    isLooping,
    isShuffled,
    lyrics,
    currentLyricIndex,
    togglePlay,
    seekTo,
    changeVolume,
    toggleMute,
    playNext,
    playPrevious,
    toggleLikeTrack,
    isTrackLiked
  } = usePlayer();

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAmbientMixer, setShowAmbientMixer] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  const lyricsContainerRef = useRef(null);

  // Auto-scroll active lyric line into center of full screen viewport
  useEffect(() => {
    if (isFullScreen && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.querySelector('.active-lyric-line');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentLyricIndex, isFullScreen]);

  // Helper to format time (e.g. 132 -> "2:12")
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Attempt to extract an album/movie name from YouTube-style titles
  const getAlbumFromTitle = (title) => {
    if (!title) return null;
    const t = String(title).trim();
    // Common patterns: "Song - Album", "Song - Album | Artist", "Song | Album"
    const dashParts = t.split(' - ').map(s => s.trim()).filter(Boolean);
    if (dashParts.length >= 2) {
      const candidate = dashParts[1].split('|')[0].trim();
      if (candidate && candidate.length > 1 && candidate.length < 60) return candidate;
    }
    const pipeParts = t.split('|').map(s => s.trim()).filter(Boolean);
    if (pipeParts.length >= 2) {
      const candidate = pipeParts[1].split('-')[0].trim();
      if (candidate && candidate.length > 1 && candidate.length < 60) return candidate;
    }
    return null;
  };

  const handleProgressBarChange = (e) => {
    seekTo(parseFloat(e.target.value));
  };

  if (!currentTrack) {
    return (
      <div 
        className="glass-panel" 
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
          Select a song or search to start your emotional sound journey.
        </p>
      </div>
    );
  }

  const activeLyricText = lyrics[currentLyricIndex]?.text || "";

  return (
    <>
      {/* Floating Control Overlays (Ambient Mixer and Voice assistant) */}
      <div style={{
        position: 'fixed',
        bottom: '120px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        zIndex: 101, // Keep above FullScreen Player if needed
        alignItems: 'flex-end',
        pointerEvents: 'none'
      }}>
        {showAmbientMixer && (
          <div style={{ pointerEvents: 'auto' }} className="fade-in">
            <AmbientMixer onClose={() => setShowAmbientMixer(false)} />
          </div>
        )}
        {showVoiceAssistant && (
          <div style={{ pointerEvents: 'auto' }} className="fade-in">
            <VoiceAssistant onClose={() => setShowVoiceAssistant(false)} />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. CINEMATIC FULL SCREEN PLAYER OVERLAY                                 */}
      {/* ========================================================================= */}
      {isFullScreen && (
        <div 
          className="fade-in"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            background: 'linear-gradient(180deg, rgba(var(--primary-mood), 0.12) 0%, #02040a 80%, #000 100%)',
            backdropFilter: 'blur(50px)',
            WebkitBackdropFilter: 'blur(50px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '30px 40px',
            animation: 'fadeIn 0.4s ease-out'
          }}
        >
          {/* Top Minimize bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={() => setIsFullScreen(false)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'hsl(var(--primary-mood))'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              <ChevronDown size={24} />
            </button>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Playing from LunoVibe Space
            </span>
            <div style={{ width: '44px' }} /> {/* placeholder for alignment */}
          </div>

          {/* Full Screen Body Grid */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '60px',
              maxWidth: '1100px',
              margin: '0 auto',
              width: '100%',
              alignItems: 'center',
              flex: 1
            }}
            className="fullscreen-player-grid"
          >
            {/* Column 1: Album Art and Details */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', textAlign: 'center' }}>
              <img 
                src={currentTrack.thumbnail || "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg"} 
                alt={currentTrack.title}
                style={{
                  width: '320px',
                  height: '320px',
                  borderRadius: '24px',
                  objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,0.1)',
                  boxShadow: isPlaying 
                    ? '0 20px 50px rgba(0,0,0,0.6), 0 0 35px rgba(var(--primary-mood), 0.4)' 
                    : '0 20px 40px rgba(0,0,0,0.5)',
                  transform: isPlaying ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: isPlaying ? 'orbFloat 8s infinite alternate' : 'none'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '440px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', width: '100%' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: '#fff',
                    lineHeight: '1.3',
                    margin: 0
                  }}>
                    {currentTrack.title}
                  </h2>
                  <button
                    onClick={() => toggleLikeTrack(currentTrack)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                      color: isTrackLiked(currentTrack.id) ? '#ef4444' : '#64748b',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    title={isTrackLiked(currentTrack.id) ? "Unlike song" : "Like song"}
                  >
                    <Heart size={24} fill={isTrackLiked(currentTrack.id) ? '#ef4444' : 'transparent'} />
                  </button>
                </div>
                <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0 }}>{currentTrack.artist}</p>
                {/* Try to show album if available, otherwise attempt to parse from title */}
                { (currentTrack.album || getAlbumFromTitle(currentTrack.title)) && (
                  <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>{currentTrack.album || getAlbumFromTitle(currentTrack.title)}</p>
                ) }
                <span style={{ 
                  fontSize: '10px', 
                  color: 'hsl(var(--primary-mood))', 
                  border: '1px solid rgba(var(--primary-mood), 0.2)',
                  borderRadius: '12px',
                  padding: '2px 10px',
                  width: 'fit-content',
                  margin: '8px auto 0 auto',
                  fontWeight: '700'
                }}>
                  {currentTrack.genre}
                </span>
              </div>
            </div>

            {/* Column 2: Scrollable Synced Lyrics */}
            <div 
              ref={lyricsContainerRef}
              style={{
                width: '100%',
                height: '420px',
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                scrollPadding: '100px 0'
              }}
              className="chat-scroll-container"
            >
              {lyrics.map((line, i) => {
                const active = currentLyricIndex === i;
                return (
                  <p 
                    key={i}
                    onClick={() => seekTo(line.time)}
                    className={active ? 'active-lyric-line' : ''}
                    style={{
                      fontSize: active ? '22px' : '16px',
                      fontWeight: active ? '800' : '500',
                      color: active ? 'hsl(var(--primary-mood))' : '#475569',
                      textShadow: active ? '0 0 15px rgba(var(--primary-mood), 0.5)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: active ? 'scale(1.02)' : 'scale(1)',
                      lineHeight: '1.4',
                      opacity: active ? 1 : 0.4
                    }}
                    onMouseEnter={e => { if(!active) e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { if(!active) e.currentTarget.style.color = '#475569'; }}
                  >
                    {line.text}
                  </p>
                );
              })}
            </div>

          </div>

          {/* Full Screen Controls Footer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            
            {/* Timeline */}
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', minWidth: '40px', textAlign: 'right' }}>{formatTime(progress)}</span>
              <input 
                type="range"
                min="0"
                max={duration || 100}
                value={progress}
                onChange={handleProgressBarChange}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '11px', color: '#64748b', minWidth: '40px' }}>{formatTime(duration)}</span>
            </div>

            {/* Playback Controls & Settings Mixer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              
              {/* Volume */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '150px' }}>
                <button onClick={toggleMute} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => changeVolume(parseInt(e.target.value))}
                  style={{ width: '80px' }}
                />
              </div>

              {/* Main Core triggers */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <button 
                  onClick={() => {}}
                  style={{ background: 'transparent', border: 'none', color: isShuffled ? 'hsl(var(--primary-mood))' : '#64748b', cursor: 'pointer' }}
                >
                  <Shuffle size={20} />
                </button>
                <button 
                  onClick={playPrevious}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  <SkipBack size={24} />
                </button>
                <button 
                  onClick={togglePlay}
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary-mood)) 0%, hsl(var(--secondary-mood)) 100%)',
                    border: 'none',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#030712',
                    boxShadow: '0 8px 25px rgba(var(--primary-mood), 0.4)'
                  }}
                >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />}
                </button>
                <button 
                  onClick={playNext}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  <SkipForward size={24} />
                </button>
                <button 
                  onClick={() => {}}
                  style={{ background: 'transparent', border: 'none', color: isLooping ? 'hsl(var(--primary-mood))' : '#64748b', cursor: 'pointer' }}
                >
                  <Repeat size={20} />
                </button>
              </div>

              {/* Extras toggler */}
              <div style={{ display: 'flex', gap: '16px', width: '150px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowAmbientMixer(!showAmbientMixer)}
                  style={{ background: 'transparent', border: 'none', color: showAmbientMixer ? 'hsl(var(--primary-mood))' : '#94a3b8', cursor: 'pointer' }}
                >
                  <Volume2 size={22} />
                </button>
                <button 
                  onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
                  style={{ background: 'transparent', border: 'none', color: showVoiceAssistant ? 'hsl(var(--primary-mood))' : '#94a3b8', cursor: 'pointer' }}
                >
                  <Mic size={22} />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STANDARD MINIMIZED BOTTOM PLAYER BAR                                 */}
      {/* ========================================================================= */}
      <div 
        className="glass-panel pulse-glow-element" 
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          padding: '16px 28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          zIndex: 10,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Track Card Details (Clicking this opens the full-screen view) */}
        <div 
          onClick={() => setIsFullScreen(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            minWidth: '220px', 
            flex: '1 0 auto',
            cursor: 'pointer'
          }}
          title="Click to expand cinematic view"
        >
          <img 
            src={currentTrack.thumbnail || "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg"} 
            alt={currentTrack.title}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              objectFit: 'cover',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: isPlaying ? '0 0 15px rgba(var(--primary-mood), 0.3)' : 'none',
              animation: isPlaying ? 'orbFloat 6s infinite alternate' : 'none'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '240px', textAlign: 'left' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentTrack.title}
            </h4>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{currentTrack.artist}</span>
            
            {/* Active minified lyric line showing below standard track details */}
            {activeLyricText ? (
              <span style={{ 
                fontSize: '11px', 
                color: 'hsl(var(--primary-mood))',
                fontWeight: '600',
                textShadow: '0 0 8px rgba(var(--primary-mood), 0.3)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '220px',
                marginTop: '2px'
              }}>
                💬 {activeLyricText}
              </span>
            ) : (
              <span style={{ 
                fontSize: '9px', 
                color: 'hsl(var(--primary-mood))', 
                border: '1px solid rgba(var(--primary-mood), 0.2)',
                borderRadius: '10px',
                padding: '1px 6px',
                width: 'fit-content',
                marginTop: '4px',
                fontWeight: '700'
              }}>
                {currentTrack.genre}
              </span>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); toggleLikeTrack(currentTrack); }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              color: isTrackLiked(currentTrack.id) ? '#ef4444' : '#64748b',
              transition: 'transform 0.2s',
              zIndex: 12
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.25)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            title={isTrackLiked(currentTrack.id) ? "Unlike song" : "Like song"}
          >
            <Heart size={20} fill={isTrackLiked(currentTrack.id) ? '#ef4444' : 'transparent'} />
          </button>
        </div>

        {/* Center Playback controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          flex: '2 0 320px'
        }}>
          {/* Main Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => {}}
              style={{ background: 'transparent', border: 'none', color: isShuffled ? 'hsl(var(--primary-mood))' : '#64748b', cursor: 'pointer' }}
            >
              <Shuffle size={18} />
            </button>
            <button 
              onClick={playPrevious}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <SkipBack size={20} />
            </button>
            <button 
              onClick={togglePlay}
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary-mood)) 0%, hsl(var(--secondary-mood)) 100%)',
                border: 'none',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#030712',
                boxShadow: '0 4px 10px rgba(var(--primary-mood), 0.3)'
              }}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />}
            </button>
            <button 
              onClick={playNext}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <SkipForward size={20} />
            </button>
            <button 
              onClick={() => {}}
              style={{ background: 'transparent', border: 'none', color: isLooping ? 'hsl(var(--primary-mood))' : '#64748b', cursor: 'pointer' }}
            >
              <Repeat size={18} />
            </button>
          </div>

          {/* Timeline slider */}
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', minWidth: '30px', textAlign: 'right' }}>{formatTime(progress)}</span>
            <input 
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={handleProgressBarChange}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '11px', color: '#64748b', minWidth: '30px' }}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Feature Toggles */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          minWidth: '220px',
          justifyContent: 'flex-end',
          flex: '1 0 auto'
        }}>
          {/* Volume Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={toggleMute} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input 
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => changeVolume(parseInt(e.target.value))}
              style={{ width: '80px' }}
            />
          </div>

          {/* Vertical Separator */}
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

          {/* Extra Triggers */}
          <button 
            onClick={() => setIsFullScreen(true)} // Toggles cinematic cover/lyrics view
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#94a3b8', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Open Cinematic View"
          >
            <AlignLeft size={20} />
          </button>
          
          <button 
            onClick={() => setShowAmbientMixer(!showAmbientMixer)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: showAmbientMixer ? 'hsl(var(--primary-mood))' : '#94a3b8', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Volume2 size={20} />
          </button>

          <button 
            onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: showVoiceAssistant ? 'hsl(var(--primary-mood))' : '#94a3b8', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Mic size={20} />
          </button>
        </div>
      </div>
    </>
  );
}
