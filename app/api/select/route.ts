import { connectDB } from "@/lib/db";
import { selectArm } from "@/lib/rl/bandit";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { variants } = await req.json();
    
    if (!variants || variants.length === 0) {
      return Response.json(
        { error: "No variants provided" },
        { status: 400 }
      );
    }

    const chosen = await selectArm(variants);
    
    return Response.json({ chosen });
  } catch (error) {
    console.error("Select error:", error);
    return Response.json(
      { error: "Failed to select variant" },
      { status: 500 }
    );
  }
}
