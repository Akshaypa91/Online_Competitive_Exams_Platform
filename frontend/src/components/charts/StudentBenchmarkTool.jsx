import React, { useState } from 'react';
import { Trophy, ArrowUpRight, CheckCircle2, Lightbulb, Sparkles, BookOpen } from 'lucide-react';

const StudentBenchmarkTool = ({ records = [] }) => {
  const [studentMath, setStudentMath] = useState(75);
  const [studentReading, setStudentReading] = useState(82);
  const [studentWriting, setStudentWriting] = useState(78);

  const studentAvg = Math.round(((studentMath + studentReading + studentWriting) / 3) * 10) / 10;
  const studentTotal = studentMath + studentReading + studentWriting;

  // Compute percentile against the 1,000 student records
  const totalRecords = records.length || 1000;
  const lowerScoresCount = records.filter(r => r.totalScore < studentTotal).length;
  const percentile = Math.round((lowerScoresCount / totalRecords) * 1000) / 10;

  const cohortMathAvg = 66.1;
  const cohortReadingAvg = 69.2;
  const cohortWritingAvg = 68.1;
  const cohortOverallAvg = 67.8;

  const mathDiff = Math.round((studentMath - cohortMathAvg) * 10) / 10;
  const readingDiff = Math.round((studentReading - cohortReadingAvg) * 10) / 10;
  const writingDiff = Math.round((studentWriting - cohortWritingAvg) * 10) / 10;
  const avgDiff = Math.round((studentAvg - cohortOverallAvg) * 10) / 10;

  // Determine band
  const studentBand = 
    studentAvg >= 80 ? { name: 'Advanced', color: '#10B981', bg: '#ECFDF5' } :
    studentAvg >= 60 ? { name: 'Proficient', color: '#4F46E5', bg: '#EEF2FF' } :
    studentAvg >= 40 ? { name: 'Developing', color: '#F59E0B', bg: '#FFFBEB' } :
    { name: 'Needs Support', color: '#EF4444', bg: '#FEF2F2' };

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={20} color="#F59E0B" />
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Candidate Percentile & Cohort Benchmarking Studio
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Simulate or evaluate your exam performance relative to 1,000 candidate test-takers
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '2rem',
            background: studentBand.bg,
            border: `1px solid ${studentBand.color}40`,
            color: studentBand.color,
            fontSize: '0.8125rem',
            fontWeight: 700
          }}
        >
          <Sparkles size={16} />
          <span>Tier: {studentBand.name}</span>
        </div>
      </div>

      {/* Interactive Score Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem', background: 'var(--surface-muted)', padding: '1.25rem', borderRadius: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8125rem', fontWeight: 600 }}>
            <span style={{ color: '#4F46E5' }}>Math Score</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{studentMath} / 100</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={studentMath}
            onChange={(e) => setStudentMath(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#4F46E5' }}
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Cohort Avg: {cohortMathAvg} ({mathDiff >= 0 ? `+${mathDiff}` : mathDiff} pts)
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8125rem', fontWeight: 600 }}>
            <span style={{ color: '#059669' }}>Reading Score</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{studentReading} / 100</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={studentReading}
            onChange={(e) => setStudentReading(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#059669' }}
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Cohort Avg: {cohortReadingAvg} ({readingDiff >= 0 ? `+${readingDiff}` : readingDiff} pts)
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8125rem', fontWeight: 600 }}>
            <span style={{ color: '#D97706' }}>Writing Score</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{studentWriting} / 100</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={studentWriting}
            onChange={(e) => setStudentWriting(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#D97706' }}
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Cohort Avg: {cohortWritingAvg} ({writingDiff >= 0 ? `+${writingDiff}` : writingDiff} pts)
          </div>
        </div>
      </div>

      {/* Results and Visual Percentile Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        {/* Percentile Highlight Card */}
        <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)', color: '#FFFFFF' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>
            Competitive Standing
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', margin: '0.25rem 0' }}>
            {percentile}th
          </div>
          <div style={{ fontSize: '0.8125rem', opacity: 0.9 }}>
            Percentile Rank
          </div>
          <p style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '0.5rem', lineHeight: 1.4 }}>
            You scored higher than <strong>{Math.round(percentile)}%</strong> of candidates across the 1,000-student historical cohort!
          </p>
        </div>

        {/* Visual Percentile Progress Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600 }}>
            <span>Cohort Distribution Position</span>
            <span style={{ color: 'var(--primary-color)' }}>{studentAvg}% Composite</span>
          </div>

          <div style={{ height: 16, width: '100%', background: '#E2E8F0', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
            {/* Tier background bands */}
            <div style={{ position: 'absolute', left: '0%', width: '40%', height: '100%', background: '#FCA5A5', opacity: 0.4 }} title="Needs Support" />
            <div style={{ position: 'absolute', left: '40%', width: '20%', height: '100%', background: '#FCD34D', opacity: 0.4 }} title="Developing" />
            <div style={{ position: 'absolute', left: '60%', width: '20%', height: '100%', background: '#93C5FD', opacity: 0.4 }} title="Proficient" />
            <div style={{ position: 'absolute', left: '80%', width: '20%', height: '100%', background: '#6EE7B7', opacity: 0.4 }} title="Advanced" />

            {/* Student marker fill */}
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, percentile))}%`,
                background: 'var(--primary-color)',
                borderRadius: 8,
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <span>0% (Lowest)</span>
            <span>25th (Developing)</span>
            <span>50th (Median)</span>
            <span>75th (Proficient)</span>
            <span>100% (Top)</span>
          </div>
        </div>
      </div>

      {/* Dataset-Driven Improvement Recommendations */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          <Lightbulb size={16} color="#F59E0B" />
          <span>Empirical Dataset Insights for Candidates:</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <li>
            <strong>Test Preparation Course Boost:</strong> Students who completed prep coursework scored on average <strong>+9.9 points higher</strong> in Writing and <strong>+7.4 points higher</strong> in Reading.
          </li>
          <li>
            <strong>Reading-Writing Correlation (r = 0.954):</strong> Strong reading comprehension is the single highest predictor of high writing scores.
          </li>
          <li>
            <strong>Competitive Milestone:</strong> Reaching a total composite score of <strong>240/300 (80% average)</strong> elevates candidates into the top <strong>19.8% (Advanced tier)</strong>.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StudentBenchmarkTool;
