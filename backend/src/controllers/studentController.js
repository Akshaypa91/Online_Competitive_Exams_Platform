const pool = require('../config/db');

exports.getAvailableExams = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        
        // Return exams where current time is between start_time and end_time
        // And the student has not attempted them yet
        const query = `
            SELECT e.* 
            FROM exam e
            LEFT JOIN attempt a ON e.exam_id = a.exam_id AND a.student_id = ?
            WHERE NOW() >= e.start_time 
              AND NOW() <= e.end_time
              AND a.attempt_id IS NULL
        `;
        
        const [exams] = await pool.query(query, [studentId]);
        
        res.status(200).json({ success: true, data: exams });
    } catch (error) {
        next(error);
    }
};

exports.startExam = async (req, res, next) => {
    try {
        const { examId } = req.params;
        const studentId = req.user.id;

        const [exams] = await pool.query('SELECT * FROM exam WHERE exam_id = ?', [examId]);
        
        if (exams.length === 0) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }
        
        const exam = exams[0];
        const currentTime = new Date();
        const startTime = new Date(exam.start_time);
        const endTime = new Date(exam.end_time);

        if (currentTime < startTime || currentTime > endTime) {
            return res.status(400).json({ success: false, message: 'Exam is not active at this time' });
        }

        // Check if student already attempted
        const [attempts] = await pool.query('SELECT * FROM attempt WHERE student_id = ? AND exam_id = ?', [studentId, examId]);
        
        if (attempts.length > 0) {
            return res.status(409).json({ success: false, message: 'You have already attempted this exam' });
        }

        // Create attempt
        const [result] = await pool.query(
            'INSERT INTO attempt (student_id, exam_id, status, started_at) VALUES (?, ?, ?, NOW())',
            [studentId, examId, 'IN_PROGRESS']
        );

        const attemptId = result.insertId;

        // Fetch questions and options (without is_correct)
        const [questions] = await pool.query('SELECT * FROM question WHERE exam_id = ?', [examId]);
        
        for (let q of questions) {
            const [options] = await pool.query('SELECT option_id, question_id, option_text FROM question_option WHERE question_id = ?', [q.question_id]);
            q.options = options;
        }

        exam.questions = questions;

        res.status(201).json({
            success: true,
            data: {
                attempt_id: attemptId,
                exam
            }
        });
    } catch (error) {
        next(error);
    }
};
