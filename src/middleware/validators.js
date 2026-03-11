const ALLOWED_RATIOS = ['1:1', '4:3', '3:2', '16:9', '21:9'];
const ALLOWED_RESOLUTIONS = ['1K', '2K', '4K'];

function validateLogin(req, res, next) {
  const { password } = req.body || {};
  if (typeof password !== 'string' || password.trim().length < 1 || password.length > 200) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_LOGIN_BODY',
        message: '请求格式错误，请检查密码。'
      }
    });
  }

  return next();
}

function validateGenerateBody(req, res, next) {
  const { prompt, ratio, resolution } = req.body || {};

  if (typeof prompt !== 'string') {
    return badRequest(res, 'INVALID_PROMPT', '提示词格式错误。');
  }

  const promptTrimmed = prompt.trim();
  if (promptTrimmed.length < 1 || promptTrimmed.length > 1000) {
    return badRequest(res, 'INVALID_PROMPT_LENGTH', '提示词长度需在 1 到 1000 字符之间。');
  }

  if (!ALLOWED_RATIOS.includes(ratio)) {
    return badRequest(res, 'INVALID_RATIO', '不支持的画面比例。');
  }

  if (!ALLOWED_RESOLUTIONS.includes(resolution)) {
    return badRequest(res, 'INVALID_RESOLUTION', '不支持的分辨率。');
  }

  req.validatedInput = {
    prompt: promptTrimmed,
    ratio,
    resolution
  };

  return next();
}

function badRequest(res, code, message) {
  return res.status(400).json({
    success: false,
    error: {
      code,
      message
    }
  });
}

module.exports = {
  validateLogin,
  validateGenerateBody,
  ALLOWED_RATIOS,
  ALLOWED_RESOLUTIONS
};
