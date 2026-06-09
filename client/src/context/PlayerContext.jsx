import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);
  
  // Player state variables
  const [progress, setProgress] = useState(0); // in seconds
  const [duration, setDuration] = useState(0); // in seconds
  const [volume, setVolume] = useState(70); // 0-100
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  
  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Lyrics state
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [lyrics, setLyrics] = useState([]);

  // Playlists state loaded from localStorage dynamically based on active session
  const [playlists, setPlaylists] = useState({ 'Liked Songs': [] });

  // Sync playlists with currently logged-in user session
  const syncPlaylistsWithUser = () => {
    try {
      const savedSession = localStorage.getItem('lunovibe_session_user');
      if (savedSession) {
        const u = JSON.parse(savedSession);
        const saved = localStorage.getItem(`lunovibe_playlists_${u.username}`);
        setPlaylists(saved ? JSON.parse(saved) : { 'Liked Songs': [] });
      } else {
        setPlaylists({ 'Liked Songs': [] });
      }
    } catch (e) {
      setPlaylists({ 'Liked Songs': [] });
    }
  };

  useEffect(() => {
    syncPlaylistsWithUser();
    // Watch for updates or user switches
    const handleStorageChange = () => {
      syncPlaylistsWithUser();
    };
    window.addEventListener('storage', handleStorageChange);
    // Custom event to force update when user updates profile details or logs in
    window.addEventListener('lunovibe_user_sync', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('lunovibe_user_sync', handleStorageChange);
    };
  }, []);

  const savePlaylistsToStorage = (updatedPlaylists) => {
    setPlaylists(updatedPlaylists);
    try {
      const savedSession = localStorage.getItem('lunovibe_session_user');
      if (savedSession) {
        const u = JSON.parse(savedSession);
        localStorage.setItem(`lunovibe_playlists_${u.username}`, JSON.stringify(updatedPlaylists));
      }
    } catch(e) {
      console.error("Failed to save playlists:", e);
    }
  };

  const createPlaylist = (name) => {
    const cleanName = name.trim();
    if (!cleanName || playlists[cleanName]) return;
    const updated = { ...playlists, [cleanName]: [] };
    savePlaylistsToStorage(updated);
  };

  const deletePlaylist = (name) => {
    if (name === 'Liked Songs') return;
    const updated = { ...playlists };
    delete updated[name];
    savePlaylistsToStorage(updated);
  };

  const addTrackToPlaylist = (playlistName, track) => {
    const currentList = playlists[playlistName] || [];
    if (currentList.some(t => t.id === track.id)) return;
    const updated = {
      ...playlists,
      [playlistName]: [...currentList, track]
    };
    savePlaylistsToStorage(updated);
  };

  const removeTrackFromPlaylist = (playlistName, trackId) => {
    const currentList = playlists[playlistName] || [];
    const updated = {
      ...playlists,
      [playlistName]: currentList.filter(t => t.id !== trackId)
    };
    savePlaylistsToStorage(updated);
  };

  const toggleLikeTrack = (track) => {
    const liked = playlists['Liked Songs'] || [];
    const isAlreadyLiked = liked.some(t => t.id === track.id);
    if (isAlreadyLiked) {
      removeTrackFromPlaylist('Liked Songs', track.id);
    } else {
      addTrackToPlaylist('Liked Songs', track);
    }
  };

  const isTrackLiked = (trackId) => {
    const liked = playlists['Liked Songs'] || [];
    return liked.some(t => t.id === trackId);
  };

  // Refs for tracking latest states in event handlers to avoid stale closures
  const lyricsRef = useRef(lyrics);
  const currentTrackRef = useRef(currentTrack);
  const isLoopingRef = useRef(isLooping);
  const isPlayingRef = useRef(isPlaying);
  const isShuffledRef = useRef(isShuffled);
  const queueRef = useRef(queue);
  const currentQueueIndexRef = useRef(currentQueueIndex);

  useEffect(() => { lyricsRef.current = lyrics; }, [lyrics]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { isLoopingRef.current = isLooping; }, [isLooping]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isShuffledRef.current = isShuffled; }, [isShuffled]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentQueueIndexRef.current = currentQueueIndex; }, [currentQueueIndex]);

  // YT Player Reference
  const ytPlayerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Load YouTube Player API
  useEffect(() => {
    // Only load if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      stopProgressTracker();
    };
  }, []);

  const initPlayer = () => {
    // Create a container for the player if it doesn't exist
    let container = document.getElementById('lunovibe-hidden-yt-player');
    if (!container) {
      container = document.createElement('div');
      container.id = 'lunovibe-hidden-yt-player';
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
    }

    try {
      ytPlayerRef.current = new window.YT.Player('lunovibe-hidden-yt-player', {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: (event) => {
            console.log("YouTube Player API Ready.");
            event.target.setVolume(volume);
          },
          onStateChange: (event) => {
            handlePlayerStateChange(event.data);
          },
          onError: (event) => {
            console.error("YouTube Player Error:", event.data);
            handlePlayerError(event.data);
          }
        }
      });
    } catch (e) {
      console.error("Error creating YT Player instance:", e);
    }
  };

  const handlePlayerStateChange = (state) => {
    // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0, BUFFERING = 3
    if (state === 1) {
      setIsPlaying(true);
      startProgressTracker();
      
      // Update duration
      if (ytPlayerRef.current && ytPlayerRef.current.getDuration) {
        setDuration(ytPlayerRef.current.getDuration());
      }
    } else if (state === 2) {
      setIsPlaying(false);
      stopProgressTracker();
    } else if (state === 0) {
      setIsPlaying(false);
      stopProgressTracker();
      if (isLoopingRef.current) {
        seekTo(0);
        playTrack(currentTrackRef.current);
      } else {
        playNext();
      }
    }
  };

  const handlePlayerError = async (errorCode) => {
    const activeTrack = currentTrackRef.current;
    // 101 or 150 mean embedding restricted by owner
    if ((errorCode === 101 || errorCode === 150) && activeTrack && !activeTrack.isFallbackAttempted) {
      console.warn(`Video ${activeTrack.id} is restricted. Attempting search fallback for: ${activeTrack.title}`);
      
      try {
        const queryVal = `${activeTrack.title} ${activeTrack.artist} audio`;
        const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(queryVal)}`);
        const tracks = await res.json();
        
        // Find a different video ID
        const alternative = tracks.find(t => t.id !== activeTrack.id);
        if (alternative) {
          console.log(`Found alternative video ID: ${alternative.id}`);
          const fallbackTrack = {
            ...activeTrack,
            id: alternative.id,
            isFallbackAttempted: true // prevent infinite loop
          };
          playTrack(fallbackTrack);
          return;
        }
      } catch (e) {
        console.error("Failed to fetch fallback alternative:", e);
      }
    }
    
    // If fallback fails or not restricted, go next
    playNext();
  };

  // Progress and Lyric tracker loop
  const startProgressTracker = () => {
    stopProgressTracker();
    progressIntervalRef.current = setInterval(() => {
      // Prefer real YT time when available, otherwise advance a local timer
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const currentTime = ytPlayerRef.current.getCurrentTime();
          setProgress(currentTime);
        } catch (e) {
          // iframe might be blocked; fall through to local timer below
          setProgress(prev => +(prev + 0.2).toFixed(3));
        }
      } else {
        setProgress(prev => +(prev + 0.2).toFixed(3));
      }

      // Update active lyrics index based on the (possibly local) progress value
      const now = (typeof ytPlayerRef.current?.getCurrentTime === 'function')
        ? (ytPlayerRef.current.getCurrentTime ? ytPlayerRef.current.getCurrentTime() : 0)
        : null;
      const currentTimeForLyrics = now !== null ? now : (typeof progress === 'number' ? progress : 0);
      const currentLyrics = lyricsRef.current;
      if (currentLyrics && currentLyrics.length > 0) {
        const activeIndex = currentLyrics.findIndex((line, i) => {
          const nextLine = currentLyrics[i + 1];
          return currentTimeForLyrics >= line.time && (!nextLine || currentTimeForLyrics < nextLine.time);
        });
        setCurrentLyricIndex(activeIndex);
      }
    }, 200);
  };

  const stopProgressTracker = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  // Mock Synchronized Lyrics Generator for rich immersive UI
  const generateLyrics = (trackTitle) => {
    // Create deterministic, track-specific pseudo-lyrics so each song shows unique lines
    const titleText = (trackTitle || "Soothing Music").trim();
    const seed = titleText.toLowerCase();

    // A helper to create varied lines from title words
    const words = seed.split(/[^a-z0-9]+/).filter(Boolean);
    const center = words.length > 0 ? words[Math.floor(words.length / 2)] : 'vibe';

    const makeLine = (i) => {
      if (i === 0) return `🎵 Intro — ${titleText}`;
      if (i === 1) return `Floating on the ${center} of the melody...`;
      if (i === 2) return `Hear the ${words[0] || 'beat'} and breathe it in.`;
      if (i === 3) return `This verse is built from ${words.slice(0,2).join(' ')} echoes.`;
      if (i === 4) return `Let ${titleText.split(' ')[0]} carry your thoughts.`;
      if (i === 5) return `✨ Instrumental — waves of ${center} ✨`;
      if (i === 6) return `Bridge — the rhythm shifts like ${words[words.length-1] || 'light'}.`;
      if (i === 7) return `A soft hush, then the chorus returns.`;
      if (i === 8) return `Outro — ${titleText} fades into the night.`;
      return `...`;
    };

    const lines = [];
    // generate timestamped lines spaced by 6-12 seconds depending on index
    for (let i = 0; i < 9; i++) {
      const base = i === 0 ? 0 : (i * 8 + (seed.length % 5));
      lines.push({ time: base, text: makeLine(i) });
    }

    // If this looks like a devotional/ghat title, include a small special stanza
    if (/shiv|namami|ghat|aarti|har har|mahadev/.test(seed)) {
      lines.splice(1, 0, { time: 4, text: '🔱 Om Namah Shivaya 🔱' });
    }

    return lines;
  };

  // Music Controls
  const playTrack = (track) => {
    if (!track) return;
    
    // Ensure Web Audio / Ambient engine resumes on first user track-play
    if (window.ambientEngineReady) {
      window.ambientEngineReady();
    }

    // Attach parsed album and normalized duration (seconds) to the track for UI
    const parseAlbum = (title) => {
      if (!title) return null;
      const t = String(title).trim();
      const dashParts = t.split(' - ').map(s => s.trim()).filter(Boolean);
      if (dashParts.length >= 2) return dashParts[1].split('|')[0].trim();
      const pipeParts = t.split('|').map(s => s.trim()).filter(Boolean);
      if (pipeParts.length >= 2) return pipeParts[1].split('-')[0].trim();
      return null;
    };

    const normalizedDuration = (track.duration && track.duration > 1000) ? Math.round(track.duration / 1000) : 0;
    const trackWithMeta = { ...track, album: track.album || parseAlbum(track.title), duration: normalizedDuration };

    setCurrentTrack(trackWithMeta);
    setLyrics(generateLyrics(track.title));
    setCurrentLyricIndex(-1);
    setProgress(0);
    setIsPlaying(true);

    if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
      ytPlayerRef.current.loadVideoById(track.id, 0);
    } else {
      setTimeout(() => {
        if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
          ytPlayerRef.current.loadVideoById(track.id, 0);
        }
      }, 800);
    }
  };

  const togglePlay = () => {
    if (!currentTrack && queue.length > 0) {
      playTrack(queue[0]);
      setCurrentQueueIndex(0);
      return;
    }
    
    if (!ytPlayerRef.current) return;

    if (isPlaying) {
      ytPlayerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      ytPlayerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const seekTo = (seconds) => {
    if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      ytPlayerRef.current.seekTo(seconds, true);
      setProgress(seconds);
    }
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    if (ytPlayerRef.current && ytPlayerRef.current.setVolume) {
      ytPlayerRef.current.setVolume(newVolume);
    }
  };

  const toggleMute = () => {
    if (!ytPlayerRef.current) return;
    if (isMuted) {
      ytPlayerRef.current.unMute();
      setIsMuted(false);
    } else {
      ytPlayerRef.current.mute();
      setIsMuted(true);
    }
  };

  const playNext = () => {
    const currentQueue = queueRef.current;
    const currentIndex = currentQueueIndexRef.current;
    if (currentQueue.length === 0) return;
    let nextIndex = currentIndex + 1;
    
    if (isShuffledRef.current) {
      nextIndex = Math.floor(Math.random() * currentQueue.length);
    } else if (nextIndex >= currentQueue.length) {
      nextIndex = 0; // loop back
    }

    setCurrentQueueIndex(nextIndex);
    playTrack(currentQueue[nextIndex]);
  };

  const playPrevious = () => {
    const currentQueue = queueRef.current;
    const currentIndex = currentQueueIndexRef.current;
    if (currentQueue.length === 0) return;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = currentQueue.length - 1; // go to end
    }
    setCurrentQueueIndex(prevIndex);
    playTrack(currentQueue[prevIndex]);
  };

  const addToQueue = (track) => {
    setQueue(prev => {
      const exists = prev.find(t => t.id === track.id);
      if (exists) return prev;
      return [...prev, track];
    });
  };

  const setAndPlayQueue = (tracks, startIndex = 0) => {
    setQueue(tracks);
    setCurrentQueueIndex(startIndex);
    playTrack(tracks[startIndex]);
  };

  // Search Action from Express Backend API
  const searchSongs = async (query) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setSearchLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error("Failed to search songs:", e);
    } finally {
      setSearchLoading(false);
    }
  };

  const getSearchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/suggestions?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data);
    } catch (e) {
      console.error("Failed to get suggestions:", e);
    }
  };

  return (
    <PlayerContext.Provider value={{
      isPlaying,
      currentTrack,
      queue,
      currentQueueIndex,
      progress,
      duration,
      volume,
      isMuted,
      isLooping,
      isShuffled,
      searchResults,
      suggestions,
      searchLoading,
      searchQuery,
      lyrics,
      currentLyricIndex,
      playlists,
      createPlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      toggleLikeTrack,
      isTrackLiked,
      playTrack,
      togglePlay,
      seekTo,
      changeVolume,
      toggleMute,
      playNext,
      playPrevious,
      addToQueue,
      setAndPlayQueue,
      searchSongs,
      getSearchSuggestions,
      setSuggestions
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
