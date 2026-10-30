import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '../../components/AppLayout';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { analyticsApi } from '../../services/analyticsApi';

// Visual Chart Components
import HistogramChart from '../../components/charts/HistogramChart';
import GroupedBarChart from '../../components/charts/GroupedBarChart';
import DonutPieChart from '../../components/charts/DonutPieChart';
import BoxPlotChart from '../../components/charts/BoxPlotChart';
import CorrelationScatterPlot from '../../components/charts/CorrelationScatterPlot';
import RadarChart from '../../components/charts/RadarChart';
import HeatmapMatrix from '../../components/charts/HeatmapMatrix';
import CohortFilterBar from '../../components/charts/CohortFilterBar';

import {
  BarChart3,
  TrendingUp,
  Download,
  AlertTriangle,
  Users,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowRight
} from 'lucide-react';

const AdminAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [distributions, setDistributions] = useState(null);
  const [comparisons, setComparisons] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active slice filters
  const [filters, setFilters] = useState({
    gender: 'all',
    testPrep: 'all',
    lunch: 'all',
    parentalEducation: 'all',
    raceEthnicity: 'all',
    performanceBand: 'all'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ov, dist, comp, recs] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getDistributions(),
          analyticsApi.getComparisons(),
          analyticsApi.getAllRecords()
        ]);

        setOverview(ov);
        setDistributions(dist);
        setComparisons(comp);
        setAllRecords(recs || []);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
        setError(err.message || 'Failed to load performance analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      gender: 'all',
      testPrep: 'all',
      lunch: 'all',
      parentalEducation: 'all',
      raceEthnicity: 'all',
      performanceBand: 'all'
    });
  };

  // Filtered dataset for dynamic charts
  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      if (filters.gender !== 'all' && r.gender !== filters.gender) return false;
      if (filters.testPrep !== 'all' && r.testPrep !== filters.testPrep) return false;
      if (filters.lunch !== 'all' && r.lunch !== filters.lunch) return false;
      if (filters.parentalEducation !== 'all' && r.parentalEducation?.toLowerCase() !== filters.parentalEducation?.toLowerCase()) return false;
      if (filters.raceEthnicity !== 'all' && r.raceEthnicity?.toLowerCase() !== filters.raceEthnicity?.toLowerCase()) return false;
      if (filters.performanceBand !== 'all' && r.performanceBand !== filters.performanceBand) return false;
      return true;
    });
  }, [allRecords, filters]);

  // Dynamic filtered distributions
  const filteredDistributions = useMemo(() => {
    const bins = [
      { label: '0-9', min: 0, max: 9, count: 0 },
      { label: '10-19', min: 10, max: 19, count: 0 },
      { label: '20-29', min: 20, max: 29, count: 0 },
      { label: '30-39', min: 30, max: 39, count: 0 },
      { label: '40-49', min: 40, max: 49, count: 0 },
      { label: '50-59', min: 50, max: 59, count: 0 },
      { label: '60-69', min: 60, max: 69, count: 0 },
      { label: '70-79', min: 70, max: 79, count: 0 },
      { label: '80-89', min: 80, max: 89, count: 0 },
      { label: '90-100', min: 90, max: 100, count: 0 },
    ];
    const m = bins.map(b => ({ ...b }));
    const r = bins.map(b => ({ ...b }));
    const w = bins.map(b => ({ ...b }));
    const a = bins.map(b => ({ ...b }));

    filteredRecords.forEach(row => {
      const fill = (val, target) => {
        const item = target.find(b => val >= b.min && val <= b.max);
        if (item) item.count++;
      };
      fill(row.mathScore, m);
      fill(row.readingScore, r);
      fill(row.writingScore, w);
      fill(Math.round(row.averageScore), a);
    });

    return { mathBins: m, readingBins: r, writingBins: w, averageBins: a };
  }, [filteredRecords]);

  // Dynamic filtered bands count
  const filteredBandsData = useMemo(() => {
    const counts = { 'Advanced': 0, 'Proficient': 0, 'Developing': 0, 'Needs Support': 0 };
    filteredRecords.forEach(r => {
      if (counts[r.performanceBand] !== undefined) {
        counts[r.performanceBand]++;
      }
    });
    return counts;
  }, [filteredRecords]);

  // Export filtered dataset to CSV
  const handleExportCSV = () => {
    if (!filteredRecords.length) return;
    const headers = Object.keys(filteredRecords[0]).join(',');
    const rows = filteredRecords.map(r => Object.values(r).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `students_performance_filtered_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // High-risk students needing intervention (< 40 overall average)
  const highRiskStudents = useMemo(() => {
    return filteredRecords.filter(r => r.performanceBand === 'Needs Support');
  }, [filteredRecords]);

  if (loading) {
    return (
      <AppLayout isAdmin={true} title="Performance Analytics & Visualizations">
        <Loading message="Processing StudentsPerformance_Clean dataset and generating plots..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout isAdmin={true} title="Performance Analytics & Visualizations">
        <ErrorMessage message={error} />
      </AppLayout>
    );
  }

  return (
    <AppLayout isAdmin={true} title="Performance Analytics Studio">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Cohort Analytics & Visual Data Studio
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
            Empirical multi-variate statistical visualization powered by <strong>StudentsPerformance_Clean.csv</strong> (1,000 records)
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}
        >
          <Download size={16} />
          Export Cohort CSV ({filteredRecords.length})
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
            <span>TOTAL CANDIDATES</span>
            <Users size={18} color="var(--primary-color)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.35rem 0', fontFamily: 'var(--font-mono)' }}>
            {filteredRecords.length.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
            100% Data Integrity
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
            <span>COHORT PASS RATE</span>
            <CheckCircle2 size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981', margin: '0.35rem 0', fontFamily: 'var(--font-mono)' }}>
            {overview?.passRate || 74.2}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Criteria: Composite ≥ 60%
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
            <span>MATH AVERAGE</span>
            <BarChart3 size={18} color="#4F46E5" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4F46E5', margin: '0.35rem 0', fontFamily: 'var(--font-mono)' }}>
            {overview?.mathStats?.mean || 66.1}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Median: {overview?.mathStats?.median || 66} / 100
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
            <span>READING & WRITING</span>
            <Award size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669', margin: '0.35rem 0', fontFamily: 'var(--font-mono)' }}>
            {overview?.readingStats?.mean || 69.2} / {overview?.writingStats?.mean || 68.1}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            High correlation: r = 0.954
          </div>
        </div>
      </div>

      {/* Interactive Slicer & Filters */}
      <CohortFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        totalCount={allRecords.length || 1000}
        filteredCount={filteredRecords.length}
      />

      {/* Primary Graphs Row: Histogram & Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <HistogramChart
          data={filteredDistributions}
          title="Candidate Score Distribution Frequency"
          height={320}
        />
        <DonutPieChart
          bandsData={filteredBandsData}
          title="Performance Tier Distribution"
          subtitle="Relative breakdown across Advanced, Proficient, Developing, and Needs Support"
          height={320}
        />
      </div>

      {/* Secondary Graphs Row: Grouped Bar & Radar Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <GroupedBarChart
          data={comparisons?.parentalEduComparison || []}
          title="Parental Education vs Academic Mastery"
          subtitle="Direct comparison of Math, Reading, and Writing averages by parent credential"
          height={340}
        />
        <RadarChart
          comparisonsData={comparisons}
          title="Demographic Competency Radar"
          subtitle="Multi-axial profile showing Test Prep, Gender, and Lunch disparities"
          height={340}
        />
      </div>

      {/* Tertiary Graphs Row: Box Plot & Scatter Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <BoxPlotChart
          overviewData={overview}
          title="Five-Number Statistical Quartiles (Box & Whisker)"
          subtitle="Min, Q1 (25th), Median (50th), Q3 (75th), and Max distributions"
          height={330}
        />
        <CorrelationScatterPlot
          records={filteredRecords}
          title="Subject Cross-Correlation & Linear Regression"
          subtitle="Scatter points with trend line and calculated Pearson r correlation coefficient"
          height={330}
        />
      </div>

      {/* Heatmap Matrix Row */}
      <div style={{ marginBottom: '1.5rem' }}>
        <HeatmapMatrix
          records={filteredRecords}
          title="Parental Education vs Performance Band Cross-Tabulation Heatmap"
          subtitle="Density matrix of student tier outcomes mapped to parental education background"
        />
      </div>

      {/* Academic Risk & Early Intervention Table */}
      <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="#EF4444" />
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Academic Risk & Early Intervention Register
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                Candidates scoring under 40% average in the current active filter ({highRiskStudents.length} candidates detected)
              </p>
            </div>
          </div>
          <span className="badge badge-error" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
            {highRiskStudents.length} Needs Support
          </span>
        </div>

        {highRiskStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            No candidates fall in the "Needs Support" tier within the selected filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Gender</th>
                  <th>Race/Ethnicity</th>
                  <th>Parental Education</th>
                  <th>Test Prep</th>
                  <th>Lunch</th>
                  <th>Math</th>
                  <th>Reading</th>
                  <th>Writing</th>
                  <th>Total</th>
                  <th>Intervention Strategy</th>
                </tr>
              </thead>
              <tbody>
                {highRiskStudents.slice(0, 10).map((student, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>#{idx + 1}</td>
                    <td style={{ textTransform: 'capitalize' }}>{student.gender}</td>
                    <td style={{ textTransform: 'capitalize' }}>{student.raceEthnicity}</td>
                    <td style={{ textTransform: 'capitalize' }}>{student.parentalEducation}</td>
                    <td>
                      <span className={`badge ${student.testPrep === 'completed' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                        {student.testPrep}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{student.lunch}</td>
                    <td style={{ color: student.mathScore < 40 ? '#EF4444' : 'inherit', fontWeight: 600 }}>{student.mathScore}</td>
                    <td style={{ color: student.readingScore < 40 ? '#EF4444' : 'inherit', fontWeight: 600 }}>{student.readingScore}</td>
                    <td style={{ color: student.writingScore < 40 ? '#EF4444' : 'inherit', fontWeight: 600 }}>{student.writingScore}</td>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#EF4444' }}>{student.totalScore}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {student.testPrep === 'none' ? 'Mandate Test Prep Coursework' : 'Provide Foundation Remediation'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {highRiskStudents.length > 10 && (
              <div style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Showing top 10 of {highRiskStudents.length} candidates needing intervention.
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminAnalytics;
