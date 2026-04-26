import { connectDB, Arm, Event } from "@/lib/db";
import { resetArm } from "@/lib/rl/bandit";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Prune old events (older than 30 days)
    const deleteResult = await Event.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });

    console.log(`Pruned ${deleteResult.deletedCount} old events`);

    // Get current metrics
    const events = await Event.find({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const variantMetrics: Record<string, { conversions: number; trials: number }> = {};

    for (const event of events) {
      if (!variantMetrics[event.variant]) {
        variantMetrics[event.variant] = { conversions: 0, trials: 0 };
      }

      if (event.type === "conversion" || event.type === "click") {
        variantMetrics[event.variant].trials++;
        if (event.type === "conversion") {
          variantMetrics[event.variant].conversions += event.value;
        }
      }
    }

    // Reset underperforming variants (less than 2% conversion)
    const resetVariants: string[] = [];
    for (const variant in variantMetrics) {
      const { conversions, trials } = variantMetrics[variant];
      const conversionRate = trials > 0 ? conversions / trials : 0;

      if (trials > 100 && conversionRate < 0.02) {
        await resetArm(variant);
        resetVariants.push(variant);
      }
    }

    return Response.json({
      status: "optimized",
      prunedEvents: deleteResult.deletedCount,
      resetVariants,
      variantMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Optimize error:", error);
    return Response.json(
      { error: "Failed to optimize" },
      { status: 500 }
    );
  }
}
