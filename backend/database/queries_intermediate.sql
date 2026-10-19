USE online_exam_system;

-- 1. Registrations per exam, including exams with zero registrations.
SELECT e.exam_id, e.exam_name, COUNT(er.registration_id) AS registrations
FROM exam e LEFT JOIN exam_registration er
  ON er.exam_id = e.exam_id AND er.registration_status = 'REGISTERED'
GROUP BY e.exam_id, e.exam_name ORDER BY registrations DESC;

-- 2. Students who registered but have not started an attempt.
SELECT s.student_id, s.name, s.email, e.exam_name, er.registered_at
FROM exam_registration er
JOIN student s ON s.student_id = er.student_id
JOIN exam e ON e.exam_id = er.exam_id
LEFT JOIN attempt a ON a.student_id = er.student_id AND a.exam_id = er.exam_id
WHERE er.registration_status = 'REGISTERED' AND a.attempt_id IS NULL;

-- 3. Exam participation and completion rate.
SELECT e.exam_id, e.exam_name,
       COUNT(a.attempt_id) AS started,
       SUM(a.status = 'SUBMITTED') AS completed,
       ROUND(100 * SUM(a.status = 'SUBMITTED') / NULLIF(COUNT(a.attempt_id), 0), 2) AS completion_percent
FROM exam e LEFT JOIN attempt a ON a.exam_id = e.exam_id
GROUP BY e.exam_id, e.exam_name;

-- 4. Leaderboard with dense ranking (MySQL 8+).
SELECT e.exam_name, s.student_id, s.name, a.score,
       DENSE_RANK() OVER (PARTITION BY a.exam_id ORDER BY a.score DESC) AS leaderboard_rank
FROM attempt a JOIN student s ON s.student_id = a.student_id
JOIN exam e ON e.exam_id = a.exam_id
WHERE a.status = 'SUBMITTED';

-- 5. Topic-level question coverage.
SELECT t.topic_name, COUNT(DISTINCT e.exam_id) AS exam_count,
       COUNT(DISTINCT q.question_id) AS question_count,
       COALESCE(SUM(q.marks), 0) AS available_question_marks
FROM topic t LEFT JOIN exam e ON e.topic_id = t.topic_id
LEFT JOIN question q ON q.exam_id = e.exam_id
GROUP BY t.topic_id, t.topic_name;

-- 6. Audit history for exam-related actions.
SELECT audit_id, actor_role, actor_id, action, entity_name, entity_id, details, created_at
FROM audit_log WHERE entity_name = 'exam' ORDER BY created_at DESC;

-- 7. Find students with multiple high-scoring attempts (adjust threshold as needed).
SELECT s.student_id, s.name, COUNT(*) AS high_score_exams, AVG(r.percentage) AS avg_percentage
FROM result r JOIN student s ON s.student_id = r.student_id
WHERE r.percentage >= 75
GROUP BY s.student_id, s.name HAVING COUNT(*) >= 2
ORDER BY avg_percentage DESC;
