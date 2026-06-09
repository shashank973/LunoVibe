const { CURATED_TRACKS, searchYouTubeCustom } = require('./_lib');

module.exports = async (req, res) => {
  const q = req.query.q || req.url.split('?q=')[1] || '';
  const query = Array.isArray(q) ? q[0] : q;
  if (!query) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  try {
    const searchQuery = `${query} song`;
    const tracks = await searchYouTubeCustom(searchQuery);
    if (tracks && tracks.length > 0) {
      res.status(200).json(tracks);
    } else {
      const queryLower = query.toLowerCase();
      const filtered = CURATED_TRACKS.filter(t => t.title.toLowerCase().includes(queryLower) || t.artist.toLowerCase().includes(queryLower));
      res.status(200).json(filtered.length > 0 ? filtered : CURATED_TRACKS.slice(0, 8));
    }
  } catch (e) {
    console.error('Search API Error:', e);
    res.status(200).json(CURATED_TRACKS.slice(0, 8));
  }
};
