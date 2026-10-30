import React, { useState } from 'react';
import { BarChart3, TrendingUp, Layers } from 'lucide-react';

const HistogramChart = ({ 
  data, 
  title = "Score Distribution Histogram", 
  height = 320 
}) => {
  const [activeSubject, setActiveSubject] = useState('math');
  const [showBellCurve, setShowBellCurve] = useState(true);
  const [hoveredBin, setHoveredBin] = useState(null);

  const bins = data ? (
    activeSubject === 'math' ? data.mathBins :
    activeSubject === 'reading' ? data.readingBins :
    activeSubject === 'writing' ? data.writingBins :
    data.averageBins
  ) : [];

  const subjectConfig = {
    math: { label: 'Mathematics', color: '#4F46E5', secondary: '#818CF8', mean: 66.1, std: 15.2 },
    reading: { label: 'Reading', color: '#059669', secondary: '#34D399', mean: 69.2, std: 14.6 },
    writing: { label: 'Writing', color: '#D97706', secondary: '#FBBF24', mean: 68.1, std: 15.2 },
    average: { label: 'Overall Average', color: '#7C3AED', secondary: '#A78BFA', mean: 67.8, std: 14.3 },
  };

  const currentConfig = subjectConfig[activeSubject];
  const maxCount = Math.max(...(bins?.map(b => b.count) || [1]), 1);
  const totalCount = bins?.reduce((sum, b) => sum + b.count, 0) || 1000;

  // Chart dimensions
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;
  const chartWidth = 600;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const binWidth = plotWidth / (bins?.length || 10);

  // Normal distribution curve points
  const generateBellCurvePoints = () => {
    if (!bins || bins.length === 0) return '';
    const points = [];
    const mean = currentConfig.mean;
    const std = currentConfig.std;
    const step = 2;

    for (let x = 0; x <= 100; x += step) {
      // Gaussian PDF formula
      const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(std, 2));
      const pdf = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
      
      // Scale PDF so area matches total histogram height
      const scaledCount = pdf * totalCount * 10; // bin width is 10
      const px = paddingLeft + (x / 100) * plotWidth;
      const py = paddingTop + plotHeight - (scaledCount / maxCount) * plotHeight;
      points.push(`${px.toFixed(1)},${Math.max(paddingTop, Math.min(paddingTop + plotHeight, py)).toFixed(1)}`);
    }
    return points.join(' ');
  };

  const meanX = paddingLeft + (currentConfig.mean / 100) * plotWidth;

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} color={currentConfig.color} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {title}
            </h3>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            1,000 students binned into 10-point score intervals
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Subject Pills */}
          <div style={{ display: 'inline-flex', padding: '0.25rem', background: 'var(--surface-muted)', borderRadius: '0.5rem' }}>
            {Object.keys(subjectConfig).map((key) => (
              <button
                key={key}
                onClick={() => setActiveSubject(key)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: activeSubject === key ? '#FFFFFF' : 'transparent',
                  color: activeSubject === key ? subjectConfig[key].color : 'var(--text-secondary)',
                  boxShadow: activeSubject === key ? 'var(--shadow-xs)' : 'none',
                }}
              >
                {subjectConfig[key].label}
              </button>
            ))}
          </div>

          {/* Bell Curve Toggle */}
          <button
            onClick={() => setShowBellCurve(!showBellCurve)}
            title="Toggle Gaussian distribution curve"
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              borderRadius: '0.375rem',
              border: `1px solid ${showBellCurve ? currentConfig.color : 'var(--border-color)'}`,
              background: showBellCurve ? `${currentConfig.color}15` : '#FFFFFF',
              color: showBellCurve ? currentConfig.color : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <TrendingUp size={14} />
            <span>Bell Curve</span>
          </button>
        </div>
      </div>

      {/* Stats Quickbar */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', padding: '0.5rem 0.875rem', background: 'var(--surface-muted)', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Mean: </span>
          <strong style={{ color: 'var(--text-primary)' }}>{currentConfig.mean}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Std Dev: </span>
          <strong style={{ color: 'var(--text-primary)' }}>±{currentConfig.std}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Highest Density Range: </span>
          <strong style={{ color: currentConfig.color }}>
            {bins?.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), { label: '60-69', count: 0 }).label} pts
          </strong>
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ position: 'relative', width: '100%' }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={`barGrad-${activeSubject}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentConfig.secondary} />
              <stop offset="100%" stopColor={currentConfig.color} />
            </linearGradient>
            <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingTop + plotHeight * (1 - pct);
            const val = Math.round(maxCount * pct);
            return (
              <g key={i}>
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

          {/* Histogram Bars */}
          {bins?.map((bin, i) => {
            const barH = (bin.count / maxCount) * plotHeight;
            const x = paddingLeft + i * binWidth + 4;
            const y = paddingTop + plotHeight - barH;
            const w = Math.max(binWidth - 8, 4);
            const isHovered = hoveredBin?.label === bin.label;

            return (
              <g key={bin.label}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={barH}
                  rx="4"
                  fill={`url(#barGrad-${activeSubject})`}
                  opacity={hoveredBin ? (isHovered ? 1 : 0.45) : 0.9}
                  style={{
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredBin({ ...bin, x: x + w / 2, y, pct: ((bin.count / totalCount) * 100).toFixed(1) })}
                  onMouseLeave={() => setHoveredBin(null)}
                />

                {/* Count label above bar */}
                {bin.count > 0 && (
                  <text
                    x={x + w / 2}
                    y={y - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill={isHovered ? currentConfig.color : '#64748B'}
                  >
                    {bin.count}
                  </text>
                )}

                {/* X-axis labels */}
                <text
                  x={x + w / 2}
                  y={height - paddingBottom + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748B"
                  fontWeight={isHovered ? "600" : "400"}
                >
                  {bin.label}
                </text>
              </g>
            );
          })}

          {/* Bell Curve Polyline */}
          {showBellCurve && (
            <polyline
              fill="none"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              points={generateBellCurvePoints()}
              opacity="0.75"
            />
          )}

          {/* Mean Indicator Line */}
          <line
            x1={meanX}
            y1={paddingTop}
            x2={meanX}
            y2={paddingTop + plotHeight}
            stroke="#EF4444"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text
            x={meanX}
            y={paddingTop - 10}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill="#EF4444"
          >
            μ = {currentConfig.mean}
          </text>

          {/* X Axis label */}
          <text
            x={paddingLeft + plotWidth / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize="11"
            fill="#64748B"
            fontWeight="500"
          >
            Score Range (out of 100)
          </text>
        </svg>

        {/* Hover Tooltip */}
        {hoveredBin && (
          <div
            style={{
              position: 'absolute',
              top: `${Math.max(10, (hoveredBin.y / height) * 100 - 15)}%`,
              left: `${(hoveredBin.x / chartWidth) * 100}%`,
              transform: 'translate(-50%, -100%)',
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '0.45rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{ fontWeight: 600 }}>Score: {hoveredBin.label}</div>
            <div style={{ color: '#94A3B8' }}>
              <strong>{hoveredBin.count} students</strong> ({hoveredBin.pct}%)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistogramChart;
