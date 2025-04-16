// /api/verify.js
export default async function handler(req, res) {
    const { license, hwid } = req.query;
  
    // Example Firebase fetch:
    const firebase = await fetch('https://yourproject.firebaseio.com/licenses.json');
    const data = await firebase.json();
  
    if (!data[license]) {
      return res.status(403).json({ status: 'invalid_license' });
    }
  
    if (!data[license].used) {
      // Bind HWID
      await fetch(`https://yourproject.firebaseio.com/licenses/${license}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ hwid: hwid, used: true }),
      });
      return res.status(200).json({ status: 'license_bound' });
    }
  
    if (data[license].hwid === hwid) {
      return res.status(200).json({ status: 'valid' });
    } else {
      return res.status(403).json({ status: 'hwid_mismatch' });
    }
  }
  