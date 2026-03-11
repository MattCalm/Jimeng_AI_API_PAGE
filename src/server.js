const path = require('path');
const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');

const { validateEnv } = require('./config/env');
const { generalLimiter } = require('./middleware/rateLimit');
const authRoutes = require('./routes/authRoutes');
const generateRoutes = require('./routes/generateRoutes');
const healthRoutes = require('./routes/healthRoutes');

dotenv.config();
validateEnv();

const app = express();

app.set('trust proxy', 1);
app.use(generalLimiter);
app.use(express.json({ limit: '200kb' }));
app.use(
  session({
    name: 'jimeng.sid',
    secret: process.env.SESSION_SECRET || 'dev_session_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000
    }
  })
);

app.use('/api', authRoutes);
app.use('/api', generateRoutes);
app.use('/api', healthRoutes);
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: '请求 JSON 格式错误。'
      }
    });
  }

  return next(err);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Jimeng app is running on port ${PORT}`);
});
