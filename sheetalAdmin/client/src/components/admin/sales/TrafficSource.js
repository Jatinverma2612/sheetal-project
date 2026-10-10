"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#cbd5e1"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 12,
          padding: "8px 12px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <p
          style={{
            color: "#94a3b8",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            marginBottom: 2,
          }}
        >
          {payload[0].name}
        </p>
        <p
          style={{
            color: "#ffffff",
            fontSize: 15,
            fontWeight: 800,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

export default function TrafficSources({ sources = [] }) {
  const chartData = sources.map((s, i) => ({
    name: s.label,
    value: s.percentage,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-1"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=DM+Mono:wght@500&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#818cf8,#4f46e5)",
            boxShadow: "0 0 8px rgba(99,102,241,0.6)",
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#6366f1",
            textTransform: "uppercase",
          }}
        >
          Analytics
        </span>
      </div>
      <h3 className="text-xl font-extrabold text-slate-900 leading-tight mb-6">
        Traffic Sources
      </h3>

      {/* Donut */}
      <div className="flex justify-center py-2">
        <div className="relative w-44 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#0f172a",
                fontFamily: "'DM Mono', monospace",
                lineHeight: 1,
                marginBottom: 2,
              }}
            >
              100%
            </p>
            <p
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#94a3b8",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Total Visits
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2.5 mt-5">
        {sources.map((source, i) => (
          <div key={source.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: COLORS[i % COLORS.length],
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${COLORS[i % COLORS.length]}66`,
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                {source.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Mini bar */}
              <div
                style={{
                  width: 48,
                  height: 3,
                  borderRadius: 99,
                  background: "#f1f5f9",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${source.percentage}%`,
                    height: "100%",
                    borderRadius: 99,
                    background: COLORS[i % COLORS.length],
                    opacity: 0.8,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#0f172a",
                  fontFamily: "'DM Mono', monospace",
                  width: 32,
                  textAlign: "right",
                }}
              >
                {source.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
