import { CURATED_TRACKS } from './_lib.js';

export default async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(CURATED_TRACKS);
};
