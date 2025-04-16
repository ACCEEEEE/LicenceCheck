// /api/verify.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, hwid } = req.body;

  if (!key || !hwid) {
    return res.status(400).json({ error: 'Missing key or hwid' });
  }

  // Example (fake) logic
  if (key === 'abc123' && hwid === 'HWID-EXAMPLE') {
    return res.status(200).json({ success: true, message: 'License verified' });
  }

  return res.status(403).json({ success: false, message: 'Invalid key or HWID' });
}
