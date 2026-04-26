import { connectDB, Event } from "@/lib/db";
import { updateArm } from "@/lib/rl/bandit";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { variant, type, value } = await req.json();

    if (!variant || !type) {
      return Response.json(
        { error: "Missing variant or type" },
        { status: 400 }
      );
    }

    // Record event
    await Event.create({ 
      variant, 
      type, 
      value: value || 0,
      createdAt: new Date()
    });

    // Update arm if conversion or click
    if (type === "conversion" || type === "click") {
      const reward = value || (type === "click" ? 0.05 : 1.0);
      await updateArm(variant, reward);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Track error:", error);
    return Response.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
