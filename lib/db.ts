import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

const ArmSchema = new mongoose.Schema({
  armId: String,
  n: Number,
  mean: Number,
  variance: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Arm =
  mongoose.models.Arm || mongoose.model("Arm", ArmSchema);

const EventSchema = new mongoose.Schema({
  variant: String,
  type: String,
  value: Number,
  createdAt: { type: Date, default: Date.now }
});

export const Event =
  mongoose.models.Event || mongoose.model("Event", EventSchema);
