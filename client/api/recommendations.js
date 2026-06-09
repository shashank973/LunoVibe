import { CURATED_TRACKS, searchYouTubeCustom } from './_lib.js';

export default async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const mood = url.searchParams.get('mood') || '';
  const genre = url.searchParams.get('genre') || '';
  let tracks = [...CURATED_TRACKS];

  if (mood) tracks = tracks.filter(t => t.moods && t.moods.includes(mood));
  if (genre) tracks = tracks.filter(t => t.genre.toLowerCase() === genre.toLowerCase());

  if (tracks.length < 5 && (mood || genre)) {
    const query = mood ? `${mood} vibe song` : `${genre} latest song`;
    try {
      const searchResults = await searchYouTubeCustom(query);
      tracks = [...tracks, ...searchResults];
    } catch (e) {
      console.warn('Backfill recommendations error:', e);
    }
  }

  const seen = new Set();
  const unique = tracks.filter(t => {
    if (seen.has(t.id)) return false; seen.add(t.id); return true;
  });
  res.status(200).json(unique);
};
