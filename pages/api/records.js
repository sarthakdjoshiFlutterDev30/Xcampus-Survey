import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('responses');

    const docs = await collection.find({}).sort({ createdAt: -1 }).toArray();

    const data = docs.map(d => ({
      id: d._id.toString(),
      fullname: d.fullname || null,
      department: d.department,
      semester: d.semester,
      attendance_time: d.attendance_time,
      food_interest: d.food_interest,
      top_feature: d.top_feature,
      suggestions: d.suggestions || null,
      createdAt: d.createdAt
    }));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
