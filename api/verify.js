export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, hwid } = req.body;

  if (!key || !hwid) {
    return res.status(400).json({ error: 'Missing key or hwid' });
  }

  const firebaseUrl = process.env.FIREBASE_DB_URL;
  const licenseUrl = `${firebaseUrl}/licenses/${key}.json`;

  try {
    const response = await fetch(licenseUrl);
    const data = await response.json();

    if (!data) {
      return res.status(403).json({ success: false, message: 'Invalid license key' });
    }

    // Check if expired
    const currentTime = Date.now();
    const expireAfter = 5 * 60 * 60 * 1000; // 5 hours in ms

    if (data.timestamp && currentTime - data.timestamp > expireAfter) {
      // Delete expired key
      await fetch(licenseUrl, { method: 'DELETE' });
      return res.status(403).json({ success: false, message: 'License expired and deleted' });
    }

    // First-time use: bind HWID and timestamp
    if (!data.used) {
      await fetch(licenseUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hwid: hwid, used: true, timestamp: currentTime }),
      });
      return res.status(200).json({ success: true, message: 'License bound to HWID' });
    }

    if (data.hwid === hwid) {
      return res.status(200).json({ success: true, message: 'License verified' });
    } else {
      return res.status(403).json({ success: false, message: 'HWID mismatch' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
