const { CURATED_TRACKS } = require('./_lib');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(CURATED_TRACKS);
};
