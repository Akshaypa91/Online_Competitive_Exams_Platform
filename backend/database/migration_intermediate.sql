-- Intermediate-level extension for Online Competitive Exams Platform
-- Run AFTER schema.sql and seed.sql. Safe to re-run on MySQL 8.0+.
USE online_exam_system;

CREATE TABLE IF NOT EXISTS exam_registration (
    registration_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    registration_status ENUM('REGISTERED','CANCELLED') NOT NULL DEFAULT 'REGISTERED',
    UNIQUE KEY uq_registration_student_exam (student_id, exam_id),
    KEY idx_registration_exam_status (exam_id, registration_status),
    CONSTRAINT fk_registration_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_registration_exam FOREIGN KEY (exam_id) REFERENCES exam(exam_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(160) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    notification_type ENUM('EXAM','RESULT','SYSTEM') NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_notification_student_read (student_id, is_read, created_at),
    CONSTRAINT fk_notification_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_log (
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_role ENUM('STUDENT','ADMIN','SYSTEM') NOT NULL DEFAULT 'SYSTEM',
    actor_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id BIGINT NULL,
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_audit_entity (entity_name, entity_id),
    KEY idx_audit_actor_date (actor_role, actor_id, created_at)
);

-- Supporting indexes for frequent joins, filters, and leaderboard queries.
CREATE INDEX idx_exam_schedule ON exam(start_time, end_time);
CREATE INDEX idx_question_exam ON question(exam_id);
CREATE INDEX idx_option_question ON question_option(question_id);
CREATE INDEX idx_attempt_exam_status_score ON attempt(exam_id, status, score);
CREATE INDEX idx_result_student_date ON result(student_id, generated_at);
