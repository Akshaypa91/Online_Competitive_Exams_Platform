import React, { useState, useMemo } from 'react';
import { Grid, Layers } from 'lucide-react';

const HeatmapMatrix = ({
  records = [],
  title = "Parental Education vs Performance Band Matrix",
  subtitle = "Cross-tabulation density heatmap showing academic tier outcomes",
}) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  const eduRows = [
    "master's degree",
    "bachelor's degree",
    "associate's degree",
    "some college",
    "high school",
    "some high school",
  ];

  const bandCols = [
    { key: 'Advanced', label: 'Advanced (80-100%)', color: '#10B981' },
    { key: 'Proficient', label: 'Proficient (60-79%)', color: '#4F46E5' },
    { key: 'Developing', label: 'Developing (40-59%)', color: '#F59E0B' },
    { key: 'Needs Support', label: 'Needs Support (<40%)', color: '#EF4444' },
  ];

  // Calculate grid counts
  const { matrix, maxCellCount, rowTotals } = useMemo(() => {
    const counts = {};
    const rowSums = {};
    let max = 1;

    eduRows.forEach(r => {
      counts[r] = {};
      rowSums[r] = 0;
      bandCols.forEach(b => {
        counts[r][b.key] = 0;
      });
    });

    records.forEach(item => {
      const edu = item.parentalEducation?.toLowerCase();
      const band = item.performanceBand;
      if (counts[edu] && counts[edu][band] !== undefined) {
        counts[edu][band]++;
        rowSums[edu]++;
        if (counts[edu][band] > max) max = counts[edu][band];
      }
    });

    return { matrix: counts, maxCellCount: max, rowTotals: rowSums };
  }, [records]);

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Grid size={20} color="var(--primary-color)" />
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

      {/* Heatmap Table Grid */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px', textAlign: 'center' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Parental Education Level
              </th>
              {bandCols.map(col => (
                <th key={col.key} style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: col.color }}>
                  {col.label}
                </th>
              ))}
              <th style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Cohort Total
              </th>
            </tr>
          </thead>
          <tbody>
            {eduRows.map(row => {
              const totalInRow = rowTotals[row] || 1;
              return (
                <tr key={row}>
                  <td style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {row}
                  </td>
                  {bandCols.map(col => {
                    const count = matrix[row]?.[col.key] || 0;
                    const pctOfRow = Math.round((count / totalInRow) * 100);
                    const intensity = maxCellCount > 0 ? count / maxCellCount : 0;
                    const isHovered = hoveredCell?.row === row && hoveredCell?.col === col.key;

                    // Heat background: interpolated based on intensity
                    const bgAlpha = Math.max(0.08, intensity * 0.85);

                    return (
                      <td
                        key={col.key}
                        onMouseEnter={() => setHoveredCell({ row, col: col.key, count, pctOfRow, totalInRow, color: col.color })}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          padding: '0.75rem 0.5rem',
                          borderRadius: '0.375rem',
                          backgroundColor: `${col.color}${Math.round(bgAlpha * 255).toString(16).padStart(2, '0')}`,
                          border: isHovered ? `2px solid ${col.color}` : '1px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: intensity > 0.45 ? '#FFFFFF' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                          {count}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: intensity > 0.45 ? '#F8FAFC' : 'var(--text-secondary)' }}>
                          {pctOfRow}%
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    n = {totalInRow}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Heatmap Tooltip Status Footer */}
      <div style={{ marginTop: '1rem', padding: '0.625rem 0.875rem', background: 'var(--surface-muted)', borderRadius: '0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        {hoveredCell ? (
          <div>
            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{hoveredCell.row}</span>: <strong style={{ color: hoveredCell.color }}>{hoveredCell.count} students ({hoveredCell.pctOfRow}%)</strong> achieved <strong>{hoveredCell.col}</strong> band.
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)' }}>
            Hover over any cell to inspect conditional tier probabilities and cohort counts.
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <span>Intensity scale:</span>
          <div style={{ display: 'flex', height: 8, width: 80, borderRadius: 4, background: 'linear-gradient(to right, #EEF2FF, #4F46E5)' }} />
          <span>Higher density</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapMatrix;
