const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const errorMiddleware = require('./middleware/errorMiddleware');
const pool = require('./config/db');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/topics', require('./routes/topicRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/student/attempts', require('./routes/attemptRoutes'));
app.use('/api/student/attempts', require('./routes/answerRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/ranking', require('./routes/rankingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
app.get('/api/health', async (req, res, next) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({
            success: true,
            message: 'Server is healthy',
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server is healthy but database is disconnected',
            database: 'disconnected',
            error: error.message
        });
    }
});

// 404 Route
app.use((req, res, next) => {
    const err = new Error('Route not found');
    err.statusCode = 404;
    next(err);
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
