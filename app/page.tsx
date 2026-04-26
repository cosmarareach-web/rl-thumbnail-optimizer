"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [variants, setVariants] = useState<string[]>([]);
  const [chosen, setChosen] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    try {
      setLoading(true);
      setError(null);

      // Generate variants
      const g = await fetch("/api/generate", { method: "POST" }).then(r => r.json());
      
      if (g.error) {
        throw new Error(g.error);
      }

      setVariants(g.variants);

      // Select best variant using bandit algorithm
      const s = await fetch("/api/select", {
        method: "POST",
        body: JSON.stringify({ variants: g.variants })
      }).then(r => r.json());

      if (s.error) {
        throw new Error(s.error);
      }

      setChosen(s.chosen);

      // Track impression
      await fetch("/api/track", {
        method: "POST",
        body: JSON.stringify({ 
          variant: s.chosen, 
          type: "impression",
          value: 0
        })
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function trackEvent(variant: string, type: string, value: number = 0) {
    try {
      await fetch("/api/track", {
        method: "POST",
        body: JSON.stringify({ variant, type, value })
      });
    } catch (err) {
      console.error("Failed to track event:", err);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>🎬 RL Thumbnail Optimizer</h1>
          <p>AI-powered A/B testing with Thompson Sampling</p>
        </div>
        <Link href="/dashboard" className={styles.dashboardLink}>
          📊 Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2>Generate Variants</h2>
          <p>
            Click below to generate thumbnail variants using different styles
            and let the reinforcement learning algorithm select the best one.
          </p>

          <button 
            onClick={run} 
            disabled={loading}
            className={styles.primaryBtn}
          >
            {loading ? "Generating..." : "🚀 Run RL Selection"}
          </button>

          {error && <div className={styles.error}>{error}</div>}

          {chosen && (
            <div className={styles.result}>
              <div className={styles.resultItem}>
                <span className={styles.label}>Selected Variant:</span>
                <span className={styles.value}>{chosen}</span>
              </div>

              <div className={styles.actions}>
                <button
                  onClick={() => trackEvent(chosen, "click", 0.05)}
                  className={styles.secondaryBtn}
                >
                  👆 Track Click
                </button>
                <button
                  onClick={() => trackEvent(chosen, "conversion", 1.0)}
                  className={styles.successBtn}
                >
                  ✅ Track Conversion
                </button>
              </div>

              <div className={styles.variantsList}>
                <h3>All Variants Generated:</h3>
                <ul>
                  {variants.map((v) => (
                    <li key={v}>
                      <code>{v}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>🤖 Thompson Sampling</h3>
            <p>
              Uses confidence bounds to balance exploration vs exploitation.
              Each variant's performance is modeled with mean and variance.
            </p>
          </div>

          <div className={styles.infoCard}>
            <h3>📊 Real-time Metrics</h3>
            <p>
              Track impressions, clicks, and conversions. The dashboard shows
              CTR, conversion rate, and RPC for each variant.
            </p>
          </div>

          <div className={styles.infoCard}>
            <h3>🔄 Auto-optimization</h3>
            <p>
              Cron job runs every 10 minutes to prune old events and reset
              underperforming variants.
            </p>
          </div>

          <div className={styles.infoCard}>
            <h3>📈 Adaptive Selection</h3>
            <p>
              As more data arrives, the algorithm learns which variants
              perform best and allocates more traffic to them.
            </p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>RL Thumbnail Optimizer • Powered by Thompson Sampling</p>
      </footer>
    </div>
  );
}
