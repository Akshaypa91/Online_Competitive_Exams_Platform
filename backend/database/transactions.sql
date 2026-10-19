-- ==============================================================================
-- ONLINE COMPETITIVE EXAMS PLATFORM
-- DATABASE TRANSACTIONS DEMONSTRATION SCRIPT
-- ==============================================================================
-- DBMS Concept: Transactions and Concurrency Control (ACID Properties)
-- - Atomicity: All operations in a transaction succeed, or none take effect.
-- - Consistency: Database transitions from one valid state to another.
-- - Isolation: Concurrent transactions execute without interfering with each other.
-- - Durability: Once committed, changes survive system crashes or restarts.
-- ==============================================================================

USE online_exam_system;

-- ------------------------------------------------------------------------------
-- TRANSACTION 1: ATOMIC EXAM SUBMISSION & RESULT GENERATION
-- ------------------------------------------------------------------------------
-- Scenario:
-- When a student submits an exam attempt, two critical updates must occur atomically:
-- 1. The attempt row must be marked as 'SUBMITTED' with the final calculated score.
-- 2. A corresponding record must be generated in the 'result' table.
-- If the result insert fails (e.g., due to constraint violation or server failure),
-- the attempt status MUST NOT stay 'SUBMITTED'. Both must roll back together.

-- 1A. Successful Submission Workflow (COMMIT)
START TRANSACTION;

-- Step 1: Pessimistic Row Lock (FOR UPDATE)
-- Locks the attempt row so no concurrent request can submit or alter it simultaneously.
SELECT attempt_id, student_id, exam_id, status 
FROM attempt 
WHERE attempt_id = 1 AND student_id = 1 
FOR UPDATE;

-- Step 2: Compute student's score by evaluating submitted answers against correct options
SET @calculated_score = (
    SELECT COALESCE(SUM(q.marks), 0)
    FROM answer a
    JOIN question q ON a.question_id = q.question_id
    JOIN question_option qo ON a.option_id = qo.option_id
    WHERE a.attempt_id = 1 AND qo.is_correct = 1
);

SET @total_marks = (
    SELECT total_marks FROM exam WHERE exam_id = (SELECT exam_id FROM attempt WHERE attempt_id = 1)
);

SET @percentage = ROUND((@calculated_score / @total_marks) * 100, 2);
SET @result_status = IF(@percentage >= 50.00, 'PASS', 'FAIL');

-- Step 3: Update attempt status and final score
UPDATE attempt 
SET status = 'SUBMITTED',
    score = @calculated_score,
    submitted_at = NOW()
WHERE attempt_id = 1;

-- Step 4: Insert the evaluated result
INSERT INTO result (attempt_id, student_id, exam_id, score, percentage, result_status, generated_at)
VALUES (1, 1, 1, @calculated_score, @percentage, @result_status, NOW());

-- Step 5: Commit changes permanently
COMMIT;


-- 1B. Submission Failure & Abort Workflow (ROLLBACK)
-- If the attempt has already been submitted or expired, the transaction is safely rolled back.
START TRANSACTION;

-- Check attempt status with lock
SELECT attempt_id, status 
FROM attempt 
WHERE attempt_id = 1 
FOR UPDATE;

-- Simulate detection of already submitted or invalid attempt:
-- If status != 'IN_PROGRESS', undo all acquired locks and operations.
ROLLBACK;


-- ------------------------------------------------------------------------------
-- TRANSACTION 2: EXAM REGISTRATION WITH AUDIT LOGGING
-- ------------------------------------------------------------------------------
-- Scenario:
-- A student registers for a scheduled competitive exam.
-- We must verify exam existence, register the student, and write an immutable audit log.
-- If any part fails, neither the registration nor the audit entry is saved.

START TRANSACTION;

-- Step 1: Verify and lock the exam record to ensure it is active
SELECT exam_id, exam_name, start_time, end_time 
FROM exam 
WHERE exam_id = 1 
FOR UPDATE;

-- Step 2: Insert exam registration (prevented by unique constraint if already registered)
INSERT INTO exam_registration (student_id, exam_id, registered_at, registration_status)
VALUES (2, 1, NOW(), 'REGISTERED')
ON DUPLICATE KEY UPDATE 
    registration_status = 'REGISTERED',
    registered_at = NOW();

