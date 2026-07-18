import type { RateHistoryPoint } from "../types";

interface Props {
  points: RateHistoryPoint[];
  fromCode: string;
  toCode: string;
  width?: number;
  height?: number;
}

export function RateSparkline({ points, fromCode, toCode, width = 280, height = 40 }: Props) {
  if (points.length < 2) return null;

  const rates = points.map((p) => p.rate);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const range = max - min || 1;

  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p.rate - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const trendUp = rates[rates.length - 1] >= rates[0];

  return (
    <div className="sparkline">
      <span className="sparkline-title">{points.length}-day {fromCode}/{toCode} trend</span>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Rate trend over the last ${points.length} days, ${trendUp ? "up" : "down"}`}
      >
        <polyline
          points={coords}
          fill="none"
          stroke={trendUp ? "var(--accent)" : "var(--danger)"}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <span className="sparkline-label">
        {points[0].date} → {points[points.length - 1].date}
      </span>
    </div>
  );
}