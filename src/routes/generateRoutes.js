const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { validateGenerateBody } = require('../middleware/validators');
const { generateLimiter } = require('../middleware/rateLimit');
const { generateImage, JimengApiError } = require('../services/jimengService');

const router = express.Router();

router.post('/generate', requireAuth, generateLimiter, validateGenerateBody, async (req, res) => {
  try {
    const result = await generateImage(req.validatedInput);
    return res.json({
      success: true,
      taskStatus: '已完成',
      taskId: result.taskId,
      images: result.imageUrls
    });
  } catch (error) {
    if (error instanceof JimengApiError) {
      return res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: toFriendlyMessage(error)
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务暂时不可用，请稍后重试。'
      }
    });
  }
});

function toFriendlyMessage(error) {
  const msg = String(error.message || '');

  if (/risk|safety|sensitive|violat/i.test(msg)) {
    return '提示词可能触发内容安全策略，请调整后重试。';
  }
  if (/not[_\s-]?found|expired/i.test(msg) || error.code === 'TASK_FAILED') {
    return '任务不存在或已失效，请重新生成。';
  }
  if (error.code === 'POLLING_TIMEOUT') {
    return '生成等待超时，请稍后重试。';
  }

  return msg || '生成失败，请稍后重试。';
}

module.exports = router;
