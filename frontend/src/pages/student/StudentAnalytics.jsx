import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { analyticsApi } from '../../services/analyticsApi';

// Visual Chart Components
import HistogramChart from '../../components/charts/HistogramChart';
import GroupedBarChart from '../../components/charts/GroupedBarChart';
import DonutPieChart from '../../components/charts/DonutPieChart';
import RadarChart from '../../components/charts/RadarChart';
import StudentBenchmarkTool from '../../components/charts/StudentBenchmarkTool';
import CorrelationScatterPlot from '../../components/charts/CorrelationScatterPlot';

import {
  TrendingUp,
  Award,
  BookOpen,
  Target,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Lightbulb
} from 'lucide-react';

const StudentAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [distributions, setDistributions] = useState(null);
  const [comparisons, setComparisons] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.error('Failed to load student analytics:', err);
        setError(err.message || 'Failed to load performance analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AppLayout isAdmin={false} title="Performance Analytics & Cohort Insights">
        <Loading message="Loading candidate benchmarking dataset..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout isAdmin={false} title="Performance Analytics & Cohort Insights">
        <ErrorMessage message={error} />
      </AppLayout>
    );
  }

  return (
    <AppLayout isAdmin={false} title="Candidate Analytics & Benchmarks">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Performance Analytics & Cohort Benchmarks
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
          Evaluate your competitive exam standing against 1,000 candidate records from <strong>StudentsPerformance_Clean.csv</strong>
        </p>
      </div>

      {/* Quick Benchmark Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>COHORT MATH AVERAGE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4F46E5', margin: '0.25rem 0', fontFamily: 'var(--font-mono)' }}>
            66.1 / 100
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Median: 66 | Top 25%: ≥ 77
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>COHORT READING AVERAGE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669', margin: '0.25rem 0', fontFamily: 'var(--font-mono)' }}>
            69.2 / 100
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Median: 70 | Top 25%: ≥ 79
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>COHORT WRITING AVERAGE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#D97706', margin: '0.25rem 0', fontFamily: 'var(--font-mono)' }}>
            68.1 / 100
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Median: 69 | Top 25%: ≥ 79
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ADVANCED TIER BENCHMARK</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981', margin: '0.25rem 0', fontFamily: 'var(--font-mono)' }}>
            ≥ 80.0%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Top 19.8% of all candidates
          </div>
        </div>
      </div>

      {/* Interactive Candidate Percentile Simulator Tool */}
      <div style={{ marginBottom: '1.5rem' }}>
        <StudentBenchmarkTool records={allRecords} />
      </div>

      {/* Row 1: Histogram & Donut Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <HistogramChart
          data={distributions}
          title="Cohort Score Distribution Frequency"
          height={320}
        />
        <DonutPieChart
          bandsData={overview?.bandsCount || {}}
          title="Competitive Academic Tiers"
          subtitle="Percentage of candidate peers in each performance category"
          height={320}
        />
      </div>

      {/* Row 2: Test Prep Impact & Competency Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <GroupedBarChart
          data={comparisons?.testPrepComparison || []}
          title="Test Preparation Impact Analysis"
          subtitle="Clear empirical proof: Score gains achieved by students completing prep coursework"
          height={330}
        />
        <RadarChart
          comparisonsData={comparisons}
          title="Cohort Holistic Competency Radar"
          subtitle="Multi-subject profiles comparing test preparation completion"
          height={330}
        />
      </div>

      {/* Row 3: Correlation Scatter Matrix */}
      <div style={{ marginBottom: '1.5rem' }}>
        <CorrelationScatterPlot
          records={allRecords}
          title="Subject Cross-Disciplinary Synergy"
          subtitle="Explore how reading comprehension correlates with writing and math performance"
          height={330}
        />
      </div>

      {/* Actionable Strategic Advice Card */}
      <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Lightbulb size={20} color="#F59E0B" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Proven Key Takeaways for Competitive Exam Success
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '0.5rem', background: 'var(--surface-muted)' }}>
            <div style={{ fontWeight: 600, color: '#4F46E5', marginBottom: '0.35rem', fontSize: '0.875rem' }}>
              1. Finish Comprehensive Prep Courses
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Data reveals an average increase of <strong>+9.9 points</strong> in Writing and <strong>+7.4 points</strong> in Reading for students who complete preparation courses.
            </p>
          </div>

          <div style={{ padding: '1rem', borderRadius: '0.5rem', background: 'var(--surface-muted)' }}>
            <div style={{ fontWeight: 600, color: '#059669', marginBottom: '0.35rem', fontSize: '0.875rem' }}>
              2. Read to Excel in Writing (r = 0.954)
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              The highest statistical correlation in the entire 1,000-candidate dataset is between Reading and Writing. Expanding reading vocabulary directly boosts essay and written exam marks.
            </p>
          </div>

          <div style={{ padding: '1rem', borderRadius: '0.5rem', background: 'var(--surface-muted)' }}>
            <div style={{ fontWeight: 600, color: '#D97706', marginBottom: '0.35rem', fontSize: '0.875rem' }}>
              3. Target Math Consistency (Highest Variance)
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Mathematics demonstrates the widest score distribution spread (0 to 100, standard deviation ±15.2). Focused practice on problem-solving guarantees the largest percentile jump.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentAnalytics;
