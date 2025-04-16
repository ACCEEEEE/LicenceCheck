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
  const licensesListUrl = `${firebaseUrl}/licenses.json`;

  try {
    // Check if this HWID already used a different key
    const allLicenses = await fetch(licensesListUrl);
    const allData = await allLicenses.json();

    for (const existingKey in allData) {
      const entry = allData[existingKey];
      if (entry.used && entry.hwid === hwid && existingKey !== key) {
        return res.status(403).json({ success: false, message: 'This HWID is already linked to another license' });
      }
    }

    // Fetch current license data
    const response = await fetch(licenseUrl);
    const data = await response.json();

    if (!data) {
      return res.status(403).json({ success: false, message: 'Invalid license key' });
    }

    const currentTime = Date.now();
    const expireAfter = 5 * 60 * 60 * 1000; // 5 hours

    // If key has a timestamp and is expired
    if (data.timestamp && currentTime - data.timestamp > expireAfter) {
      await fetch(licenseUrl, { method: 'DELETE' });
      return res.status(403).json({ success: false, message: 'Your key has expired. Get a new one.' });
    }

    // First-time activation
    if (!data.used) {
      await fetch(licenseUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hwid, used: true, timestamp: currentTime }),
      });
      return res.status(200).json({ success: true, message: 'License bound to HWID' });
    }

    // Existing activation
    if (data.hwid === hwid) {
      return res.status(200).json({ success: true, message: 'License verified' });
    } else {
      return res.status(403).json({ success: false, message: 'HWID mismatch' });
    }

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
