import { connectDB, Event, Arm } from "@/lib/db";

interface MetricsData {
  [key: string]: {
    imp: number;
    clk: number;
    rev: number;
    ctr?: number;
    cvr?: number;
    rpc?: number;
  };
}

interface ArmData {
  [key: string]: {
    n: number;
    mean: number;
    variance: number;
    std: number;
  };
}

export async function GET() {
  try {
    await connectDB();

    // Get event metrics
    const events = await Event.find();

    const map: MetricsData = {};

    for (const e of events) {
      if (!map[e.variant]) {
        map[e.variant] = { imp: 0, clk: 0, rev: 0 };
      }

      if (e.type === "impression") map[e.variant].imp++;
      if (e.type === "click") map[e.variant].clk++;
      if (e.type === "conversion") map[e.variant].rev += e.value;
    }

    // Calculate derived metrics
    for (const variant in map) {
      const m = map[variant];
      m.ctr = m.imp > 0 ? (m.clk / m.imp) * 100 : 0;
      m.cvr = m.clk > 0 ? (m.rev / m.clk) * 100 : 0;
      m.rpc = m.clk > 0 ? m.rev / m.clk : 0;
    }

    // Get bandit arm data
    const arms = await Arm.find();
    const armMap: ArmData = {};

    for (const arm of arms) {
      armMap[arm.armId] = {
        n: arm.n,
        mean: arm.mean,
        variance: arm.variance,
        std: Math.sqrt(arm.variance / Math.max(arm.n, 1))
      };
    }

    return Response.json({
      metrics: map,
      arms: armMap,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Metrics error:", error);
    return Response.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
