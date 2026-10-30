import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, Sliders } from 'lucide-react';

const CorrelationScatterPlot = ({
  records = [],
  title = "Subject Score Correlation Matrix",
  subtitle = "Interactive scatter plot & linear regression trend line",
  height = 360
}) => {
  const [xAxis, setXAxis] = useState('readingScore');
  const [yAxis, setYAxis] = useState('writingScore');
  const [colorBy, setColorBy] = useState('performanceBand'); // 'performanceBand', 'gender', 'testPrep'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const axisOptions = [
    { key: 'mathScore', label: 'Mathematics Score', max: 100 },
    { key: 'readingScore', label: 'Reading Score', max: 100 },
    { key: 'writingScore', label: 'Writing Score', max: 100 },
    { key: 'totalScore', label: 'Total Score', max: 300 },
  ];

  const currentX = axisOptions.find(o => o.key === xAxis) || axisOptions[1];
  const currentY = axisOptions.find(o => o.key === yAxis) || axisOptions[2];

  // Subsample points for smooth performance (sample up to 250 points)
  const plotData = useMemo(() => {
    if (!records || records.length === 0) return [];
    const step = Math.max(1, Math.floor(records.length / 250));
    const list = [];
    for (let i = 0; i < records.length; i += step) {
      list.push(records[i]);
    }
    return list;
  }, [records]);

  // Compute Linear Regression and Pearson Correlation
  const { rValue, slope, intercept } = useMemo(() => {
    if (plotData.length === 0) return { rValue: 0, slope: 0, intercept: 0 };
    const n = plotData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    plotData.forEach(p => {
      const x = p[xAxis] || 0;
      const y = p[yAxis] || 0;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    });

    const denom = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;

    const slopeVal = (n * sumX2 - sumX * sumX) === 0 ? 0 : (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const interceptVal = (sumY - slopeVal * sumX) / n;

    return {
      rValue: Math.round(r * 1000) / 1000,
      slope: slopeVal,
      intercept: interceptVal
    };
  }, [plotData, xAxis, yAxis]);

  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 45;
  const chartWidth = 600;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const maxX = currentX.max;
  const maxY = currentY.max;

  const getX = (val) => paddingLeft + (val / maxX) * plotWidth;
  const getY = (val) => paddingTop + plotHeight * (1 - val / maxY);

  const getColor = (item) => {
    if (colorBy === 'gender') {
      return item.gender === 'female' ? '#EC4899' : '#3B82F6';
    }
    if (colorBy === 'testPrep') {
      return item.testPrep === 'completed' ? '#10B981' : '#94A3B8';
    }
    // Performance band
    switch (item.performanceBand) {
      case 'Advanced': return '#10B981';
      case 'Proficient': return '#4F46E5';
      case 'Developing': return '#F59E0B';
      default: return '#EF4444';
    }
  };

  // Trendline endpoints
  const trendX1 = 0;
  const trendY1 = Math.max(0, Math.min(maxY, intercept));
  const trendX2 = maxX;
  const trendY2 = Math.max(0, Math.min(maxY, slope * maxX + intercept));

  const correlationStrength = 
    Math.abs(rValue) >= 0.8 ? 'Very Strong Positive Correlation' :
    Math.abs(rValue) >= 0.6 ? 'Strong Positive Correlation' :
    Math.abs(rValue) >= 0.4 ? 'Moderate Correlation' : 'Weak Correlation';

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header and Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} color="var(--primary-color)" />
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

        {/* Axis Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>X:</span>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              style={{
                padding: '0.3rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border-color)',
                background: '#FFFFFF',
                color: 'var(--text-primary)'
              }}
            >
              {axisOptions.map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Y:</span>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              style={{
                padding: '0.3rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border-color)',
                background: '#FFFFFF',
                color: 'var(--text-primary)'
              }}
            >
              {axisOptions.map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Color:</span>
            <select
              value={colorBy}
              onChange={(e) => setColorBy(e.target.value)}
              style={{
                padding: '0.3rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border-color)',
                background: '#FFFFFF',
                color: 'var(--text-primary)'
              }}
            >
              <option value="performanceBand">Performance Band</option>
              <option value="gender">Gender</option>
              <option value="testPrep">Test Prep</option>
            </select>
          </div>
        </div>
      </div>

      {/* Correlation Metrics Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.875rem', background: 'var(--surface-muted)', borderRadius: '0.5rem', fontSize: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={16} color="var(--primary-color)" />
          <span>Pearson Correlation (r): <strong style={{ color: 'var(--primary-color)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>{rValue}</strong></span>
          <span style={{ color: '#059669', fontWeight: 600 }}>({correlationStrength})</span>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          Linear Fit: y = {slope.toFixed(2)}x + {intercept.toFixed(1)}
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${chartWidth} ${height}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
          {/* Horizontal Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const val = Math.round(maxY * pct);
            const y = getY(val);
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
                  fontSize="10"
                  fill="#94A3B8"
                  fontFamily="var(--font-mono)"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Vertical Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const val = Math.round(maxX * pct);
            const x = getX(val);
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={paddingTop + plotHeight}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - paddingBottom + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94A3B8"
                  fontFamily="var(--font-mono)"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Regression Line */}
          <line
            x1={getX(trendX1)}
            y1={getY(trendY1)}
            x2={getX(trendX2)}
            y2={getY(trendY2)}
            stroke="#4F46E5"
            strokeWidth="2.5"
            strokeDasharray="6 3"
            opacity="0.8"
          />

          {/* Scatter Data Points */}
          {plotData.map((item, idx) => {
            const xVal = item[xAxis] || 0;
            const yVal = item[yAxis] || 0;
            const px = getX(xVal);
            const py = getY(yVal);
            const dotColor = getColor(item);
            const isHovered = hoveredPoint?.idx === idx;

            return (
              <circle
                key={idx}
                cx={px}
                cy={py}
                r={isHovered ? 6 : 3.5}
                fill={dotColor}
                opacity={hoveredPoint ? (isHovered ? 1 : 0.4) : 0.75}
                stroke="#FFFFFF"
                strokeWidth={isHovered ? 2 : 0.75}
                style={{ cursor: 'pointer', transition: 'all 0.1s ease' }}
                onMouseEnter={() => setHoveredPoint({ ...item, idx, xVal, yVal, px, py })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Axis Labels */}
          <text
            x={paddingLeft + plotWidth / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize="11"
            fill="var(--text-secondary)"
            fontWeight="600"
          >
            {currentX.label}
          </text>
          <text
            x={15}
            y={paddingTop + plotHeight / 2}
            textAnchor="middle"
            fontSize="11"
            fill="var(--text-secondary)"
            fontWeight="600"
            transform={`rotate(-90, 15, ${paddingTop + plotHeight / 2})`}
          >
            {currentY.label}
          </text>
        </svg>

        {/* Hover Popup */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: `${Math.max(5, (hoveredPoint.py / height) * 100 - 18)}%`,
              left: `${(hoveredPoint.px / chartWidth) * 100}%`,
              transform: 'translate(-50%, -100%)',
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '0.6rem 0.85rem',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              boxShadow: 'var(--shadow-lg)',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{ fontWeight: 700, color: '#93C5FD', textTransform: 'capitalize' }}>
              Student Profile ({hoveredPoint.gender}, {hoveredPoint.raceEthnicity})
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              {currentX.label}: <strong>{hoveredPoint.xVal}</strong> | {currentY.label}: <strong>{hoveredPoint.yVal}</strong>
            </div>
            <div style={{ color: '#94A3B8', fontSize: '0.7rem', marginTop: '0.2rem' }}>
              Parental Edu: {hoveredPoint.parentalEducation} | Test Prep: {hoveredPoint.testPrep}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrelationScatterPlot;
