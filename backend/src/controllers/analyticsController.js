const fs = require('fs');
const path = require('path');

// Cache parsed data in memory for optimal performance
let cachedRecords = null;

const loadDataset = () => {
    if (cachedRecords) return cachedRecords;

    const jsonPath = path.resolve(__dirname, '../data/studentsPerformanceData.json');
    const csvPath = path.resolve(__dirname, '../../../StudentsPerformance_Clean.csv');

    if (fs.existsSync(jsonPath)) {
        try {
            const raw = fs.readFileSync(jsonPath, 'utf8');
            cachedRecords = JSON.parse(raw);
            return cachedRecords;
        } catch (e) {
            console.error('Error loading JSON dataset, falling back to CSV:', e);
        }
    }

    if (fs.existsSync(csvPath)) {
        try {
            const content = fs.readFileSync(csvPath, 'utf8');
            const lines = content.trim().split(/\r?\n/);
            const headers = lines[0].split(',').map(h => h.trim());
            
            cachedRecords = lines.slice(1).map(line => {
                const values = line.split(',');
                return {
                    gender: values[0]?.trim(),
                    raceEthnicity: values[1]?.trim(),
                    parentalEducation: values[2]?.trim(),
                    lunch: values[3]?.trim(),
                    testPrep: values[4]?.trim(),
                    mathScore: parseInt(values[5], 10) || 0,
                    readingScore: parseInt(values[6], 10) || 0,
                    writingScore: parseInt(values[7], 10) || 0,
                    averageScore: parseFloat(values[8]) || 0,
                    totalScore: parseInt(values[9], 10) || 0,
                    performanceBand: values[10]?.trim() || 'Developing'
                };
            });
            return cachedRecords;
        } catch (err) {
            console.error('Error parsing CSV dataset:', err);
        }
    }

    return [];
};

const calculateFiveNumberSummary = (numbers) => {
    if (!numbers || numbers.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0 };
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = sorted.length;
    const min = sorted[0];
    const max = sorted[n - 1];
    const q1 = sorted[Math.floor(n * 0.25)];
    const median = sorted[Math.floor(n * 0.5)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const mean = Math.round((sum / n) * 100) / 100;

    return { min, q1, median, q3, max, mean, count: n };
};

const calculatePearsonCorrelation = (xArr, yArr) => {
    const n = Math.min(xArr.length, yArr.length);
    if (n === 0) return 0;

    const meanX = xArr.reduce((a, b) => a + b, 0) / n;
    const meanY = yArr.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
        const dx = xArr[i] - meanX;
        const dy = yArr[i] - meanY;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
    }

    const den = Math.sqrt(denX * denY);
    if (den === 0) return 0;
    return Math.round((num / den) * 1000) / 1000;
};

