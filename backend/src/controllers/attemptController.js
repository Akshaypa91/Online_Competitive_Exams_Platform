const pool = require('../config/db');
const evaluationService = require('../services/evaluationService');

exports.submitExam = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const { attemptId } = req.params;
        const studentId = req.user.id;

        await connection.beginTransaction();

        // Verify attempt belongs to student
        const [attempts] = await connection.query('SELECT * FROM attempt WHERE attempt_id = ? AND student_id = ? FOR UPDATE', [attemptId, studentId]);
        
        if (attempts.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        const attempt = attempts[0];

        if (attempt.status !== 'IN_PROGRESS') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Attempt already submitted or expired' });
        }

        // Evaluate
        const evaluation = await evaluationService.evaluateAttempt(attemptId, connection);

        const resultStatus = evaluation.percentage >= 50 ? 'PASS' : 'FAIL'; // Assuming 50% passing

        // Update attempt
        await connection.query(
            'UPDATE attempt SET status = ?, submitted_at = NOW(), score = ? WHERE attempt_id = ?',
            ['SUBMITTED', evaluation.score, attemptId]
        );

        // Insert result
        await connection.query(
            'INSERT INTO result (attempt_id, student_id, exam_id, score, percentage, result_status, generated_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [attemptId, studentId, attempt.exam_id, evaluation.score, evaluation.percentage, resultStatus]
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Exam submitted successfully',
            data: {
                score: evaluation.score,
                total_marks: evaluation.totalMarks,
                percentage: evaluation.percentage.toFixed(2),
                result_status: resultStatus
            }
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};
