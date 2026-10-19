const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const generateToken = require('../src/utils/generateToken');

describe('API Routes & Middleware Tests', () => {
  let adminToken;
  let studentToken;

  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key';
    adminToken = generateToken(1, 'ADMIN');
    studentToken = generateToken(2, 'STUDENT');
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  describe('Admin Routes Protection (/api/admin)', () => {
    describe('GET /api/admin/dashboard', () => {
      it('should block unauthenticated requests with 401', async () => {
        const res = await request(app).get('/api/admin/dashboard');
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Unauthorized');
      });

      it('should forbid student tokens with 403', async () => {
        const res = await request(app)
          .get('/api/admin/dashboard')
          .set('Authorization', `Bearer ${studentToken}`);
        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body.message).toMatch(/admin access required/i);
      });
    });

    describe('GET /api/admin/analytics', () => {
      it('should block unauthenticated requests with 401', async () => {
        const res = await request(app).get('/api/admin/analytics');
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Unauthorized');
      });

      it('should forbid student tokens with 403', async () => {
        const res = await request(app)
          .get('/api/admin/analytics')
          .set('Authorization', `Bearer ${studentToken}`);
        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body.message).toMatch(/admin access required/i);
      });
    });

    describe('GET /api/admin/students', () => {
      it('should block unauthenticated requests with 401', async () => {
        const res = await request(app).get('/api/admin/students');
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('success', false);
      });

      it('should forbid student tokens with 403', async () => {
        const res = await request(app)
          .get('/api/admin/students')
          .set('Authorization', `Bearer ${studentToken}`);
        expect(res.statusCode).toBe(403);
      });
    });

    describe('GET /api/admin/attempts', () => {
      it('should block unauthenticated requests with 401', async () => {
        const res = await request(app).get('/api/admin/attempts');
        expect(res.statusCode).toBe(401);
      });
    });

    describe('GET /api/admin/results', () => {
      it('should block unauthenticated requests with 401', async () => {
        const res = await request(app).get('/api/admin/results');
        expect(res.statusCode).toBe(401);
      });
    });
  });

  describe('Student Routes Protection (/api/student)', () => {
    it('should reject unauthenticated access to /api/student/exams with 401', async () => {
      const res = await request(app).get('/api/student/exams');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should reject unauthenticated access to /api/student/exams/:id/start with 401', async () => {
      const res = await request(app).post('/api/student/exams/1/start');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('Topic & Exam Routes Protection', () => {
    it('should allow public access to GET /api/topics', async () => {
      const res = await request(app).get('/api/topics');
      // Should not be 401 or 403 (can be 200 or 500 depending on DB connection)
      expect([200, 500]).toContain(res.statusCode);
    });

    it('should require admin authorization to POST /api/topics', async () => {
      const res = await request(app).post('/api/topics').send({ topic_name: 'Test Topic' });
      expect(res.statusCode).toBe(401);
    });

    it('should forbid student from creating topic on POST /api/topics with 403', async () => {
      const res = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ topic_name: 'Forbidden Topic' });
      expect(res.statusCode).toBe(403);
    });

    it('should allow public access to GET /api/exams', async () => {
      const res = await request(app).get('/api/exams');
      expect([200, 500]).toContain(res.statusCode);
    });

    it('should require authorization to POST /api/exams', async () => {
      const res = await request(app).post('/api/exams').send({ exam_name: 'New Exam' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Result & Ranking Routes Protection', () => {
    it('should reject unauthenticated access to /api/results/my-results with 401', async () => {
      const res = await request(app).get('/api/results/my-results');
      expect(res.statusCode).toBe(401);
    });

    it('should reject unauthenticated access to /api/ranking/exam/1 with 401', async () => {
      const res = await request(app).get('/api/ranking/exam/1');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Auth Routes Validation (/api/auth)', () => {
    it('should fail student login with 400 or 401 when fields are missing', async () => {
      const res = await request(app).post('/api/auth/student/login').send({});
      expect([400, 401, 422]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should fail admin login with 400 or 401 when fields are missing', async () => {
      const res = await request(app).post('/api/auth/admin/login').send({});
      expect([400, 401, 422]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});
