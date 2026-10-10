"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getChartData } from "@/services/salesService";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: "12px",
        padding: "10px 14px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      }}>
        <p style={{ color: "#94a3b8", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>{label}</p>
        <p style={{ color: "#fff", fontSize: "16px", fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBar = (props) => {
  const { x, y, width, height, isActive } = props;
  const radius = 6;
  return (
    <g>
      <defs>
        <linearGradient id={`bar-grad-${isActive ? "active" : "idle"}`} x1="0" y1="0" x2="0" y2="1">
          {isActive ? (
            <>
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#c7d2fe" />
              <stop offset="100%" stopColor="#a5b4fc" />
            </>
          )}
        </linearGradient>
      </defs>
      <rect
        x={x} y={y} width={width} height={height}
        rx={radius} ry={radius}
        fill={`url(#bar-grad-${isActive ? "active" : "idle"})`}
        opacity={isActive ? 1 : 0.45}
      />
    </g>
  );
};

function SkeletonBars() {
  return (
    <div style={{ height: 240, display: "flex", alignItems: "flex-end", gap: 8, padding: "0 16px" }}>
      {[60, 85, 50, 95, 70, 80, 45].map((h, i) => (
        <div key={i} style={{
          flex: 1, height: `${h}%`, borderRadius: "6px 6px 0 0",
          background: "#f1f5f9", animation: "pulse 1.5s ease-in-out infinite",
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
    </div>
  );
}

export default function SalesTrendsChart({ period, onPeriodChange }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [chartData, setChartData]     = useState([]);
  const [totals, setTotals]           = useState({ revenue: 0 });
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getChartData({ period });
      if (res.success) {
        // Map API response to { label, revenue } shape the chart expects
        setChartData((res.data || []).map((d) => ({ label: d.name, revenue: d.revenue })));
        setTotals(res.totals || { revenue: 0 });
      } else {
        setError("Failed to load data");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total = totals.revenue;
  const peak  = chartData.length ? Math.max(...chartData.map((d) => d.revenue)) : 0;
  const avg   = chartData.length ? total / chartData.length : 0;

  return (
    <div style={{
      background: "#fff",
      borderRadius: "20px",
      border: "1px solid #e2e8f0",
      padding: "28px 28px 20px",
      boxShadow: "0 4px 24px rgba(99,102,241,0.06)",
      fontFamily: "'DM Sans', sans-serif",
      marginBottom: 30,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=DM+Mono:wght@500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg,#818cf8,#4f46e5)", boxShadow: "0 0 8px rgba(99,102,241,0.6)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#6366f1", textTransform: "uppercase" }}>Revenue Analytics</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>Sales Trends</h3>
        </div>

        {/* Period toggle */}
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 3 }}>
          {["weekly", "monthly", "yearly"].map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              style={{
                padding: "6px 16px", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.05em", textTransform: "capitalize",
                borderRadius: 8, border: "none", cursor: "pointer",
                transition: "all 0.2s ease",
                background: period === p ? "#fff" : "transparent",
                color: period === p ? "#4f46e5" : "#94a3b8",
                boxShadow: period === p ? "0 1px 6px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        {[
          { label: period === "weekly" ? "Week Total" : period === "monthly" ? "Year Total" : "All Time", value: `₹${(total / 1000).toFixed(0)}k` },
          { label: "Peak",      value: `₹${(peak / 1000).toFixed(0)}k` },
          { label: "Avg",       value: `₹${(avg / 1000).toFixed(1)}k`  },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 2px" }}>{label}</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: loading ? "#e2e8f0" : "#0f172a", margin: 0, fontFamily: "'DM Mono', monospace" }}>
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {error ? (
        <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontSize: 13 }}>
          ⚠ {error} —{" "}
          <button onClick={fetchData} style={{ color: "#6366f1", textDecoration: "underline", border: "none", background: "none", cursor: "pointer", marginLeft: 4 }}>
            Retry
          </button>
        </div>
      ) : loading ? (
        <SkeletonBars />
      ) : chartData.length === 0 ? (
        <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>
          No data for this period
        </div>
      ) : (
        <div style={{ height: 240, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 0, left: -16, bottom: 0 }}
              barCategoryGap="15%"
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fontWeight: 700, fill: "#cbd5e1", letterSpacing: 2, fontFamily: "'DM Mono', monospace" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#cbd5e1", fontFamily: "'DM Mono', monospace" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.04)", radius: 8 }} />
              <Bar
                dataKey="revenue"
                radius={[6, 6, 0, 0]}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                shape={(props) => (
                  <CustomBar {...props} isActive={activeIndex === null || props.index === activeIndex} />
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}