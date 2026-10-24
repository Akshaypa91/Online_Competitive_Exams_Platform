const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passwordResetController = require('../controllers/passwordResetController');

router.post('/student/register', authController.studentRegister);
router.post('/student/login', authController.studentLogin);
router.post('/admin/login', authController.adminLogin);
router.post('/student/forgot-password', passwordResetController.requestStudentPasswordReset);
router.post('/student/reset-password', passwordResetController.resetStudentPassword);
module.exports = router;
