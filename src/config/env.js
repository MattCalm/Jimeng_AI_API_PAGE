const REQUIRED_ENV_KEYS = [
  'VOLC_ACCESS_KEY',
  'VOLC_SECRET_KEY',
  'APP_PASSWORD'
];

function validateEnv() {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`缺少必要环境变量: ${missing.join(', ')}`);
  }
}

module.exports = {
  validateEnv
};
