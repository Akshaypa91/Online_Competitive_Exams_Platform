import React, { useState } from 'react';
import { Compass, Eye } from 'lucide-react';

const RadarChart = ({
  comparisonsData,
  title = "Cohort Multi-Dimensional Competency Radar",
  subtitle = "5-axis holistic comparison of skill profiles",
  height = 360
}) => {
  const [selectedCategory, setSelectedCategory] = useState('testPrep'); // 'testPrep', 'gender', 'lunch'

  const axes = [
    { key: 'mathAvg', label: 'Math Ability', max: 100 },
    { key: 'readingAvg', label: 'Reading Comprehension', max: 100 },
    { key: 'writingAvg', label: 'Writing Proficiency', max: 100 },
    { key: 'totalNormalized', label: 'Overall Composite', max: 100 },
    { key: 'passRate', label: 'Pass Rate (%)', max: 100 },
  ];

  // Colors for series
  const seriesColors = [
    { stroke: '#4F46E5', fill: 'rgba(79, 70, 229, 0.25)', label: 'Primary' },
    { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.25)', label: 'Secondary' },
    { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.25)', label: 'Tertiary' },
  ];

  const getSeriesData = () => {
    if (!comparisonsData) return [];
    let list = [];
    if (selectedCategory === 'testPrep') {
      list = comparisonsData.testPrepComparison || [];
    } else if (selectedCategory === 'gender') {
      list = comparisonsData.genderComparison || [];
    } else if (selectedCategory === 'lunch') {
      list = comparisonsData.lunchComparison || [];
    }
    return list.map((item, idx) => ({
      ...item,
      totalNormalized: Math.round((item.totalAvg / 3) * 10) / 10,
      color: seriesColors[idx % seriesColors.length]
    }));
  };

  const series = getSeriesData();

  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 115;
  const angleStep = (Math.PI * 2) / axes.length;

  const getCoordinates = (value, maxVal, axisIndex) => {
    const angle = axisIndex * angleStep - Math.PI / 2;
    const r = (Math.min(maxVal, Math.max(0, value)) / maxVal) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header and Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={20} color="var(--primary-color)" />
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

        {/* Category Selector */}
        <div style={{ display: 'inline-flex', padding: '0.25rem', background: 'var(--surface-muted)', borderRadius: '0.5rem' }}>
          <button
            onClick={() => setSelectedCategory('testPrep')}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: selectedCategory === 'testPrep' ? '#FFFFFF' : 'transparent',
              color: selectedCategory === 'testPrep' ? 'var(--primary-color)' : 'var(--text-secondary)',
              boxShadow: selectedCategory === 'testPrep' ? 'var(--shadow-xs)' : 'none',
            }}
          >
            Test Prep Impact
          </button>
          <button
            onClick={() => setSelectedCategory('gender')}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: selectedCategory === 'gender' ? '#FFFFFF' : 'transparent',
              color: selectedCategory === 'gender' ? 'var(--primary-color)' : 'var(--text-secondary)',
              boxShadow: selectedCategory === 'gender' ? 'var(--shadow-xs)' : 'none',
            }}
          >
            Gender Profiles
          </button>
          <button
            onClick={() => setSelectedCategory('lunch')}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: selectedCategory === 'lunch' ? '#FFFFFF' : 'transparent',
              color: selectedCategory === 'lunch' ? 'var(--primary-color)' : 'var(--text-secondary)',
              boxShadow: selectedCategory === 'lunch' ? 'var(--shadow-xs)' : 'none',
            }}
          >
            Socioeconomic / Lunch
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        {/* SVG Radar */}
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Concentric Grid Polygons */}
            {[0.25, 0.5, 0.75, 1].map((scale) => {
              const polyPoints = axes.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const r = radius * scale;
                return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
              }).join(' ');

              return (
                <g key={scale}>
                  <polygon
                    points={polyPoints}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray={scale < 1 ? "3 3" : "none"}
                  />
                  <text
                    x={cx + 4}
                    y={cy - radius * scale + 10}
                    fontSize="9"
                    fill="#94A3B8"
                    fontFamily="var(--font-mono)"
                  >
                    {Math.round(scale * 100)}
                  </text>
                </g>
              );
            })}

            {/* Radial Spokes from Center */}
            {axes.map((axis, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const xEnd = cx + radius * Math.cos(angle);
              const yEnd = cy + radius * Math.sin(angle);
              const xLabel = cx + (radius + 22) * Math.cos(angle);
              const yLabel = cy + (radius + 18) * Math.sin(angle);

              return (
                <g key={axis.key}>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={xEnd}
                    y2={yEnd}
                    stroke="#CBD5E1"
                    strokeWidth="1.2"
                  />
                  <text
                    x={xLabel}
                    y={yLabel}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="var(--text-primary)"
                  >
                    {axis.label}
                  </text>
                </g>
              );
            })}

            {/* Series Polygons */}
            {series.map((s) => {
              const points = axes.map((axis, i) => {
                const val = s[axis.key] || 0;
                const coord = getCoordinates(val, axis.max, i);
                return `${coord.x.toFixed(1)},${coord.y.toFixed(1)}`;
              }).join(' ');

              return (
                <g key={s.name}>
                  <polygon
                    points={points}
                    fill={s.color.fill}
                    stroke={s.color.stroke}
                    strokeWidth="2.5"
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  {axes.map((axis, i) => {
                    const val = s[axis.key] || 0;
                    const coord = getCoordinates(val, axis.max, i);
                    return (
                      <circle
                        key={axis.key}
                        cx={coord.x}
                        cy={coord.y}
                        r="3.5"
                        fill={s.color.stroke}
                        stroke="#FFFFFF"
                        strokeWidth="1"
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend & Details */}
        <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Comparison Groups
          </div>
          {series.map((s) => (
            <div
              key={s.name}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: `1px solid ${s.color.stroke}30`,
                background: `${s.color.stroke}08`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: s.color.stroke }} />
                  <strong style={{ textTransform: 'capitalize', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    {s.name}
                  </strong>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  n = {s.count}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                <div>Math: <strong>{s.mathAvg}</strong></div>
                <div>Reading: <strong>{s.readingAvg}</strong></div>
                <div>Writing: <strong>{s.writingAvg}</strong></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: `1px dashed ${s.color.stroke}30`, paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                <span>Pass Rate: <strong style={{ color: '#059669' }}>{s.passRate}%</strong></span>
                <span>Composite: <strong>{s.totalAvg} / 300</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RadarChart;
