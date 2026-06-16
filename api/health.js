export default async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ status: 'healthy', service: 'LunoVibe Core API (serverless)' });
};
