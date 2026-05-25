import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { ambientEngine } from '../services/ambientEngine';
import { Search, Flame, CloudSun, Moon, Music, Sparkles, Sunrise, Compass, MapPin, Heart, Plus, Edit } from 'lucide-react';
import AICompanion from './AICompanion';
import ListeningRooms from './ListeningRooms';
import Journal from './Journal';
import FlowZone from './FlowZone';

export default function Dashboard({ user, onUserUpdate }) {
  const { activeMood, setActiveMood, language, setLanguage, t } = useTheme();
  const {
    searchResults,
    searchLoading,
    suggestions,
    searchQuery,
    searchSongs,
    getSearchSuggestions,
    setSuggestions,
    playTrack,
    setAndPlayQueue,
    isPlaying,
    togglePlay,
    playlists,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    toggleLikeTrack,
    isTrackLiked
  } = usePlayer();

  const [query, setQuery] = useState('');
  const [activeVibe, setActiveVibe] = useState(null);
  const [activeTab, setActiveTab] = useState('explore'); // explore, focus, playlists, social, journal
  const [weather, setWeather] = useState('Monsoon Rain'); // Monsoon Rain, Sunny Ghat, Mist/Fog, Cool Breeze
  const [trendingTracks, setTrendingTracks] = useState([]);

  // Profile Edit states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);

  // Playlist States
  const [selectedPlaylist, setSelectedPlaylist] = useState('Liked Songs');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activeAddPlaylistTrackId, setActiveAddPlaylistTrackId] = useState(null);

  // Fetch initial trending tracks on load
  useEffect(() => {
    fetch('/api/trending')
      .then(res => res.json())
      .then(data => setTrendingTracks(data))
      .catch(err => console.error("Failed to load trending tracks:", err));
  }, []);

  const handleUsernameSave = (e) => {
    e.preventDefault();
    if (!newUsername.trim() || newUsername.trim().length < 3) return;
    
    // Update session user details
    const updatedUser = { ...user, username: newUsername.trim() };
    onUserUpdate(updatedUser);
    
    // Rename playlists in localStorage for consistency
    try {
      const oldPlaylists = localStorage.getItem(`lunovibe_playlists_${user.username}`);
      if (oldPlaylists) {
        localStorage.setItem(`lunovibe_playlists_${newUsername.trim()}`, oldPlaylists);
        localStorage.removeItem(`lunovibe_playlists_${user.username}`);
      }
    } catch(err) {}
    
    setIsEditingUsername(false);
    
    // Dispatch global sync event to update PlayerContext playlists
    window.dispatchEvent(new Event('lunovibe_user_sync'));
  };

  // Set initial suggestions
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    getSearchSuggestions(val);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchSongs(query);
    setSuggestions([]);
  };

  const handleSuggestionClick = (sug) => {
    setQuery(sug);
    searchSongs(sug);
    setSuggestions([]);
  };

  // Indian Cultural Vibe Experiences Preset Loader
  const loadVaranasiVibe = async (vibeType) => {
    if (window.ambientEngineReady) {
      window.ambientEngineReady();
    }
    
    // If the selected vibe is already active, toggle it off (mute everything & pause music)
    if (activeVibe === vibeType) {
      setActiveVibe(null);
      ambientEngine.setVolume('rain', 0);
      ambientEngine.setVolume('bells', 0);
      ambientEngine.setVolume('keyboard', 0);
      ambientEngine.setVolume('train', 0);
      if (isPlaying) {
        togglePlay();
      }
      return;
    }
    
    setActiveVibe(vibeType);
    let targetQuery = '';
    
    if (vibeType === 'monsoon-chai') {
      setActiveMood('Rainy Mood');
      setWeather('Monsoon Rain');
      ambientEngine.setVolume('rain', 0.55);
      ambientEngine.setVolume('bells', 0.05);
      ambientEngine.setVolume('keyboard', 0);
      ambientEngine.setVolume('train', 0);
      targetQuery = 'Monsoon Lofi Chill';
    } else if (vibeType === 'banaras-morning') {
      setActiveMood('Banaras Ghat Vibes');
      setWeather('Sunny Ghat');
      ambientEngine.setVolume('bells', 0.45);
      ambientEngine.setVolume('rain', 0);
      ambientEngine.setVolume('keyboard', 0);
      ambientEngine.setVolume('train', 0);
      targetQuery = 'Morning Sitar Flute Raga';
    } else if (vibeType === 'temple-bells') {
      setActiveMood('Banaras Ghat Vibes');
      ambientEngine.setVolume('bells', 0.7);
      ambientEngine.setVolume('rain', 0);
      ambientEngine.setVolume('keyboard', 0);
      ambientEngine.setVolume('train', 0);
      targetQuery = 'Ganga Aarti Bhajan';
    } else if (vibeType === 'hostel-rooftop') {
      setActiveMood('Hostel Night');
      setWeather('Cool Breeze');
      ambientEngine.setVolume('keyboard', 0);
      ambientEngine.setVolume('rain', 0.08); // faint sound of breeze/drizzle
      ambientEngine.setVolume('bells', 0);
      ambientEngine.setVolume('train', 0);
      targetQuery = 'Anuv Jain Husn'; // Anuv Jain acoustic indie
    } else if (vibeType === 'train-journey') {
      setActiveMood('Travel');
      setWeather('Mist/Fog');
      ambientEngine.setVolume('train', 0.6);
      ambientEngine.setVolume('rain', 0.2);
      ambientEngine.setVolume('bells', 0);
      ambientEngine.setVolume('keyboard', 0);
      targetQuery = 'Travel Bollywood Hits';
    }

    if (targetQuery) {
      // Trigger background search and load lists
      searchSongs(targetQuery);
      try {
        // Fetch and play first song automatically
        const res = await fetch(`/api/search?q=${encodeURIComponent(targetQuery)}`);
        const tracks = await res.json();
        if (tracks && tracks.length > 0) {
          setAndPlayQueue(tracks, 0);
        }
      } catch (e) {
        console.error("Autoplay search error:", e);
      }
    }
  };

  // Dynamic recommendations matching selected weather
  const weatherPlaylistQuery = {
    'Monsoon Rain': 'Anuv Jain Baarishein',
    'Sunny Ghat': 'Classical Morning Santoor',
    'Mist/Fog': 'Chill Hindi Lo-Fi',
    'Cool Breeze': 'Trending Indian Indie'
  };

  const loadWeatherRecommendation = () => {
    const q = weatherPlaylistQuery[weather];
    searchSongs(q);
  };

  return (
    <div style={{ padding: '30px 40px', paddingBottom: '140px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      
      {/* Search and Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
          {isEditingUsername ? (
            <form onSubmit={handleUsernameSave} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="text" 
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--primary-mood)',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  color: '#fff',
                  fontSize: '18px',
                  fontWeight: '700',
                  outline: 'none'
                }}
                autoFocus
              />
              <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }}>Save</button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => { setIsEditingUsername(false); setNewUsername(user.username); }}
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <h2 style={{ fontSize: '28px', fontWeight: '800', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              {t('welcome')}, {user.username}
              <button 
                onClick={() => setIsEditingUsername(true)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#94a3b8',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'hsl(var(--primary-mood))'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                <Edit size={10} />
                Edit Name
              </button>
            </h2>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', margin: '0' }}>
              <MapPin size={12} className="glow-text" /> 
              {t('moodOrbit')}: <span className="glow-text" style={{ fontWeight: '700' }}>{activeMood}</span>
            </p>
            
            {/* Language switch controls */}
            <div style={{
              display: 'inline-flex',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid rgba(255,255,255,0.04)'
            }}>
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिन्दी' },
                { code: 'hinglish', label: 'Hinglish' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  style={{
                    background: language === lang.code ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: language === lang.code ? 'hsl(var(--primary-mood))' : '#64748b',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Youtube Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: '#64748b' }} />
              <input 
                type="text"
                placeholder={t('searchPlaceholder')}
                value={query}
                onChange={handleQueryChange}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '11px 16px 11px 40px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'hsl(var(--primary-mood))'}
                onBlur={e => setTimeout(() => setSuggestions([]), 300)}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '12px' }}>
              {t('searchButton')}
            </button>
          </form>

          {/* Autocomplete suggestions popup */}
          {suggestions.length > 0 && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '50px',
              left: 0,
              right: 0,
              zIndex: 20,
              padding: '8px 0',
              border: '1px solid var(--card-border)',
              maxHeight: '260px',
              overflowY: 'auto'
            }}>
              {suggestions.map((sug, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSuggestionClick(sug)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    color: '#cbd5e1',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {sug}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        paddingBottom: '12px',
        marginBottom: '28px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'explore', label: language === 'hi' ? 'खोजें और भारतीय वाइब्स' : language === 'hinglish' ? 'Explore & Desi Vibes' : 'Explore & Indian Vibes' },
          { id: 'focus', label: t('pomodoroFocus') },
          { id: 'playlists', label: language === 'hi' ? 'मेरी प्लेलिस्ट' : language === 'hinglish' ? 'My Playlists' : 'My Playlists' },
          { id: 'social', label: t('listeningRooms') },
          { id: 'journal', label: t('journalMemories') }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === tab.id ? 'hsl(var(--primary-mood))' : '#64748b',
              fontSize: '14px',
              fontWeight: '700',
              padding: '6px 16px',
              cursor: 'pointer',
              position: 'relative',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span style={{
                position: 'absolute',
                bottom: '-13px',
                left: 0,
                right: 0,
                height: '2px',
                background: 'hsl(var(--primary-mood))',
                boxShadow: '0 0 10px hsl(var(--primary-mood))'
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'explore' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }} className="fade-in">
          
          {/* Section 1: Varanasi / Indian vibe experiences */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Compass size={18} className="glow-text" />
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{t('indianVibes')}</h3>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {[
                { id: 'monsoon-chai', title: 'Monsoon Chai Vibes', desc: 'Rain synthesis + lofi beats', icon: '🌧️' },
                { id: 'banaras-morning', title: 'Banaras Ghat Morning', desc: 'Sunrise raga + gentle bells', icon: '🌅' },
                { id: 'temple-bells', title: 'Temple Bells Ambience', desc: 'Bhajans + heavy bells mix', icon: '🔔' },
                { id: 'hostel-rooftop', title: 'Hostel Rooftop Nights', desc: 'Acoustic guitar + wind breeze', icon: '🎸' },
                { id: 'train-journey', title: 'Train Journey Mood', desc: 'Rhythmic track clicking + pop hits', icon: '🚂' }
              ].map(vibe => {
                const isActive = activeVibe === vibe.id;
                return (
                  <div 
                    key={vibe.id}
                    onClick={() => loadVaranasiVibe(vibe.id)}
                    className="glass-panel"
                    style={{
                      padding: '20px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      border: isActive ? '2px solid hsl(var(--primary-mood))' : '1px solid var(--card-border)',
                      boxShadow: isActive ? '0 0 25px rgba(var(--primary-mood), 0.35)' : 'var(--glass-glow)',
                      transform: isActive ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative'
                    }}
                  >
                    {isActive && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'hsl(var(--primary-mood))',
                        boxShadow: '0 0 10px hsl(var(--primary-mood))',
                        animation: 'pulseGlow 2s infinite'
                      }} />
                    )}
                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>{vibe.icon}</span>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: isActive ? 'hsl(var(--primary-mood))' : '#fff', marginBottom: '4px' }}>{vibe.title}</h4>
                    <p style={{ fontSize: '11px', color: '#64748b' }}>{vibe.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Grid: Weather card & Recommendation results */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', flexWrap: 'wrap' }} className="explore-mid-grid">
            
            {/* Weather Recommendation Card */}
            <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CloudSun size={18} className="glow-text" />
                <h4 style={{ fontSize: '15px', fontWeight: '800' }}>{t('weatherRecommend')}</h4>
              </div>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
                Pick your virtual weather and we will load a matching sensory soundtrack.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Monsoon Rain', 'Sunny Ghat', 'Mist/Fog', 'Cool Breeze'].map(w => (
                  <button
                    key={w}
                    onClick={() => setWeather(w)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: weather === w ? 'hsl(var(--primary-mood))' : 'rgba(255,255,255,0.04)',
                      background: weather === w ? 'rgba(var(--primary-mood), 0.1)' : 'rgba(255,255,255,0.01)',
                      color: weather === w ? '#fff' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    {w === 'Monsoon Rain' ? '🌧️ ' : w === 'Sunny Ghat' ? '☀️ ' : w === 'Mist/Fog' ? '🌫️ ' : '🍃 '}
                    {w}
                  </button>
                ))}
              </div>
              <button onClick={loadWeatherRecommendation} className="btn-primary" style={{ fontSize: '12px', width: '100%', padding: '8px' }}>
                {t('loadWeather')}
              </button>
            </div>

            {/* Recommendations or Search Results Grid */}
            <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} className="glow-text" />
                  <h4 style={{ fontSize: '15px', fontWeight: '800' }}>
                    {searchQuery ? `Search results for "${searchQuery}"` : "Sensory Curations"}
                  </h4>
                </div>
                {searchLoading && <span style={{ fontSize: '11px', color: '#64748b' }}>Warping query...</span>}
              </div>

              {/* Music List */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '280px',
                overflowY: 'auto'
              }} className="tracks-scroll-container">
                
                {/* Fallback to curated trending if search results empty */}
                {(searchResults.length > 0 ? searchResults : trendingTracks).map((track, index, arr) => (
                  <div
                    key={track.id + '-' + index}
                    onClick={() => setAndPlayQueue(arr, index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={track.thumbnail} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} alt="" />
                      <div style={{ textAlign: 'left' }}>
                        <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: '#fff', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</h5>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{track.artist}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => toggleLikeTrack(track)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                        title={isTrackLiked(track.id) ? "Unlike song" : "Like song"}
                      >
                        <Heart size={14} fill={isTrackLiked(track.id) ? '#ef4444' : 'transparent'} color={isTrackLiked(track.id) ? '#ef4444' : '#64748b'} />
                      </button>

                      <button
                        onClick={() => setActiveAddPlaylistTrackId(activeAddPlaylistTrackId === track.id ? null : track.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#64748b' }}
                        title="Add to playlist"
                      >
                        <Plus size={14} />
                      </button>

                      <span style={{ fontSize: '10px', color: 'hsl(var(--primary-mood))', fontWeight: '700' }}>{track.genre}</span>

                      {/* Playlist Selection Popup */}
                      {activeAddPlaylistTrackId === track.id && (
                        <div 
                          className="glass-panel"
                          style={{
                            position: 'absolute',
                            right: '30px',
                            bottom: '40px',
                            zIndex: 30,
                            padding: '8px',
                            border: '1px solid var(--card-border)',
                            minWidth: '150px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            background: '#0a0f1d'
                          }}
                        >
                          <span style={{ fontSize: '9px', color: '#64748b', fontWeight: '800', padding: '2px 4px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>ADD TO PLAYLIST:</span>
                          {Object.keys(playlists).map(pName => (
                            <button
                              key={pName}
                              onClick={() => { addTrackToPlaylist(pName, track); setActiveAddPlaylistTrackId(null); }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#cbd5e1',
                                fontSize: '11px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                padding: '4px 6px',
                                borderRadius: '4px',
                                display: 'block',
                                width: '100%'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              + {pName}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section: Genre lists */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Flame size={16} className="glow-text" />
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{t('exploreGenres')}</h3>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '10px'
            }} className="genre-scroll-container">
              {['Lo-fi', 'Hip-Hop', 'Bollywood', 'Devotional', 'Indie', 'Punjabi', 'Bhojpuri'].map(genre => (
                <button
                  key={genre}
                  onClick={() => searchSongs(genre)}
                  className="btn-secondary"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: '1px solid var(--card-border)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'focus' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <FlowZone />
        </div>
      )}

      {activeTab === 'playlists' && (
        <div 
          className="fade-in" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 2fr', 
            gap: '30px', 
            alignItems: 'start', 
            textAlign: 'left' 
          }}
        >
          {/* Left Column: Playlist List */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Your Playlists</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.keys(playlists).map(pName => (
                <div 
                  key={pName}
                  onClick={() => setSelectedPlaylist(pName)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: selectedPlaylist === pName ? 'hsl(var(--primary-mood))' : 'rgba(255,255,255,0.04)',
                    background: selectedPlaylist === pName ? 'rgba(var(--primary-mood), 0.1)' : 'rgba(255,255,255,0.01)',
                    color: selectedPlaylist === pName ? '#fff' : '#cbd5e1',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎵 {pName}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>({playlists[pName]?.length || 0})</span>
                    {pName !== 'Liked Songs' && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          deletePlaylist(pName); 
                          if (selectedPlaylist === pName) setSelectedPlaylist('Liked Songs'); 
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', padding: '0 4px' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Create Playlist Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPlaylistName.trim()) return;
                createPlaylist(newPlaylistName.trim());
                setSelectedPlaylist(newPlaylistName.trim());
                setNewPlaylistName('');
              }}
              style={{ display: 'flex', gap: '8px', marginTop: '8px' }}
            >
              <input 
                type="text" 
                placeholder="Create playlist..."
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
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
              <button type="submit" className="btn-primary" style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px' }}>Add</button>
            </form>
          </div>

          {/* Right Column: Playlist Tracks View */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800' }}>🎵 {selectedPlaylist}</h4>
              {playlists[selectedPlaylist]?.length > 0 && (
                <button 
                  onClick={() => setAndPlayQueue(playlists[selectedPlaylist], 0)} 
                  className="btn-primary" 
                  style={{ padding: '6px 16px', fontSize: '12px', borderRadius: '8px' }}
                >
                  Play Playlist
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }} className="tracks-scroll-container">
              {!playlists[selectedPlaylist] || playlists[selectedPlaylist].length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '12px' }}>
                  No tracks inside this playlist. Add songs using the "+" or heart icons next to tracks in "Explore".
                </div>
              ) : (
                playlists[selectedPlaylist].map((track, idx) => (
                  <div 
                    key={track.id + '-' + idx}
                    onClick={() => setAndPlayQueue(playlists[selectedPlaylist], idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={track.thumbnail} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} alt="" />
                      <div style={{ textAlign: 'left' }}>
                        <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: '#fff', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</h5>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{track.artist}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={e => e.stopPropagation()}>
                      <span style={{ fontSize: '10px', color: 'hsl(var(--primary-mood))', fontWeight: '700' }}>{track.genre}</span>
                      <button 
                        onClick={() => removeTrackFromPlaylist(selectedPlaylist, track.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }} className="social-grid fade-in">
          <ListeningRooms />
          <AICompanion />
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="fade-in" style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <Journal />
        </div>
      )}

    </div>
  );
}
