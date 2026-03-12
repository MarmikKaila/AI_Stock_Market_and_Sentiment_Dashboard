import React from 'react';

const SentimentGauge = ({ score = 0, size = 200 }) => {
  // Clamp score to -1..+1
  const clampedScore = Math.max(-1, Math.min(1, score));
  // Map -1..+1 to 180..0 degrees (left to right arc)
  const angle = 180 - ((clampedScore + 1) / 2) * 180;
  const needleAngle = angle - 90; // offset for CSS rotation

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const strokeWidth = size * 0.08;

  // Helper: arc path from angle1 to angle2 (in degrees, 0=right, counterclockwise)
  const describeArc = (startAngle, endAngle) => {
    const s = (startAngle * Math.PI) / 180;
    const e = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(Math.PI - s);
    const y1 = cy - r * Math.sin(Math.PI - s);
    const x2 = cx + r * Math.cos(Math.PI - e);
    const y2 = cy - r * Math.sin(Math.PI - e);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Needle tip position
  const needleLen = r - strokeWidth / 2;
  const needleRad = (angle * Math.PI) / 180;
  const needleX = cx + needleLen * Math.cos(Math.PI - needleRad);
  const needleY = cy - needleLen * Math.sin(Math.PI - needleRad);

  // Label
  let label, labelColor;
  if (clampedScore > 0.2) { label = 'Bullish'; labelColor = '#10B981'; }
  else if (clampedScore < -0.2) { label = 'Bearish'; labelColor = '#EF4444'; }
  else { label = 'Neutral'; labelColor = '#FBBF24'; }

  return (
    <div className="bg-gray-900 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-400/20 flex flex-col items-center">
      <h3 className="text-gray-300 text-sm font-semibold mb-2 self-start">Sentiment Gauge</h3>
      <svg width={size} height={size * 0.6} viewBox={`0 ${cy - r - strokeWidth} ${size} ${r + strokeWidth * 2 + 30}`}>
        {/* Red zone: -1 to -0.33 (0° to 60°) */}
        <path d={describeArc(0, 60)} fill="none" stroke="#EF4444" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.3} />
        {/* Yellow zone: -0.33 to +0.33 (60° to 120°) */}
        <path d={describeArc(60, 120)} fill="none" stroke="#FBBF24" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.3} />
        {/* Green zone: +0.33 to +1 (120° to 180°) */}
        <path d={describeArc(120, 180)} fill="none" stroke="#10B981" strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.3} />

        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={needleX} y2={needleY}
          stroke="#E5E7EB" strokeWidth={2.5} strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill="#E5E7EB" />

        {/* Labels */}
        <text x={cx - r - 5} y={cy + 16} fill="#EF4444" fontSize={10} textAnchor="middle">Sell</text>
        <text x={cx} y={cy - r - strokeWidth + 5} fill="#FBBF24" fontSize={10} textAnchor="middle">Hold</text>
        <text x={cx + r + 5} y={cy + 16} fill="#10B981" fontSize={10} textAnchor="middle">Buy</text>
      </svg>

      <div className="text-center -mt-2">
        <p className="text-3xl font-bold" style={{ color: labelColor }}>
          {clampedScore.toFixed(2)}
        </p>
        <p className="text-sm font-semibold" style={{ color: labelColor }}>
          {label}
        </p>
      </div>
    </div>
  );
};

export default SentimentGauge;
