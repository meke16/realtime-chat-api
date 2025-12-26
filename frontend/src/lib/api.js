// Use Vite proxy by default in dev; set VITE_API_BASE_URL to override
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

let authToken = localStorage.getItem('chat_token') || null;

export function setToken(token) {
  authToken = token;
  if (token) localStorage.setItem('chat_token', token);
  else localStorage.removeItem('chat_token');
}

export function getToken() {
  return authToken;
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {
    throw new Error(msg);
    }
  }
  return res.json();
}

export async function register(name, email, password) {
  const data = await request('/api/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, password_confirmation: password }),
  });
  setToken(data.token);
  return data.user;
}

export async function login(email, password) {
  const data = await request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data.user;
}

export async function fetchMessages() {
  return request('/api/messages');
}

export async function sendMessage(body) {
  return request('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export async function getUsers() {
  return request('/api/users');
}

export async function ping() {
  return request('/api/me/ping', { method: 'POST' });
}

export async function getConversationMessages(userId) {
  return request(`/api/conversations/${userId}/messages`);
}

export async function sendDirectMessage(userId, body) {
  return request(`/api/conversations/${userId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export async function markRead(messageId) {
  return request(`/api/messages/${messageId}/read`, { method: 'POST' });
}
