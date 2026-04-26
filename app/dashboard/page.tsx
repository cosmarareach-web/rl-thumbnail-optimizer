"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";

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

interface ApiResponse {
  metrics: MetricsData;
  arms: ArmData;
  timestamp: string;
}

export default function Dashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/metrics");
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    let interval: NodeJS.Timeout | undefined;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleRefresh = () => {
    setLoading(true);
    fetch("/api/metrics")
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading && !data) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading metrics...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 Thumbnail Optimization Dashboard</h1>
        <div className={styles.controls}>
          <button onClick={handleRefresh} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
        </div>
      </div>

      {data && (
        <>
          <div className={styles.timestamp}>
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </div>

          <div className={styles.grid}>
            <section className={styles.section}>
              <h2>Performance Metrics</h2>
              <div className={styles.metricsTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Variant</th>
                      <th>Impressions</th>
                      <th>Clicks</th>
                      <th>CTR (%)</th>
                      <th>Revenue</th>
                      <th>CVR (%)</th>
                      <th>RPC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.metrics).map(([variant, metrics]) => (
                      <tr key={variant}>
                        <td className={styles.variantName}>{variant}</td>
                        <td>{metrics.imp}</td>
                        <td>{metrics.clk}</td>
                        <td>{(metrics.ctr || 0).toFixed(2)}</td>
                        <td>${(metrics.rev || 0).toFixed(2)}</td>
                        <td>{(metrics.cvr || 0).toFixed(2)}</td>
                        <td>${(metrics.rpc || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={styles.section}>
              <h2>Bandit Arm State</h2>
              <div className={styles.armsTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Arm</th>
                      <th>Samples (n)</th>
                      <th>Mean Reward</th>
                      <th>Std Dev</th>
                      <th>Confidence Bound</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.arms).map(([arm, stats]) => {
                      const bound = stats.mean + stats.std;
                      return (
                        <tr key={arm}>
                          <td className={styles.armName}>{arm}</td>
                          <td>{stats.n}</td>
                          <td>{stats.mean.toFixed(4)}</td>
                          <td>{stats.std.toFixed(4)}</td>
                          <td className={styles.confidenceBound}>
                            {bound.toFixed(4)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className={styles.section}>
            <h2>Summary Statistics</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {Object.values(data.metrics).reduce((s, m) => s + m.imp, 0)}
                </div>
                <div className={styles.statLabel}>Total Impressions</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {Object.values(data.metrics).reduce((s, m) => s + m.clk, 0)}
                </div>
                <div className={styles.statLabel}>Total Clicks</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  ${Object.values(data.metrics).reduce((s, m) => s + m.rev, 0).toFixed(2)}
                </div>
                <div className={styles.statLabel}>Total Revenue</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {Object.keys(data.arms).length}
                </div>
                <div className={styles.statLabel}>Active Variants</div>
              </div>
            </div>
          </section>
        </>
      )}

      {error && (
        <div className={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
