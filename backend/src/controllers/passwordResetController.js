const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('../config/db');

const TOKEN_TTL_MS = 15 * 60 * 1000;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3002').replace(/\/$/, '');

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function createMailer() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: SMTP_SECURE === 'true',
        auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
}

async function ensureResetTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INTEGER PRIMARY KEY AUTO_INCREMENT,
            student_id INTEGER NOT NULL,
            token_hash VARCHAR(64) NOT NULL UNIQUE,
            expires_at BIGINT NOT NULL,
            used_at BIGINT NULL,
            created_at BIGINT NOT NULL
        )
    `.replace('INTEGER PRIMARY KEY AUTO_INCREMENT', 'INTEGER PRIMARY KEY AUTO_INCREMENT'));
}

exports.requestStudentPasswordReset = async (req, res, next) => {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
        }

        const mailer = createMailer();
        if (!mailer) {
            return res.status(503).json({
                success: false,
                message: 'Password reset email is not configured. Please configure SMTP settings in backend/.env.'
            });
        }

        await ensureResetTable();
        const [students] = await pool.query(
            'SELECT student_id, name, email FROM student WHERE LOWER(email) = ?',
            [email]
        );

        // Always return the same public response for known and unknown addresses.
        if (students.length) {
            const student = students[0];
            const rawToken = crypto.randomBytes(32).toString('hex');
            const now = Date.now();
            await pool.query(
                'UPDATE password_reset_tokens SET used_at = ? WHERE student_id = ? AND used_at IS NULL',
                [now, student.student_id]
            );
            await pool.query(
                'INSERT INTO password_reset_tokens (student_id, token_hash, expires_at, used_at, created_at) VALUES (?, ?, ?, NULL, ?)',
                [student.student_id, hashToken(rawToken), now + TOKEN_TTL_MS, now]
            );

            const resetUrl = `${FRONTEND_URL}/reset-password?token=${rawToken}`;
            await mailer.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: student.email,
                subject: 'Reset your PrepMaster password',
                text: `Hi ${student.name},\n\nUse this link to reset your PrepMaster password. It expires in 15 minutes and can only be used once:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.\n`,
                html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a"><h2>Reset your password</h2><p>Hi ${String(student.name || 'there').replace(/[&<>"]/g, '')},</p><p>We received a request to reset your PrepMaster password.</p><p><a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Reset password</a></p><p>This link expires in 15 minutes and can only be used once.</p><p>If you did not request this, ignore this email.</p></div>`
            });
        }

        return res.status(200).json({
            success: true,
            message: 'If an account exists for that email, a password reset link will be sent shortly.'
        });
    } catch (error) {
        next(error);
    }
};

exports.resetStudentPassword = async (req, res, next) => {
    try {
        const token = String(req.body?.token || '');
        const password = String(req.body?.password || '');
        if (!/^[a-f0-9]{64}$/i.test(token)) {
            return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired. Request a new one.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must contain at least 8 characters.' });
        }

        await ensureResetTable();
        const [tokens] = await pool.query(
            'SELECT id, student_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ?',
            [hashToken(token)]
        );
        const reset = tokens[0];
        if (!reset || reset.used_at !== null && reset.used_at !== undefined || Number(reset?.expires_at) <= Date.now()) {
            return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired. Request a new one.' });
        }

        const hashedPassword = await bcryptHash(password);
        const now = Date.now();
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [freshRows] = await connection.query(
                'SELECT id, student_id, expires_at, used_at FROM password_reset_tokens WHERE id = ?',
                [reset.id]
            );
            const fresh = freshRows[0];
            if (!fresh || fresh.used_at !== null && fresh.used_at !== undefined || Number(fresh?.expires_at) <= now) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'This reset link has already been used or has expired.' });
            }
            await connection.query('UPDATE student SET password = ? WHERE student_id = ?', [hashedPassword, fresh.student_id]);
            await connection.query('UPDATE password_reset_tokens SET used_at = ? WHERE id = ?', [now, fresh.id]);
            await connection.query(
                'UPDATE password_reset_tokens SET used_at = ? WHERE student_id = ? AND id <> ? AND used_at IS NULL',
                [now, fresh.student_id, fresh.id]
            );
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        return res.status(200).json({ success: true, message: 'Password reset successfully. You can now sign in with your new password.' });
    } catch (error) {
        next(error);
    }
};

async function bcryptHash(password) {
    const bcrypt = require('bcryptjs');
    return bcrypt.hash(password, 10);
}
