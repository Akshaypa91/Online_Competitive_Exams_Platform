import api from './api';
import localDataset from '../data/studentsPerformanceData.json';

// Local calculation fallbacks for resilient offline/dev functionality
const computeLocalStats = (records) => {
  const data = records || localDataset;
  const calc5 = (arr) => {
    if (!arr.length) return { min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0 };
    const sorted = [...arr].sort((a, b) => a - b);
    const n = sorted.length;
    const min = sorted[0];
    const max = sorted[n - 1];
    const q1 = sorted[Math.floor(n * 0.25)];
    const median = sorted[Math.floor(n * 0.5)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const mean = Math.round((sorted.reduce((a, b) => a + b, 0) / n) * 100) / 100;
    return { min, q1, median, q3, max, mean, count: n };
  };

  const mathScores = data.map(r => r.mathScore);
  const readingScores = data.map(r => r.readingScore);
  const writingScores = data.map(r => r.writingScore);
  const totalScores = data.map(r => r.totalScore);
  const avgScores = data.map(r => r.averageScore);

  const bandsCount = {};
  data.forEach(r => {
    bandsCount[r.performanceBand] = (bandsCount[r.performanceBand] || 0) + 1;
  });

  const genderSplit = { female: 0, male: 0 };
  data.forEach(r => {
    if (r.gender === 'female') genderSplit.female++;
    else if (r.gender === 'male') genderSplit.male++;
  });

  const testPrepSplit = { completed: 0, none: 0 };
  data.forEach(r => {
    if (r.testPrep === 'completed') testPrepSplit.completed++;
    else testPrepSplit.none++;
  });

  const passRate = Math.round((data.filter(r => r.averageScore >= 60).length / data.length) * 1000) / 10;

  return {
    totalStudents: data.length,
    passRate,
    mathStats: calc5(mathScores),
    readingStats: calc5(readingScores),
    writingStats: calc5(writingScores),
    totalStats: calc5(totalScores),
    avgStats: calc5(avgScores),
    bandsCount,
    genderSplit,
    testPrepSplit
  };
};

export const analyticsApi = {
  getOverview: async () => {
    try {
      const res = await api.get('/analytics/overview');
      return res.data?.data || res.data;
    } catch (e) {
      console.warn('Backend analytics API unavailable, using local performance dataset:', e);
      return computeLocalStats(localDataset);
    }
  },

  getDistributions: async () => {
    try {
      const res = await api.get('/analytics/distributions');
      return res.data?.data || res.data;
    } catch (e) {
      console.warn('Backend analytics API unavailable, calculating local distributions:', e);
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

      localDataset.forEach(row => {
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
    }
  },

  getComparisons: async () => {
    try {
      const res = await api.get('/analytics/comparisons');
      return res.data?.data || res.data;
    } catch (e) {
      console.warn('Backend analytics API unavailable, calculating local comparisons:', e);
      const groupStats = (key) => {
        const groups = {};
        localDataset.forEach(row => {
          const val = row[key] || 'Other';
          if (!groups[val]) {
            groups[val] = { name: val, count: 0, mathSum: 0, readingSum: 0, writingSum: 0, totalSum: 0, passCount: 0 };
          }
          groups[val].count++;
          groups[val].mathSum += row.mathScore;
          groups[val].readingSum += row.readingScore;
          groups[val].writingSum += row.writingScore;
          groups[val].totalSum += row.totalScore;
          if (row.averageScore >= 60) groups[val].passCount++;
        });

        return Object.values(groups).map(g => ({
          name: g.name,
          count: g.count,
          mathAvg: Math.round((g.mathSum / g.count) * 10) / 10,
          readingAvg: Math.round((g.readingSum / g.count) * 10) / 10,
          writingAvg: Math.round((g.writingSum / g.count) * 10) / 10,
          totalAvg: Math.round((g.totalSum / g.count) * 10) / 10,
          passRate: Math.round((g.passCount / g.count) * 1000) / 10
        }));
      };

      const parentalEdu = groupStats('parentalEducation');
      const eduOrder = ["some high school", "high school", "some college", "associate's degree", "bachelor's degree", "master's degree"];
      parentalEdu.sort((a, b) => eduOrder.indexOf(a.name) - eduOrder.indexOf(b.name));

      return {
        genderComparison: groupStats('gender'),
        testPrepComparison: groupStats('testPrep'),
        lunchComparison: groupStats('lunch'),
        parentalEduComparison: parentalEdu,
        ethnicityComparison: groupStats('raceEthnicity')
      };
    }
  },

  getAllRecords: async () => {
    try {
      const res = await api.get('/analytics/all-records');
      return res.data?.data || res.data || localDataset;
    } catch (e) {
      return localDataset;
    }
  },

  getLocalDataset: () => localDataset
};
