"use client";

interface SparklineProps {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}

export function Sparkline({ data, positive, width = 100, height = 32 }: SparklineProps) {
  if (!data || data.length === 0) return null;

  // Normalize data to fit the SVG
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  
  // Create gradient fill
  const fillPath = `${pathD} L ${width},${height} L 0,${height} Z`;

  const color = positive ? "oklch(0.72 0.22 145)" : "oklch(0.6 0.24 25)";

  return (
    <svg width={width} height={height} className="inline-block">
      <defs>
        <linearGradient id={`gradient-${positive ? "up" : "down"}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={fillPath}
        fill={`url(#gradient-${positive ? "up" : "down"})`}
      />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
