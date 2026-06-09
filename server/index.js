import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Allow configurable origins via environment variable for production deploys.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Curated database for Indian / Varanasi experiences and trending genres
const CURATED_TRACKS = [
  // Bollywood
  {
    id: "h7gyPJUPnK0",
    title: "Apna Bana Le - Bhediya",
    artist: "Arijit Singh",
    genre: "Bollywood",
    duration: 264000,
    thumbnail: "https://i.ytimg.com/vi/h7gyPJUPnK0/hqdefault.jpg",
    moods: ["Romantic", "Chill", "Travel"]
  },
  {
    id: "BddP6PYo2gs",
    title: "Kesariya - Brahmastra",
    artist: "Arijit Singh",
    genre: "Bollywood",
    duration: 292000,
    thumbnail: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg",
    moods: ["Romantic", "Happy", "Travel"]
  },
  {
    id: "0WdC47G-WwQ",
    title: "Kabira - Yeh Jawaani Hai Deewani",
    artist: "Tochi Raina, Rekha Bhardwaj",
    genre: "Bollywood",
    duration: 223000,
    thumbnail: "https://i.ytimg.com/vi/0WdC47G-WwQ/hqdefault.jpg",
    moods: ["Chill", "Banaras Ghat Vibes", "Lonely", "Travel"]
  },
  // Devotional / Banaras Ghat
  {
    id: "87wOcrf3j60",
    title: "Namami Shamishan - Shiv Stotram",
    artist: "Traditional",
    genre: "Devotional",
    duration: 535000,
    thumbnail: "https://i.ytimg.com/vi/87wOcrf3j60/hqdefault.jpg",
    moods: ["Banaras Ghat Vibes", "Focus", "Chill"]
  },
  {
    id: "zN1jW7k156M",
    title: "Achyutam Keshavam",
    artist: "Vikram Hazra",
    genre: "Devotional",
    duration: 345000,
    thumbnail: "https://i.ytimg.com/vi/zN1jW7k156M/hqdefault.jpg",
    moods: ["Banaras Ghat Vibes", "Chill", "Focus"]
  },
  // Lo-Fi / Late Night Coding
  {
    id: "jfKfPfyJRdk",
    title: "Lofi Hip Hop Radio - Study Beats",
    artist: "Lofi Girl",
    genre: "Lo-fi",
    duration: 0,
    thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    moods: ["Focus", "Late Night Coding", "Chill", "Rainy Mood"]
  },
  {
    id: "T1e0a2A1PPM",
    title: "Chidiya - Lofi Edit",
    artist: "Vilen",
    genre: "Lo-fi",
    duration: 210000,
    thumbnail: "https://i.ytimg.com/vi/T1e0a2A1PPM/hqdefault.jpg",
    moods: ["Chill", "Sad", "Overthinking", "Rainy Mood"]
  },
  // Punjabi
  {
    id: "cl0a3i2wFcc",
    title: "Brown Munde",
    artist: "AP Dhillon, Gurinder Gill",
    genre: "Hip-Hop",
    duration: 267000,
    thumbnail: "https://i.ytimg.com/vi/cl0a3i2wFcc/hqdefault.jpg",
    moods: ["Workout", "Party", "Travel"]
  },
  {
    id: "aY742L3NlXg",
    title: "Mi Amor",
    artist: "Sharn",
    genre: "Punjabi",
    duration: 198000,
    thumbnail: "https://i.ytimg.com/vi/aY742L3NlXg/hqdefault.jpg",
    moods: ["Party", "Happy", "Workout"]
  },
  // Indie / Acoustic
  {
    id: "dZ0fwJojGPA",
    title: "Baarishein",
    artist: "Anuv Jain",
    genre: "Indie",
    duration: 207000,
    thumbnail: "https://i.ytimg.com/vi/dZ0fwJojGPA/hqdefault.jpg",
    moods: ["Sad", "Chill", "Rainy Mood", "Romantic", "Lonely"]
  },
  {
    id: "PJWemSzDeZs",
    title: "Husn",
    artist: "Anuv Jain",
    genre: "Indie",
    duration: 218000,
    thumbnail: "https://i.ytimg.com/vi/PJWemSzDeZs/hqdefault.jpg",
    moods: ["Sad", "Overthinking", "Lonely", "Romantic"]
  },
  // Instrumental / Focus
  {
    id: "S348A_oM2tU",
    title: "Indian Classical Sitar & Flute",
    artist: "Ravi Shankar (Tribute)",
    genre: "Classical",
    duration: 3600000,
    thumbnail: "https://i.ytimg.com/vi/S348A_oM2tU/hqdefault.jpg",
    moods: ["Focus", "Banaras Ghat Vibes", "Chill"]
  },
  // Bhojpuri / Energizing
  {
    id: "Z7FvR3L8H_w",
    title: "Rinkiya Ke Papa",
    artist: "Manoj Tiwari",
    genre: "Bhojpuri",
    duration: 280000,
    thumbnail: "https://i.ytimg.com/vi/Z7FvR3L8H_w/hqdefault.jpg",
    moods: ["Party", "Happy"]
  }
];

