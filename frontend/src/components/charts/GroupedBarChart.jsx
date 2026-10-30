import React, { useState } from 'react';
import { BarChart2, Layers } from 'lucide-react';

const GroupedBarChart = ({
  data = [],
  title = "Group Performance Comparison",
  subtitle = "Comparative subject scores across categories",
  height = 340,
  showPassRate = true
}) => {
  const [activeMetric, setActiveMetric] = useState('all'); // 'all', 'math', 'reading', 'writing'
  const [hoveredItem, setHoveredItem] = useState(null);

  const metrics = [
    { key: 'mathAvg', label: 'Math', color: '#4F46E5' },
    { key: 'readingAvg', label: 'Reading', color: '#059669' },
    { key: 'writingAvg', label: 'Writing', color: '#D97706' },
  ];

  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 60;
  const chartWidth = 650;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const groupCount = data?.length || 1;
  const groupWidth = plotWidth / groupCount;

  // Max score is typically 100
  const maxVal = 100;

  const displayedMetrics = activeMetric === 'all' 
    ? metrics 
    : metrics.filter(m => m.key.toLowerCase().startsWith(activeMetric));

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={20} color="var(--primary-color)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {title}
            </h3>
          </div>
          {subtitle && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Metric Selector */}
        <div style={{ display: 'inline-flex', padding: '0.25rem', background: 'var(--surface-muted)', borderRadius: '0.5rem' }}>
          <button
            onClick={() => setActiveMetric('all')}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeMetric === 'all' ? '#FFFFFF' : 'transparent',
              color: activeMetric === 'all' ? 'var(--primary-color)' : 'var(--text-secondary)',
              boxShadow: activeMetric === 'all' ? 'var(--shadow-xs)' : 'none',
            }}
          >
            All Subjects
          </button>
          <button
            onClick={() => setActiveMetric('math')}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeMetric === 'math' ? '#FFFFFF' : 'transparent',
              color: activeMetric === 'math' ? '#4F46E5' : 'var(--text-secondary)',
              boxShadow: activeMetric === 'math' ? 'var(--shadow-xs)' : 'none',
            }}
          >
            Math
          </button>
          <button
            onClick={() => setActiveMetric('reading')}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeMetric === 'reading' ? '#FFFFFF' : 'transparent',
              color: activeMetric === 'reading' ? '#059669' : 'var(--text-secondary)',
              boxShadow: activeMetric === 'reading' ? 'var(--shadow-xs)' : 'none',
            }}
          >
            Reading
          </button>
          <button
            onClick={() => setActiveMetric('writing')}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeMetric === 'writing' ? '#FFFFFF' : 'transparent',
              color: activeMetric === 'writing' ? '#D97706' : 'var(--text-secondary)',
              boxShadow: activeMetric === 'writing' ? 'var(--shadow-xs)' : 'none',
            }}
          >
            Writing
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
        {displayedMetrics.map(m => (
          <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: m.color }} />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{m.label} Average</span>
          </div>
        ))}
        {showPassRate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563EB' }} />
            <span style={{ color: '#2563EB', fontWeight: 600 }}>Pass Rate (%)</span>
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div style={{ position: 'relative', width: '100%' }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          {/* Horizontal Grid lines */}
          {[0, 20, 40, 60, 80, 100].map(val => {
            const y = paddingTop + plotHeight * (1 - val / maxVal);
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
                  x={paddingLeft - 8}
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

          {/* Grouped Bars */}
          {data?.map((group, gIdx) => {
            const groupX = paddingLeft + gIdx * groupWidth;
            const barWidth = Math.min((groupWidth * 0.75) / displayedMetrics.length, 26);
            const groupBarBlockWidth = barWidth * displayedMetrics.length;
            const startX = groupX + (groupWidth - groupBarBlockWidth) / 2;

            return (
              <g key={group.name || gIdx}>
                {/* Metric Bars */}
                {displayedMetrics.map((m, mIdx) => {
                  const val = group[m.key] || 0;
                  const barH = (val / maxVal) * plotHeight;
                  const barX = startX + mIdx * barWidth;
                  const barY = paddingTop + plotHeight - barH;
                  const isHovered = hoveredItem?.groupName === group.name && hoveredItem?.metricKey === m.key;

                  return (
                    <g key={m.key}>
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth - 2}
                        height={barH}
                        rx="3"
                        fill={m.color}
                        opacity={hoveredItem ? (isHovered ? 1 : 0.6) : 0.9}
                        style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onMouseEnter={() => setHoveredItem({
                          groupName: group.name,
                          metricLabel: m.label,
                          metricKey: m.key,
                          value: val,
                          count: group.count,
                          passRate: group.passRate,
                          x: barX + barWidth / 2,
                          y: barY
                        })}
                        onMouseLeave={() => setHoveredItem(null)}
                      />

                      {/* Score Value on Bar */}
                      <text
                        x={barX + (barWidth - 2) / 2}
                        y={barY - 4}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="600"
                        fill="#475569"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Optional Pass Rate Badge / Dot */}
                {showPassRate && group.passRate !== undefined && (
                  <g>
                    <circle
                      cx={startX + groupBarBlockWidth / 2}
                      cy={paddingTop + plotHeight * (1 - group.passRate / 100)}
                      r="4"
                      fill="#2563EB"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <text
                      x={startX + groupBarBlockWidth / 2}
                      y={paddingTop + plotHeight * (1 - group.passRate / 100) - 8}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill="#2563EB"
                    >
                      {group.passRate}%
                    </text>
                  </g>
                )}

                {/* X Axis Label */}
                <text
                  x={groupX + groupWidth / 2}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="var(--text-primary)"
                  style={{ textTransform: 'capitalize' }}
                >
                  {group.name}
                </text>
                <text
                  x={groupX + groupWidth / 2}
                  y={height - paddingBottom + 32}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="var(--text-secondary)"
                >
                  n = {group.count}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredItem && (
          <div
            style={{
              position: 'absolute',
              top: `${Math.max(5, (hoveredItem.y / height) * 100 - 15)}%`,
              left: `${(hoveredItem.x / chartWidth) * 100}%`,
              transform: 'translate(-50%, -100%)',
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '0.5rem 0.85rem',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{hoveredItem.groupName}</div>
            <div style={{ color: '#93C5FD' }}>{hoveredItem.metricLabel} Average: <strong>{hoveredItem.value} / 100</strong></div>
            <div style={{ color: '#94A3B8', fontSize: '0.7rem', marginTop: '0.2rem' }}>
              Cohort size: {hoveredItem.count} students | Pass rate: {hoveredItem.passRate}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupedBarChart;
