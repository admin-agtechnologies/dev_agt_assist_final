// src/app/pme/dashboard/_components/WeekChart.tsx
"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

interface WeekDay {
  day: string;
  messages: number;
  calls: number;
}

interface Props {
  data: WeekDay[];
  title: string;
}

export function WeekChart({ data, title }: Props) {
  return (
    <div className="card p-6">
      <h2 className="text-sm font-bold text-[var(--text)] mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gMsg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#25D366" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#25D366" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gCall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6C3CE1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6C3CE1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="messages"
            stroke="#25D366"
            strokeWidth={2}
            fill="url(#gMsg)"
            name="Messages"
          />
          <Area
            type="monotone"
            dataKey="calls"
            stroke="#6C3CE1"
            strokeWidth={2}
            fill="url(#gCall)"
            name="Appels"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}