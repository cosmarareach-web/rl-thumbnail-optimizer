import { Arm } from "../db";

export async function selectArm(ids: string[]) {
  let best = ids[0];
  let bestScore = -Infinity;

  for (const id of ids) {
    const arm = await Arm.findOne({ armId: id }) || {
      n: 1, 
      mean: 0.05, 
      variance: 0.02
    };

    const std = Math.sqrt(arm.variance / arm.n);
    const sample = arm.mean + std * Math.random();

    if (sample > bestScore) {
      bestScore = sample;
      best = id;
    }
  }
  return best;
}

export async function updateArm(id: string, reward: number) {
  let arm = await Arm.findOne({ armId: id });

  if (!arm) {
    arm = await Arm.create({
      armId: id,
      n: 1,
      mean: reward,
      variance: 0.05
    });
    return;
  }

  const n = arm.n;
  const n1 = n + 1;
  const oldMean = arm.mean;
  const newMean = oldMean + (reward - oldMean) / n1;
  
  // Welford's online algorithm for variance
  const oldVariance = arm.variance;
  const newVariance = 
    (oldVariance * n + (reward - oldMean) * (reward - newMean)) / n1;

  arm.n = n1;
  arm.mean = newMean;
  arm.variance = Math.max(newVariance, 0.001); // Prevent variance collapse
  arm.updatedAt = new Date();
  
  await arm.save();
}

export async function resetArm(id: string) {
  await Arm.updateOne(
    { armId: id },
    {
      n: 1,
      mean: 0.05,
      variance: 0.02,
      updatedAt: new Date()
    }
  );
}
