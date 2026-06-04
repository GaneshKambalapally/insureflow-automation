/**
 * InsureFlow - Shared Utilities
 * Used across all pages
 */

const API_BASE = '/api';

// ── Auth helpers ──────────────────────────────────────────
function getToken()    { return localStorage.getItem('insureflow_token'); }
function getUser()     { const u = localStorage.getItem('insureflow_user'); return u ? JSON.parse(u) : null; }
function setAuth(token, user) {
  localStorage.setItem('insureflow_token', token);
  localStorage.setItem('insureflow_user', JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem('insureflow_token');
  localStorage.removeItem('insureflow_user');
}
function isLoggedIn() { return !!getToken(); }
function requireAuth() {
  if (!isLoggedIn()) { window.location.href = '/'; }
}

// ── API calls ─────────────────────────────────────────────
async function apiCall(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(API_BASE + endpoint, opts);
    const data = await res.json();
    if (res.status === 401) { clearAuth(); window.location.href = '/'; }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, data: { message: 'Network error. Please try again.' } };
  }
}

// ── Toast notifications ───────────────────────────────────
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || '•'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Status badge ──────────────────────────────────────────
function statusBadge(status) {
  const map = {
    success: 'badge-success', active: 'badge-success', disbursed: 'badge-success', processed: 'badge-success', approved: 'badge-success',
    failed: 'badge-danger', cancelled: 'badge-danger', rejected: 'badge-danger', lapsed: 'badge-danger',
    pending: 'badge-warning', initiated: 'badge-warning', processing: 'badge-warning',
    under_review: 'badge-info', reversed: 'badge-info',
    expired: 'badge-default', inactive: 'badge-default'
  };
  return `<span class="badge ${map[status] || 'badge-default'}">${status.replace('_',' ')}</span>`;
}

// ── Format currency ───────────────────────────────────────
function formatCurrency(amount) {
  return '₹ ' + Number(amount).toLocaleString('en-IN');
}

// ── Format date ───────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

// ── Sidebar rendering ─────────────────────────────────────
function renderSidebar(activePage) {
  const user = getUser();
  if (!user) return;

  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard',        href: '/dashboard.html' },
    { id: 'payment',   icon: '💳', label: 'Premium Payment',  href: '/payment.html' },
    { id: 'claims',    icon: '📋', label: 'Claims',           href: '/claims.html' },
    { id: 'history',   icon: '📊', label: 'Payment History',  href: '/history.html' },
    { id: 'refund',    icon: '↩️', label: 'Refunds',          href: '/refund.html' },
  ];

  const navHtml = navItems.map(item => `
    <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}">
      <span class="icon">${item.icon}</span>
      <span>${item.label}</span>
    </a>
  `).join('');

  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="sidebar-logo">
        <h1>🛡️ InsureFlow</h1>
        <small>Payment Portal</small>
      </div>
      <nav class="sidebar-nav">${navHtml}</nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="user-name">${user.name}</div>
            <div class="user-role">${user.role}</div>
          </div>
        </div>
        <button onclick="logout()" class="btn btn-outline btn-sm" style="width:100%;margin-top:10px">Logout</button>
      </div>
    `;
  }
}

async function logout() {
  await apiCall('POST', '/auth/logout');
  clearAuth();
  window.location.href = '/';
}
