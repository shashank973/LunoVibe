import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';
import { BookOpen, Calendar, Music, Trash2 } from 'lucide-react';

export default function Journal() {
  const { activeMood } = useTheme();
  const { currentTrack } = usePlayer();
  const [entries, setEntries] = useState([]);
  const [notes, setNotes] = useState('');
  
  // Load journal entries from local storage
  useEffect(() => {
    const saved = localStorage.getItem('lunovibe_journal');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  const handleSaveEntry = (e) => {
    e.preventDefault();
    if (!notes.trim()) return;

    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      mood: activeMood,
      notes: notes,
      song: currentTrack ? {
        title: currentTrack.title,
        artist: currentTrack.artist,
        id: currentTrack.id,
        thumbnail: currentTrack.thumbnail
      } : null
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('lunovibe_journal', JSON.stringify(updated));
    setNotes('');
  };

  const handleDeleteEntry = (id) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('lunovibe_journal', JSON.stringify(updated));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Journal Entry Form */}
      <form onSubmit={handleSaveEntry} className="glass-panel" style={{
        padding: '20px',
        border: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} className="glow-text" />
          <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Mood Journal & Song Memories</h4>
        </div>
        
        <textarea
          placeholder="Capture your thoughts... What is happening in your mind right now?"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '12px',
            color: '#fff',
            fontSize: '13px',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* Active Song binding feedback */}
          {currentTrack ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
              <Music size={12} className="glow-text" />
              <span>Memories linked to: <b style={{ color: '#fff' }}>{currentTrack.title.slice(0, 24)}...</b></span>
            </div>
          ) : (
            <span style={{ fontSize: '11px', color: '#64748b' }}>No track playing (Memory will save standalone)</span>
          )}

          <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '12px' }}>
            Record Memory
          </button>
        </div>
      </form>

      {/* History timeline scrolling */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '340px',
        overflowY: 'auto'
      }} className="journal-scroll-container">
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#475569', padding: '20px' }}>
            No recorded memories yet. Jot down your first thought above!
          </p>
        ) : (
          entries.map((entry) => (
            <div 
              key={entry.id}
              className="glass-panel"
              style={{
                padding: '16px',
                border: '1px solid var(--card-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                position: 'relative'
              }}
            >
              {/* Delete trigger */}
              <button
                onClick={() => handleDeleteEntry(entry.id)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >
                <Trash2 size={14} />
              </button>

              {/* Timestamp & Mood Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                <Calendar size={12} style={{ color: '#64748b' }} />
                <span style={{ color: '#64748b' }}>{entry.date}</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--card-border)',
                  color: 'hsl(var(--primary-mood))',
                  fontWeight: '700',
                  fontSize: '9px'
                }}>
                  {entry.mood}
                </span>
              </div>

              {/* Note text */}
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', textAlign: 'left' }}>
                {entry.notes}
              </p>

              {/* Bound Song memory card details */}
              {entry.song && (
                <div style={{
                  background: 'rgba(0,0,0,0.15)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid rgba(255,255,255,0.02)'
                }}>
                  <img 
                    src={entry.song.thumbnail} 
                    alt={entry.song.title} 
                    style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#fff', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.song.title}
                    </span>
                    <span style={{ fontSize: '9px', color: '#64748b' }}>{entry.song.artist}</span>
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}
