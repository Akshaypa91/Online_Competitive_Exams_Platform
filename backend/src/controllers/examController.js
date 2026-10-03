const pool = require('../config/db');

exports.createExam = async (req, res, next) => {
    try {
        const { topic_id, exam_name, description, duration, total_marks, start_time, end_time } = req.body;
        const admin_id = req.user.id;

        if (!topic_id || !exam_name || !duration || !total_marks || !start_time || !end_time) {
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }

        const [result] = await pool.query(
            'INSERT INTO exam (admin_id, topic_id, exam_name, description, duration, total_marks, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [admin_id, topic_id, exam_name, description || null, duration, total_marks, start_time, end_time]
        );

        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            data: { exam_id: result.insertId }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllExams = async (req, res, next) => {
    try {
        let query = 'SELECT * FROM exam';
        let params = [];

        if (req.query.topic_id) {
            query += ' WHERE topic_id = ?';
            params.push(req.query.topic_id);
        }

        if (req.query.search) {
            if (params.length > 0) {
                query += ' AND exam_name LIKE ?';
            } else {
                query += ' WHERE exam_name LIKE ?';
            }
            params.push(`%${req.query.search}%`);
        }

        const [exams] = await pool.query(query, params);
        res.status(200).json({ success: true, data: exams });
    } catch (error) {
        next(error);
    }
};

exports.getExamById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [exams] = await pool.query('SELECT * FROM exam WHERE exam_id = ?', [id]);
        
        if (exams.length === 0) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        const exam = exams[0];
        
        // Fetch questions for this exam
        const [questions] = await pool.query('SELECT * FROM question WHERE exam_id = ?', [id]);
        
        for (let q of questions) {
            const [options] = await pool.query('SELECT * FROM question_option WHERE question_id = ?', [q.question_id]);
            
            // If requested by student, remove is_correct
            if (req.user && req.user.role === 'STUDENT') {
                q.options = options.map(opt => ({
                    option_id: opt.option_id,
                    question_id: opt.question_id,
                    option_text: opt.option_text
                }));
            } else {
                q.options = options;
            }
        }
        
        exam.questions = questions;

        res.status(200).json({ success: true, data: exam });
    } catch (error) {
        next(error);
    }
};

exports.updateExam = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { topic_id, exam_name, description, duration, total_marks, start_time, end_time } = req.body;

        const [result] = await pool.query(
            'UPDATE exam SET topic_id = ?, exam_name = ?, description = ?, duration = ?, total_marks = ?, start_time = ?, end_time = ? WHERE exam_id = ?',
            [topic_id, exam_name, description, duration, total_marks, start_time, end_time, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        res.status(200).json({ success: true, message: 'Exam updated successfully' });
    } catch (error) {
        next(error);
    }
};

exports.deleteExam = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM exam WHERE exam_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        res.status(200).json({ success: true, message: 'Exam deleted successfully' });
    } catch (error) {
        next(error);
    }
};
