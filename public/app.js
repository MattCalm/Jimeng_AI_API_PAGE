const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const generateForm = document.getElementById('generateForm');
const generateBtn = document.getElementById('generateBtn');
const generateMessage = document.getElementById('generateMessage');
const statusBar = document.getElementById('statusBar');
const results = document.getElementById('results');
const logoutBtn = document.getElementById('logoutBtn');

let statusTimer = null;

init();

async function init() {
  await refreshAuthState();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginMessage.textContent = '';

  const password = document.getElementById('passwordInput').value;

  try {
    const data = await api('/api/login', { method: 'POST', body: { password } });
    if (data.success) {
      await refreshAuthState();
    }
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

logoutBtn.addEventListener('click', async () => {
  await api('/api/logout', { method: 'POST' });
  await refreshAuthState();
});

generateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  generateMessage.textContent = '';
  results.innerHTML = '';

  const payload = {
    prompt: document.getElementById('prompt').value,
    ratio: document.getElementById('ratio').value,
    resolution: document.getElementById('resolution').value
  };

  setGenerating(true);
  setStatus('排队中');
  statusTimer = setTimeout(() => setStatus('生成中'), 2200);

  try {
    const data = await api('/api/generate', { method: 'POST', body: payload });
    setStatus('已完成');
    renderImages(data.images || []);
  } catch (error) {
    generateMessage.textContent = error.message;
    statusBar.classList.add('hidden');
  } finally {
    clearTimeout(statusTimer);
    setGenerating(false);
  }
});

function setGenerating(value) {
  generateBtn.disabled = value;
  generateBtn.textContent = value ? '生成中...' : '生成图片';
}

function setStatus(status) {
  statusBar.textContent = `状态：${status}`;
  statusBar.classList.remove('hidden');
}

function renderImages(images) {
  if (!images.length) {
    generateMessage.textContent = '未获取到图片，请重试。';
    return;
  }

  const fragment = document.createDocumentFragment();
  images.forEach((url, index) => {
    const item = document.createElement('div');
    item.className = 'result-item';
    item.innerHTML = `
      <img src="${escapeAttr(url)}" alt="生成图片 ${index + 1}" loading="lazy" />
      <p><a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">在新标签页打开</a></p>
    `;
    fragment.appendChild(item);
  });

  results.appendChild(fragment);
}

async function refreshAuthState() {
  try {
    const data = await api('/api/me');
    const authed = Boolean(data.authenticated);
    loginSection.classList.toggle('hidden', authed);
    appSection.classList.toggle('hidden', !authed);
    if (!authed) {
      document.getElementById('passwordInput').value = '';
      statusBar.classList.add('hidden');
      generateMessage.textContent = '';
      results.innerHTML = '';
    }
  } catch {
    loginSection.classList.remove('hidden');
    appSection.classList.add('hidden');
  }
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data?.error?.message || '请求失败，请稍后重试。');
  }

  return data;
}

function escapeAttr(value) {
  return String(value).replace(/"/g, '&quot;');
}
