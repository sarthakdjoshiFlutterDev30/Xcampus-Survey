import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cachedClient = global._mongoClient;
let cachedDb = global._mongoDB;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    // useUnifiedTopology is default in new driver
  });

  await client.connect();
  const dbName = new URL(uri).pathname.replace('/', '');
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;
  global._mongoClient = cachedClient;
  global._mongoDB = cachedDb;

  return { client, db };
}
