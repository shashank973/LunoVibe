const { getSuggestionsCustom } = require('./_lib');

module.exports = async (req, res) => {
  const q = req.query.q || req.url.split('?q=')[1] || '';
  const query = Array.isArray(q) ? q[0] : q;
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
