const express = require('express');
const { validateLogin } = require('../middleware/validators');
const { loginLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/login', loginLimiter, validateLogin, (req, res) => {
  const { password } = req.body;

  if (password !== process.env.APP_PASSWORD) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_PASSWORD',
        message: '密码错误，请重试。'
      }
    });
  }

  req.session.isAuthed = true;

  return res.json({
    success: true,
    message: '登录成功。'
  });
});

router.get('/me', (req, res) => {
  return res.json({
    success: true,
    authenticated: Boolean(req.session?.isAuthed)
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('jimeng.sid');
    res.json({
      success: true,
      message: '已退出登录。'
    });
  });
});

module.exports = router;
