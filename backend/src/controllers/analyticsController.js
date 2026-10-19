const pool = require('../config/db');

exports.getAnalytics = async (req, res, next) => {
  try {
    const [[overview]] = await pool.query(`
      SELECT (SELECT COUNT(*) FROM student) AS students,
             (SELECT COUNT(*) FROM exam) AS exams,
             (SELECT COUNT(*) FROM question) AS questions,
             (SELECT COUNT(*) FROM attempt) AS attempts,
             (SELECT COUNT(*) FROM attempt WHERE status = 'SUBMITTED') AS submitted_attempts,
             (SELECT COUNT(*) FROM result) AS published_results`);

    const [examPerformance] = await pool.query(`
      SELECT e.exam_id, e.exam_name, e.total_marks,
             COUNT(a.attempt_id) AS attempts,
             SUM(a.status = 'SUBMITTED') AS submitted,
             ROUND(AVG(CASE WHEN a.status = 'SUBMITTED' THEN a.score END), 2) AS average_score,
             MAX(CASE WHEN a.status = 'SUBMITTED' THEN a.score END) AS highest_score
      FROM exam e LEFT JOIN attempt a ON a.exam_id = e.exam_id
      GROUP BY e.exam_id, e.exam_name, e.total_marks
      ORDER BY attempts DESC, e.exam_name`);

    const [topicSummary] = await pool.query(`
      SELECT t.topic_id, t.topic_name, COUNT(DISTINCT e.exam_id) AS exams,
             COUNT(DISTINCT q.question_id) AS questions
      FROM topic t LEFT JOIN exam e ON e.topic_id = t.topic_id
      LEFT JOIN question q ON q.exam_id = e.exam_id
      GROUP BY t.topic_id, t.topic_name ORDER BY exams DESC, t.topic_name`);

    res.json({ success: true, data: { overview, examPerformance, topicSummary } });
  } catch (error) { next(error); }
};
