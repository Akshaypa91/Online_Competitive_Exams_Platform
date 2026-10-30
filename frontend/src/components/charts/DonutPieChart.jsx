import React, { useState } from 'react';
import { PieChart as PieIcon, Award } from 'lucide-react';

const DonutPieChart = ({
  bandsData = {},
  title = "Performance Bands Breakdown",
  subtitle = "Distribution of student academic tiers",
  height = 320
}) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // Band configuration
  const bandConfig = {
    'Advanced': { color: '#10B981', label: 'Advanced', range: '80-100% avg score', desc: 'Exemplary mastery' },
    'Proficient': { color: '#4F46E5', label: 'Proficient', range: '60-79% avg score', desc: 'Solid competitive readiness' },
    'Developing': { color: '#F59E0B', label: 'Developing', range: '40-59% avg score', desc: 'Core fundamentals in progress' },
    'Needs Support': { color: '#EF4444', label: 'Needs Support', range: '<40% avg score', desc: 'Requires targeted intervention' },
  };

  const total = Object.values(bandsData).reduce((a, b) => a + b, 0) || 1000;

  // Convert to slices with angles
  let currentAngle = -90; // Start at top
  const slices = Object.keys(bandConfig).map((key) => {
    const count = bandsData[key] || 0;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const angle = total > 0 ? (count / total) * 360 : 0;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    return {
      key,
      count,
      percentage: percentage.toFixed(1),
      startAngle,
      endAngle,
      ...bandConfig[key]
    };
  });

  // SVG Helper: Polar to Cartesian
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  // SVG Helper: Generate Arc Path for Donut Slice
  const describeArc = (x, y, innerRadius, outerRadius, startAngle, endAngle) => {
    // Avoid full 360 loop glitch
    const adjustedEnd = endAngle - startAngle >= 360 ? startAngle + 359.99 : endAngle;
    const startOuter = polarToCartesian(x, y, outerRadius, adjustedEnd);
    const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
    const startInner = polarToCartesian(x, y, innerRadius, startAngle);
    const endInner = polarToCartesian(x, y, innerRadius, adjustedEnd);

    const largeArcFlag = adjustedEnd - startAngle <= 180 ? "0" : "1";

    return [
      "M", startOuter.x, startOuter.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
      "L", startInner.x, startInner.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, endInner.x, endInner.y,
      "Z"
    ].join(" ");
  };

  const cx = 160;
  const cy = 150;
  const innerR = 75;
  const outerR = 120;

  const activeInfo = hoveredSlice || slices[0];

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <PieIcon size={20} color="var(--primary-color)" />
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

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: 320, height: 300 }}>
          <svg viewBox="0 0 320 300" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <filter id="donutShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.12" />
              </filter>
            </defs>

            {slices.map((slice) => {
              if (slice.count === 0) return null;
              const isHovered = hoveredSlice?.key === slice.key;
              const currentOuterR = isHovered ? outerR + 6 : outerR;
              const pathD = describeArc(cx, cy, innerR, currentOuterR, slice.startAngle, slice.endAngle);

              return (
                <path
                  key={slice.key}
                  d={pathD}
                  fill={slice.color}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    filter: isHovered ? 'url(#donutShadow)' : 'none'
                  }}
                  onMouseEnter={() => setHoveredSlice(slice)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              );
            })}

            {/* Center Circle Content */}
            <circle cx={cx} cy={cy} r={innerR - 4} fill="#FFFFFF" />
            <text
              x={cx}
              y={cy - 12}
              textAnchor="middle"
              fontSize="12"
              fill="var(--text-secondary)"
              fontWeight="500"
            >
              {activeInfo?.label || 'Total'}
            </text>
            <text
              x={cx}
              y={cy + 15}
              textAnchor="middle"
              fontSize="22"
              fill={activeInfo?.color || 'var(--text-primary)'}
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              {activeInfo?.count}
            </text>
            <text
              x={cx}
              y={cy + 34}
              textAnchor="middle"
              fontSize="11"
              fill="#64748B"
              fontWeight="600"
            >
              {activeInfo?.percentage}% of cohort
            </text>
          </svg>
        </div>

        {/* Legend Cards */}
        <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {slices.map((slice) => {
            const isHovered = hoveredSlice?.key === slice.key;
            return (
              <div
                key={slice.key}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.5rem',
                  background: isHovered ? `${slice.color}15` : 'var(--surface-muted)',
                  border: isHovered ? `1px solid ${slice.color}` : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: slice.color,
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {slice.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {slice.range}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {slice.count}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: slice.color, fontWeight: 600 }}>
                    {slice.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DonutPieChart;