// GET /api/analytics/overview
exports.getOverview = (req, res) => {
    try {
        const records = loadDataset();
        if (!records.length) {
            return res.status(404).json({ success: false, message: 'Dataset not available' });
        }

        const mathStats = calculateFiveNumberSummary(records.map(r => r.mathScore));
        const readingStats = calculateFiveNumberSummary(records.map(r => r.readingScore));
        const writingStats = calculateFiveNumberSummary(records.map(r => r.writingScore));
        const totalStats = calculateFiveNumberSummary(records.map(r => r.totalScore));
        const avgStats = calculateFiveNumberSummary(records.map(r => r.averageScore));

        // Performance bands breakdown
        const bandsCount = {};
        records.forEach(r => {
            const b = r.performanceBand || 'Unknown';
            bandsCount[b] = (bandsCount[b] || 0) + 1;
        });

        // Test prep split
        const testPrepSplit = { completed: 0, none: 0 };
        records.forEach(r => {
            if (r.testPrep === 'completed') testPrepSplit.completed++;
            else testPrepSplit.none++;
        });

        // Gender split
        const genderSplit = { female: 0, male: 0 };
        records.forEach(r => {
            if (r.gender === 'female') genderSplit.female++;
            else if (r.gender === 'male') genderSplit.male++;
        });

        // Passing threshold (averageScore >= 60)
        const passingCount = records.filter(r => r.averageScore >= 60).length;
        const passRate = Math.round((passingCount / records.length) * 1000) / 10;

        res.status(200).json({
            success: true,
            data: {
                totalStudents: records.length,
                passRate,
                mathStats,
                readingStats,
                writingStats,
                totalStats,
                avgStats,
                bandsCount,
                genderSplit,
                testPrepSplit
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/analytics/distributions
exports.getDistributions = (req, res) => {
    try {
        const records = loadDataset();
        const bins = [
            { label: '0-9', min: 0, max: 9 },
            { label: '10-19', min: 10, max: 19 },
            { label: '20-29', min: 20, max: 29 },
            { label: '30-39', min: 30, max: 39 },
            { label: '40-49', min: 40, max: 49 },
            { label: '50-59', min: 50, max: 59 },
            { label: '60-69', min: 60, max: 69 },
            { label: '70-79', min: 70, max: 79 },
            { label: '80-89', min: 80, max: 89 },
            { label: '90-100', min: 90, max: 100 }
        ];

        const mathBins = bins.map(b => ({ ...b, count: 0 }));
        const readingBins = bins.map(b => ({ ...b, count: 0 }));
        const writingBins = bins.map(b => ({ ...b, count: 0 }));
        const averageBins = bins.map(b => ({ ...b, count: 0 }));

        records.forEach(r => {
            const populate = (score, list) => {
                const item = list.find(b => score >= b.min && score <= b.max);
                if (item) item.count++;
            };
            populate(r.mathScore, mathBins);
            populate(r.readingScore, readingBins);
            populate(r.writingScore, writingBins);
            populate(Math.round(r.averageScore), averageBins);
        });

        res.status(200).json({
            success: true,
            data: {
                mathBins,
                readingBins,
                writingBins,
                averageBins
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/analytics/comparisons
exports.getComparisons = (req, res) => {
    try {
        const records = loadDataset();

        const groupStats = (groupKey) => {
            const groups = {};
            records.forEach(r => {
                const key = r[groupKey] || 'Other';
                if (!groups[key]) {
                    groups[key] = {
                        name: key,
                        count: 0,
                        mathSum: 0,
                        readingSum: 0,
                        writingSum: 0,
                        totalSum: 0,
                        passCount: 0
                    };
                }
                groups[key].count++;
                groups[key].mathSum += r.mathScore;
                groups[key].readingSum += r.readingScore;
                groups[key].writingSum += r.writingScore;
                groups[key].totalSum += r.totalScore;
                if (r.averageScore >= 60) groups[key].passCount++;
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

        const genderComparison = groupStats('gender');
        const testPrepComparison = groupStats('testPrep');
        const lunchComparison = groupStats('lunch');
        const parentalEduComparison = groupStats('parentalEducation');
        const ethnicityComparison = groupStats('raceEthnicity');

        // Education rank order sort for logical plotting
        const eduOrder = ["some high school", "high school", "some college", "associate's degree", "bachelor's degree", "master's degree"];
        parentalEduComparison.sort((a, b) => eduOrder.indexOf(a.name) - eduOrder.indexOf(b.name));

        res.status(200).json({
            success: true,
            data: {
                genderComparison,
                testPrepComparison,
                lunchComparison,
                parentalEduComparison,
                ethnicityComparison
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/analytics/correlations
exports.getCorrelations = (req, res) => {
    try {
        const records = loadDataset();
        const mathScores = records.map(r => r.mathScore);
        const readingScores = records.map(r => r.readingScore);
        const writingScores = records.map(r => r.writingScore);

        const mathVsReading = calculatePearsonCorrelation(mathScores, readingScores);
        const readingVsWriting = calculatePearsonCorrelation(readingScores, writingScores);
        const mathVsWriting = calculatePearsonCorrelation(mathScores, writingScores);

        // Subsample 150 representative points for high-performance frontend rendering
        const step = Math.max(1, Math.floor(records.length / 150));
        const samplePoints = [];
        for (let i = 0; i < records.length; i += step) {
            samplePoints.push(records[i]);
        }

        res.status(200).json({
            success: true,
            data: {
                coefficients: {
                    mathVsReading,
                    readingVsWriting,
                    mathVsWriting
                },
                samplePoints
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/analytics/all-records
exports.getAllRecords = (req, res) => {
    try {
        const records = loadDataset();
        res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
