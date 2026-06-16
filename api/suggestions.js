import { getSuggestionsCustom } from './_lib.js';

export default async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const query = url.searchParams.get('q') || '';
  if (!query) {
    res.status(200).json([]);
    return;
  }
  try {
    const suggestions = await getSuggestionsCustom(query);
    res.status(200).json(suggestions);
  } catch (e) {
    console.error('Suggestions API Error:', e);
    const fallback = ["kesariya","brown munde","apna bana le","anuv jain husn","sitar classical bhajan","banaras sandhya aarti","lofi coding beats"].filter(s => s.startsWith(query.toLowerCase()));
    res.status(200).json(fallback);
  }
};