-- Step 3: Create an audit log entry for compliance and tracking
INSERT INTO audit_log (actor_role, actor_id, action, entity_name, entity_id, details, created_at)
VALUES (
    'STUDENT', 
    2, 
    'REGISTER_FOR_EXAM', 
    'exam', 
    1, 
    JSON_OBJECT('exam_name', (SELECT exam_name FROM exam WHERE exam_id = 1)),
    NOW()
);

-- Step 4: Commit transaction
COMMIT;


-- ------------------------------------------------------------------------------
-- TRANSACTION 3: EXAM CREATION WITH SAVEPOINTS (PARTIAL ROLLBACK)
-- ------------------------------------------------------------------------------
-- Scenario:
-- An administrator creates an exam along with questions and options.
-- If a second optional question fails validation, the system rolls back to the
-- SAVEPOINT without losing the primary exam and first question.

START TRANSACTION;

-- Step 1: Insert new exam
INSERT INTO exam (admin_id, topic_id, exam_name, description, duration, total_marks, start_time, end_time)
VALUES (1, 1, 'Database Systems Milestone Exam', 'Advanced SQL & Transactions', 60, 50, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));

SET @new_exam_id = LAST_INSERT_ID();

-- Step 2: Insert Question 1
INSERT INTO question (exam_id, question_text, question_type, marks)
VALUES (@new_exam_id, 'Which property ensures that all or none of a transaction executes?', 'MCQ', 10);

SET @q1_id = LAST_INSERT_ID();

INSERT INTO question_option (question_id, option_text, is_correct) VALUES
(@q1_id, 'Atomicity', 1),
(@q1_id, 'Consistency', 0),
(@q1_id, 'Isolation', 0),
(@q1_id, 'Durability', 0);

-- Establish Savepoint after Question 1 successfully created
SAVEPOINT question_1_created;

-- Step 3: Attempt Question 2
INSERT INTO question (exam_id, question_text, question_type, marks)
VALUES (@new_exam_id, 'Temporary draft question with syntax/data error', 'MCQ', 10);

-- Simulating validation error for Question 2 -> Roll back only to the savepoint
ROLLBACK TO SAVEPOINT question_1_created;

-- Step 4: Commit the exam with Question 1 intact
COMMIT;


-- ------------------------------------------------------------------------------
-- TRANSACTION 4: CONCURRENCY CONTROL & ROW LOCKING (FOR UPDATE)
-- ------------------------------------------------------------------------------
-- Scenario:
-- Two concurrent student client requests attempt to submit answers or start an attempt
-- at the exact same millisecond. Using 'SELECT ... FOR UPDATE' provides mutual exclusion.

-- Session 1 (Locking the attempt):
START TRANSACTION;
SELECT * FROM attempt WHERE attempt_id = 1 FOR UPDATE;
-- Any other session trying to run 'SELECT ... FOR UPDATE' on attempt_id = 1 
-- will be forced to wait until Session 1 issues COMMIT or ROLLBACK.
COMMIT;


-- ------------------------------------------------------------------------------
-- TRANSACTION 5: ISOLATION LEVELS DEMONSTRATION
-- ------------------------------------------------------------------------------
-- SQL defines four transaction isolation levels to balance concurrency vs consistency:
-- 1. READ UNCOMMITTED (allows dirty reads)
-- 2. READ COMMITTED   (prevents dirty reads, allows non-repeatable reads)
-- 3. REPEATABLE READ  (MySQL default, prevents dirty & non-repeatable reads)
-- 4. SERIALIZABLE     (prevents dirty, non-repeatable, and phantom reads)

-- Example 5A: Setting READ COMMITTED for fast reporting / leaderboard views
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;

SELECT e.exam_name, s.name AS student_name, a.score
FROM attempt a
JOIN student s ON s.student_id = a.student_id
JOIN exam e ON e.exam_id = a.exam_id
WHERE a.status = 'SUBMITTED'
ORDER BY a.score DESC;

COMMIT;

-- Example 5B: Setting REPEATABLE READ (Default in InnoDB) for consistent analytical queries
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
START TRANSACTION;

SELECT COUNT(*) AS total_students_started FROM attempt WHERE exam_id = 1;
-- Even if other concurrent transactions insert new attempts, this session sees a consistent snapshot.
SELECT AVG(score) AS current_avg FROM attempt WHERE exam_id = 1 AND status = 'SUBMITTED';

COMMIT;

-- Example 5C: Setting SERIALIZABLE for highest safety in exam evaluation
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
START TRANSACTION;

SELECT exam_id, COUNT(*) FROM attempt WHERE status = 'SUBMITTED' GROUP BY exam_id;

COMMIT;
