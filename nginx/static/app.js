'use strict';

const API = '/api/v1';

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

async function checkHealth() {
  const dot   = document.getElementById('health-dot');
  const label = document.getElementById('health-label');
  try {
    const r = await fetch('/health');
    const d = await r.json();
    dot.classList.add('ok');
    label.textContent = `Server up — uptime ${Math.floor(d.uptime)}s`;
  } catch {
    dot.classList.add('error');
    label.textContent = 'Server unreachable';
  }
}

async function loadUsers() {
  const dot   = document.getElementById('api-dot');
  const label = document.getElementById('api-label');
  const list  = document.getElementById('user-list');
  const count = document.getElementById('user-count');
  try {
    const r    = await fetch(`${API}/users`);
    const data = await r.json();
    const users = data.data;

    dot.classList.add('ok');
    label.textContent = `API connected`;
    count.textContent = `${users.length} user${users.length !== 1 ? 's' : ''}`;

    if (!users.length) {
      list.innerHTML = '<li class="empty">No users yet — add one below.</li>';
      return;
    }

    list.innerHTML = users.map(u => `
      <li class="user-item">
        <div class="avatar">${esc(u.name.charAt(0).toUpperCase())}</div>
        <div style="flex:1">
          <div class="u-name">${esc(u.name)}</div>
          <div class="u-email">${esc(u.email)}</div>
        </div>
        <div class="u-id">#${u.id}</div>
      </li>`).join('');
  } catch {
    dot.classList.add('error');
    label.textContent = 'API unreachable';
    list.innerHTML = '<li class="empty">Could not reach API.</li>';
  }
}

async function addUser() {
  const name  = document.getElementById('inp-name').value.trim();
  const email = document.getElementById('inp-email').value.trim();

  if (!name || !email) {
    alert('Both name and email are required.');
    return;
  }

  const r = await fetch(`${API}/users`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ name, email }),
  });

  if (!r.ok) {
    const e = await r.json();
    alert(`Error: ${e.error}`);
    return;
  }

  document.getElementById('inp-name').value  = '';
  document.getElementById('inp-email').value = '';
  loadUsers();
}

document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  loadUsers();
});