// Custom YouTube search HTML scraper
async function searchYouTubeCustom(query) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await response.text();
    
    // Extract ytInitialData object
    const jsonRegex = /ytInitialData\s*=\s*({.+?});/;
    const match = html.match(jsonRegex);
    if (!match) return [];
    
    const data = JSON.parse(match[1]);
    const sections = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    
    const videos = [];
    for (const section of sections) {
      const items = section.itemSectionRenderer?.contents || [];
      for (const item of items) {
        if (item.videoRenderer) {
          const v = item.videoRenderer;
          const videoId = v.videoId;
          const title = v.title?.runs?.[0]?.text || "Unknown Title";
          const artist = v.ownerText?.runs?.[0]?.text || "YouTube Streamer";
          const durationText = v.lengthText?.simpleText || "0:00";
          
          // Parse duration text (e.g. "4:12" -> ms)
          const parts = durationText.split(':').map(Number);
          let durationMs = 0;
          if (parts.length === 2) durationMs = (parts[0] * 60 + parts[1]) * 1000;
          else if (parts.length === 3) durationMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;

          if (videoId) {
            videos.push({
              id: videoId,
              title: title,
              artist: artist,
              duration: durationMs,
              thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              genre: "Streaming"
            });
          }
        }
      }
    }
    return videos.slice(0, 15);
  } catch (e) {
    console.error("Custom search parser error:", e);
    return [];
  }
}

// Custom autocomplete search suggestions fetcher
async function getSuggestionsCustom(query) {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&client=firefox&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
      }
    });
    const data = await response.json();
    return data[1] || [];
  } catch (e) {
    console.error("Custom suggestions error:", e);
    return [];
  }
}

// Route: Real-time Search
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    const searchQuery = `${query} song`;
    const tracks = await searchYouTubeCustom(searchQuery);
    
    if (tracks.length > 0) {
      res.json(tracks);
    } else {
      // Curated database fallback
      const queryLower = query.toLowerCase();
      const filteredCurated = CURATED_TRACKS.filter(t => 
        t.title.toLowerCase().includes(queryLower) || 
        t.artist.toLowerCase().includes(queryLower)
      );
      res.json(filteredCurated.length > 0 ? filteredCurated : CURATED_TRACKS.slice(0, 8));
    }
  } catch (error) {
    console.error("Search API Error:", error);
    res.json(CURATED_TRACKS.slice(0, 8));
  }
});

// Route: Autocomplete Search Suggestions
app.get('/api/suggestions', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.json([]);
  }

  try {
    const suggestions = await getSuggestionsCustom(query);
    res.json(suggestions);
  } catch (error) {
    console.error("Suggestions API Error:", error);
    const suggestionsFallback = [
      "kesariya", "brown munde", "apna bana le", "anuv jain husn",
      "sitar classical bhajan", "banaras sandhya aarti", "lofi coding beats"
    ].filter(s => s.startsWith(query.toLowerCase()));
    res.json(suggestionsFallback);
  }
});

// Route: Get Trending
app.get('/api/trending', (req, res) => {
  res.json(CURATED_TRACKS);
});

// Route: Recommendations based on mood/genre
app.get('/api/recommendations', async (req, res) => {
  const { mood, genre } = req.query;
  let tracks = [...CURATED_TRACKS];

  if (mood) {
    tracks = tracks.filter(t => t.moods && t.moods.includes(mood));
  }
  if (genre) {
    tracks = tracks.filter(t => t.genre.toLowerCase() === genre.toLowerCase());
  }

  if (tracks.length < 5 && (mood || genre)) {
    const query = mood ? `${mood} vibe song` : `${genre} latest song`;
    try {
      const searchResults = await searchYouTubeCustom(query);
      tracks = [...tracks, ...searchResults];
    } catch (e) {
      console.warn("Backfill recommendations error:", e);
    }
  }

  const seenIds = new Set();
  const uniqueTracks = tracks.filter(t => {
    if (seenIds.has(t.id)) return false;
    seenIds.add(t.id);
    return true;
  });

  res.json(uniqueTracks);
});

app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", service: "LunoVibe Core API" });
});

app.listen(PORT, () => {
  console.log(`LunoVibe full-stack backend running on port ${PORT}`);
});
