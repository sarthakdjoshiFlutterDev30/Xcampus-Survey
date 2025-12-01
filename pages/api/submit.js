import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fullname, department, semester, attendance_time, food_interest, top_feature, suggestions } = req.body;

  // All fields required except `suggestions`
  if (!fullname || !department || !semester || !attendance_time || !food_interest || !top_feature) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('responses');
    // determine client IP (works behind proxies if X-Forwarded-For is set)
    const ip = (req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();

    if (!ip) {
      // If we somehow can't determine IP, still allow but log
      console.warn('Could not determine client IP for submission');
    } else {
      // block if this IP has already submitted
      const existing = await collection.findOne({ ip });
      if (existing) {
        return res.status(403).json({ error: 'A submission from this IP address already exists' });
      }
    }

    const doc = {
      fullname: fullname || null,
      department,
      semester,
      attendance_time,
      food_interest,
      top_feature,
      suggestions: suggestions || null,
      createdAt: new Date(),
      ip: ip || null
    };

    const result = await collection.insertOne(doc);

    return res.status(201).json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
