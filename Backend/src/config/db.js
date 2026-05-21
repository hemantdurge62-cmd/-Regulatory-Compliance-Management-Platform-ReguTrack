import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000 // Fail fast (3s) if local server is down
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return false; // Not in-memory
  } catch (error) {
    console.warn(`⚠️ Local MongoDB connection failed: ${error.message}`);
    console.log('🔄 Starting in-memory MongoDB fallback...');
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
      return true; // Used in-memory
    } catch (memError) {
      console.error(`❌ In-Memory MongoDB Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
