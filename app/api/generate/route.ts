import { connectDB, Arm } from "@/lib/db";
import { THUMBNAIL_STYLES } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { baseImageUrl, title } = await req.json();

    // Generate one variant per style
    const variants: string[] = [];
    
    for (const style of THUMBNAIL_STYLES) {
      const variantId = `thumb-${style}-${Date.now()}`;
      variants.push(variantId);

      // Initialize arm in database if it doesn't exist
      const existing = await Arm.findOne({ armId: variantId });
      if (!existing) {
        await Arm.create({
          armId: variantId,
          n: 0,
          mean: 0.05,
          variance: 0.02
        });
      }
    }

    return Response.json({ 
      variants,
      metadata: {
        baseImageUrl,
        title,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Generate error:", error);
    return Response.json(
      { error: "Failed to generate variants" },
      { status: 500 }
    );
  }
}
