const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: '请求过于频繁，请稍后重试。'
    }
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'LOGIN_RATE_LIMITED',
      message: '登录尝试过于频繁，请 15 分钟后再试。'
    }
  }
});

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'GENERATE_RATE_LIMITED',
      message: '生成请求过于频繁，请稍后再试。'
    }
  }
});

module.exports = {
  generalLimiter,
  loginLimiter,
  generateLimiter
};
