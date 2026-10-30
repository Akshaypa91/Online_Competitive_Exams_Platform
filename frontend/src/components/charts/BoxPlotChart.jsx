import React, { useState } from 'react';
import { Activity, Info } from 'lucide-react';

const BoxPlotChart = ({
  overviewData,
  title = "Five-Number Statistical Summary (Box & Whisker)",
  subtitle = "Score distributions: Min, Q1 (25th), Median (50th), Q3 (75th), and Max",
  height = 320
}) => {
  const [hoveredBox, setHoveredBox] = useState(null);

  const subjects = [
    { key: 'mathStats', label: 'Mathematics', color: '#4F46E5', secondary: '#EEF2FF' },
    { key: 'readingStats', label: 'Reading', color: '#059669', secondary: '#ECFDF5' },
    { key: 'writingStats', label: 'Writing', color: '#D97706', secondary: '#FFFBEB' },
    { key: 'avgStats', label: 'Overall Average', color: '#7C3AED', secondary: '#F5F3FF' },
  ];

  const defaultStats = {
    mathStats: { min: 0, q1: 57, median: 66, q3: 77, max: 100, mean: 66.1 },
    readingStats: { min: 17, q1: 59, median: 70, q3: 79, max: 100, mean: 69.2 },
    writingStats: { min: 10, q1: 58, median: 69, q3: 79, max: 100, mean: 68.1 },
    avgStats: { min: 9, q1: 58.3, median: 68.3, q3: 78.7, max: 100, mean: 67.8 },
  };

  const stats = overviewData || defaultStats;

  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 45;
  const chartWidth = 600;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const getY = (val) => paddingTop + plotHeight * (1 - Math.min(100, Math.max(0, val)) / 100);

  const colWidth = plotWidth / subjects.length;

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="var(--primary-color)" />
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Info size={14} />
          <span>Middle 50% of candidates fall inside the shaded box (IQR)</span>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${chartWidth} ${height}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
          {/* Horizontal grid lines */}
          {[0, 20, 40, 60, 80, 100].map(val => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#94A3B8"
                  fontFamily="var(--font-mono)"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Subjects Box Plots */}
          {subjects.map((sub, idx) => {
            const data = stats[sub.key] || defaultStats[sub.key];
            const centerX = paddingLeft + idx * colWidth + colWidth / 2;
            const boxW = Math.min(colWidth * 0.45, 50);

            const yMin = getY(data.min);
            const yMax = getY(data.max);
            const yQ1 = getY(data.q1);
            const yQ3 = getY(data.q3);
            const yMedian = getY(data.median);
            const yMean = getY(data.mean);

            const isHovered = hoveredBox?.label === sub.label;

            return (
              <g
                key={sub.key}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredBox({
                  ...data,
                  label: sub.label,
                  color: sub.color,
                  iqr: Math.round((data.q3 - data.q1) * 10) / 10,
                  x: centerX,
                  y: yMedian
                })}
                onMouseLeave={() => setHoveredBox(null)}
              >
                {/* Vertical Whisker line (min to max) */}
                <line
                  x1={centerX}
                  y1={yMin}
                  x2={centerX}
                  y2={yMax}
                  stroke={sub.color}
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />

                {/* Min Whisker Cap */}
                <line
                  x1={centerX - boxW * 0.3}
                  y1={yMin}
                  x2={centerX + boxW * 0.3}
                  y2={yMin}
                  stroke={sub.color}
                  strokeWidth="2"
                />
                {/* Max Whisker Cap */}
                <line
                  x1={centerX - boxW * 0.3}
                  y1={yMax}
                  x2={centerX + boxW * 0.3}
                  y2={yMax}
                  stroke={sub.color}
                  strokeWidth="2"
                />

                {/* IQR Box (Q1 to Q3) */}
                <rect
                  x={centerX - boxW / 2}
                  y={yQ3}
                  width={boxW}
                  height={Math.max(2, yQ1 - yQ3)}
                  rx="4"
                  fill={isHovered ? sub.color : sub.secondary}
                  stroke={sub.color}
                  strokeWidth="2"
                  opacity={isHovered ? 0.9 : 0.85}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* Median Bar */}
                <line
                  x1={centerX - boxW / 2}
                  y1={yMedian}
                  x2={centerX + boxW / 2}
                  y2={yMedian}
                  stroke={isHovered ? '#FFFFFF' : '#0F172A'}
                  strokeWidth="2.5"
                />

                {/* Mean Diamond indicator */}
                <polygon
                  points={`${centerX},${yMean - 4} ${centerX + 4},${yMean} ${centerX},${yMean + 4} ${centerX - 4},${yMean}`}
                  fill="#EF4444"
                />

                {/* X Axis Label */}
                <text
                  x={centerX}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="var(--text-primary)"
                >
                  {sub.label}
                </text>
                <text
                  x={centerX}
                  y={height - paddingBottom + 32}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--text-secondary)"
                >
                  Med: {data.median} | μ: {data.mean}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Card */}
        {hoveredBox && (
          <div
            style={{
              position: 'absolute',
              top: `${Math.max(5, (hoveredBox.y / height) * 100 - 20)}%`,
              left: `${(hoveredBox.x / chartWidth) * 100}%`,
              transform: 'translate(-50%, -100%)',
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '0.65rem 0.9rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              boxShadow: 'var(--shadow-lg)',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: 160
            }}
          >
            <div style={{ fontWeight: 700, color: hoveredBox.color, marginBottom: '0.35rem', fontSize: '0.8125rem' }}>
              {hoveredBox.label} Statistics
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 0.75rem', color: '#E2E8F0' }}>
              <div>Max: <strong>{hoveredBox.max}</strong></div>
              <div>Min: <strong>{hoveredBox.min}</strong></div>
              <div>Q3 (75%): <strong>{hoveredBox.q3}</strong></div>
              <div>Q1 (25%): <strong>{hoveredBox.q1}</strong></div>
              <div>Median: <strong>{hoveredBox.median}</strong></div>
              <div>Mean (μ): <strong>{hoveredBox.mean}</strong></div>
              <div style={{ gridColumn: 'span 2', color: '#94A3B8', borderTop: '1px solid #334155', paddingTop: '0.25rem', marginTop: '0.2rem' }}>
                IQR (Spread): <strong>{hoveredBox.iqr} pts</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoxPlotChart;
