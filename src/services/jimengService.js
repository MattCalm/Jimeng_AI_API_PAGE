const axios = require('axios');
const crypto = require('crypto');

const HOST = 'visual.volcengineapi.com';
const BASE_URL = `https://${HOST}`;
const REGION = 'cn-north-1';
const SERVICE = 'cv';
const VERSION = '2022-08-31';
const REQ_KEY = 'jimeng_t2i_v40';

const SIZE_PRESETS = {
  '1:1': { '1K': [1024, 1024], '2K': [2048, 2048], '4K': [4096, 4096] },
  '4:3': { '1K': [1152, 864], '2K': [2304, 1728], '4K': [4694, 3520] },
  '3:2': { '1K': [1248, 832], '2K': [2496, 1664], '4K': [4992, 3328] },
  '16:9': { '1K': [1280, 720], '2K': [2560, 1440], '4K': [5404, 3040] },
  '21:9': { '1K': [1512, 648], '2K': [3024, 1296], '4K': [6198, 2656] }
};

function getImageSize(ratio, resolution) {
  const pair = SIZE_PRESETS?.[ratio]?.[resolution];
  if (!pair) {
    throw new Error('不支持的比例或分辨率。');
  }
  return { width: pair[0], height: pair[1] };
}

function hmac(key, content, encoding) {
  return crypto.createHmac('sha256', key).update(content, 'utf8').digest(encoding);
}

function sha256Hex(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function formatAmzDate(date = new Date()) {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8)
  };
}

function buildAuthorization({ method, queryString, payload, amzDate, dateStamp }) {
  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/request`;
  const signedHeaders = 'content-type;host;x-content-sha256;x-date';
  const payloadHash = sha256Hex(payload);

  const canonicalRequest = [
    method,
    '/',
    queryString,
    `content-type:application/json\nhost:${HOST}\nx-content-sha256:${payloadHash}\nx-date:${amzDate}\n`,
    signedHeaders,
    payloadHash
  ].join('\n');

  const canonicalRequestHash = sha256Hex(canonicalRequest);
  const stringToSign = ['HMAC-SHA256', amzDate, credentialScope, canonicalRequestHash].join('\n');

  const kDate = hmac(process.env.VOLC_SECRET_KEY, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  const kSigning = hmac(kService, 'request');
  const signature = hmac(kSigning, stringToSign, 'hex');

  const authorization = [
    `HMAC-SHA256 Credential=${process.env.VOLC_ACCESS_KEY}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`
  ].join(', ');

  return {
    authorization,
    payloadHash
  };
}

async function signedPost(action, body) {
  const params = new URLSearchParams({ Action: action, Version: VERSION });
  const queryString = params.toString();
  const payload = JSON.stringify(body);
  const { amzDate, dateStamp } = formatAmzDate();
  const { authorization, payloadHash } = buildAuthorization({
    method: 'POST',
    queryString,
    payload,
    amzDate,
    dateStamp
  });

  const url = `${BASE_URL}/?${queryString}`;
  const headers = {
    'Content-Type': 'application/json',
    Host: HOST,
    'X-Date': amzDate,
    'X-Content-Sha256': payloadHash,
    Authorization: authorization
  };

  const response = await axios.post(url, payload, {
    headers,
    timeout: 30_000
  });

  return response.data;
}

async function submitTask(prompt, ratio, resolution) {
  const { width, height } = getImageSize(ratio, resolution);

  const payload = {
    req_key: REQ_KEY,
    prompt,
    width,
    height,
    force_single: true,
    return_url: true
  };

  const data = await signedPost('CVSync2AsyncSubmitTask', payload);

  const taskId = data?.data?.task_id;
  if (!taskId) {
    const err = data?.message || '提交任务失败，请稍后重试。';
    throw new JimengApiError('SUBMIT_FAILED', err, data);
  }

  return taskId;
}

async function getTaskResult(taskId) {
  const payload = {
    req_key: REQ_KEY,
    task_id: taskId,
    req_json: JSON.stringify({ return_url: true })
  };

  return signedPost('CVSync2AsyncGetResult', payload);
}

function mapTaskStatus(responseData) {
  const status = responseData?.data?.status || responseData?.status;
  const lower = typeof status === 'string' ? status.toLowerCase() : '';

  if (['done', 'success', 'succeeded'].includes(lower)) return 'done';
  if (['queue', 'queued', 'pending', 'waiting'].includes(lower)) return 'queued';
  if (['running', 'processing', 'doing'].includes(lower)) return 'running';
  if (['failed', 'error', 'rejected', 'canceled', 'cancelled', 'not_found', 'expired'].includes(lower)) return 'failed';

  return 'running';
}

function extractImages(responseData) {
  const images = responseData?.data?.image_urls || responseData?.data?.images || [];
  if (Array.isArray(images)) {
    return images
      .map((item) => (typeof item === 'string' ? item : item?.url))
      .filter(Boolean);
  }

  return [];
}

async function generateImage({ prompt, ratio, resolution }) {
  const taskId = await submitTask(prompt, ratio, resolution);
  const maxAttempts = 24;
  const intervalMs = 2500;

  for (let i = 0; i < maxAttempts; i += 1) {
    await sleep(intervalMs);
    const responseData = await getTaskResult(taskId);
    const status = mapTaskStatus(responseData);

    if (status === 'done') {
      const imageUrls = extractImages(responseData);
      if (!imageUrls.length) {
        throw new JimengApiError('EMPTY_RESULT', '生成完成但未返回图片，请重试。', responseData);
      }

      return {
        taskId,
        status: 'done',
        imageUrls
      };
    }

    if (status === 'failed') {
      const message = responseData?.message || responseData?.error || '任务失败，可能触发风控或任务已失效。';
      throw new JimengApiError('TASK_FAILED', message, responseData);
    }
  }

  throw new JimengApiError('POLLING_TIMEOUT', '生成超时，请稍后再试。', { taskId });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class JimengApiError extends Error {
  constructor(code, message, raw) {
    super(message);
    this.name = 'JimengApiError';
    this.code = code;
    this.raw = raw;
  }
}

module.exports = {
  generateImage,
  JimengApiError,
  SIZE_PRESETS
};
