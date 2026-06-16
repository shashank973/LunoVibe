// Shared helpers and curated tracks for root serverless API
export const CURATED_TRACKS = [
  { id: "h7gyPJUPnK0", title: "Apna Bana Le - Bhediya", artist: "Arijit Singh", genre: "Bollywood", duration: 264000, thumbnail: "https://i.ytimg.com/vi/h7gyPJUPnK0/hqdefault.jpg", moods: ["Romantic", "Chill", "Travel"] },
  { id: "BddP6PYo2gs", title: "Kesariya - Brahmastra", artist: "Arijit Singh", genre: "Bollywood", duration: 292000, thumbnail: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg", moods: ["Romantic","Happy","Travel"] },
  { id: "0WdC47G-WwQ", title: "Kabira - Yeh Jawaani Hai Deewani", artist: "Tochi Raina, Rekha Bhardwaj", genre: "Bollywood", duration: 223000, thumbnail: "https://i.ytimg.com/vi/0WdC47G-WwQ/hqdefault.jpg", moods: ["Chill","Banaras Ghat Vibes","Lonely","Travel"] },
  { id: "87wOcrf3j60", title: "Namami Shamishan - Shiv Stotram", artist: "Traditional", genre: "Devotional", duration: 535000, thumbnail: "https://i.ytimg.com/vi/87wOcrf3j60/hqdefault.jpg", moods: ["Banaras Ghat Vibes","Focus","Chill"] },
  { id: "zN1jW7k156M", title: "Achyutam Keshavam", artist: "Vikram Hazra", genre: "Devotional", duration: 345000, thumbnail: "https://i.ytimg.com/vi/zN1jW7k156M/hqdefault.jpg", moods: ["Banaras Ghat Vibes","Chill","Focus"] },
  { id: "jfKfPfyJRdk", title: "Lofi Hip Hop Radio - Study Beats", artist: "Lofi Girl", genre: "Lo-fi", duration: 0, thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg", moods: ["Focus","Late Night Coding","Chill","Rainy Mood"] },
  { id: "T1e0a2A1PPM", title: "Chidiya - Lofi Edit", artist: "Vilen", genre: "Lo-fi", duration: 210000, thumbnail: "https://i.ytimg.com/vi/T1e0a2A1PPM/hqdefault.jpg", moods: ["Chill","Sad","Overthinking","Rainy Mood"] },
  { id: "cl0a3i2wFcc", title: "Brown Munde", artist: "AP Dhillon, Gurinder Gill", genre: "Hip-Hop", duration: 267000, thumbnail: "https://i.ytimg.com/vi/cl0a3i2wFcc/hqdefault.jpg", moods: ["Workout","Party","Travel"] },
  { id: "aY742L3NlXg", title: "Mi Amor", artist: "Sharn", genre: "Punjabi", duration: 198000, thumbnail: "https://i.ytimg.com/vi/aY742L3NlXg/hqdefault.jpg", moods: ["Party","Happy","Workout"] },
  { id: "dZ0fwJojGPA", title: "Baarishein", artist: "Anuv Jain", genre: "Indie", duration: 207000, thumbnail: "https://i.ytimg.com/vi/dZ0fwJojGPA/hqdefault.jpg", moods: ["Sad","Chill","Rainy Mood","Romantic","Lonely"] },
  { id: "PJWemSzDeZs", title: "Husn", artist: "Anuv Jain", genre: "Indie", duration: 218000, thumbnail: "https://i.ytimg.com/vi/PJWemSzDeZs/hqdefault.jpg", moods: ["Sad","Overthinking","Lonely","Romantic"] },
  { id: "S348A_oM2tU", title: "Indian Classical Sitar & Flute", artist: "Ravi Shankar (Tribute)", genre: "Classical", duration: 3600000, thumbnail: "https://i.ytimg.com/vi/S348A_oM2tU/hqdefault.jpg", moods: ["Focus","Banaras Ghat Vibes","Chill"] },
  { id: "Z7FvR3L8H_w", title: "Rinkiya Ke Papa", artist: "Manoj Tiwari", genre: "Bhojpuri", duration: 280000, thumbnail: "https://i.ytimg.com/vi/Z7FvR3L8H_w/hqdefault.jpg", moods: ["Party","Happy"] }
];

// Simple HTML parser fallback search using YouTube results page
export async function searchYouTubeCustom(query) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en-US' } });
    const html = await resp.text();
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
          const title = v.title?.runs?.[0]?.text || 'Unknown Title';
          const artist = v.ownerText?.runs?.[0]?.text || 'YouTube Streamer';
          const durationText = v.lengthText?.simpleText || '0:00';
          const parts = durationText.split(':').map(Number);
          let durationMs = 0;
          if (parts.length === 2) durationMs = (parts[0] * 60 + parts[1]) * 1000;
          else if (parts.length === 3) durationMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
          if (videoId) videos.push({ id: videoId, title, artist, duration: durationMs, thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, genre: 'Streaming' });
        }
      }
    }
    return videos.slice(0, 15);
  } catch (e) {
    console.error('Custom search parser error:', e);
    return [];
  }
}

export async function getSuggestionsCustom(query) {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&client=firefox&q=${encodeURIComponent(query)}`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await resp.json();
    return data[1] || [];
  } catch (e) {
    console.error('Custom suggestions error:', e);
    return [];
  }
}
