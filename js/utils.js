
// ─── Formatters ──────────────────────────────────────────────
export function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
export function fmtHours(h) {
  return `${(+h || 0).toFixed(1)} h`;
}
export function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Toast ───────────────────────────────────────────────────
export function toast(msg, type = 'success') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
    <span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.classList.add('toast--show'), 10);
  setTimeout(() => {
    t.classList.remove('toast--show');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ─── Modal ───────────────────────────────────────────────────
export function openModal(title, bodyHTML) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-overlay').classList.add('modal--open');
}
export function closeModal() {
  document.getElementById('modal-overlay').classList.remove('modal--open');
  document.getElementById('modal-body').innerHTML = '';
}

// ─── Confirm dialog ──────────────────────────────────────────
export function confirm(msg) {
  return new Promise(resolve => {
    const body = `
      <p class="confirm-msg">${msg}</p>
      <div class="modal-actions">
        <button id="confirm-cancel" class="btn btn--ghost">Cancelar</button>
        <button id="confirm-ok"     class="btn btn--danger">Eliminar</button>
      </div>`;
    openModal('Confirmar eliminación', body);
    document.getElementById('confirm-ok').onclick = () => { closeModal(); resolve(true); };
    document.getElementById('confirm-cancel').onclick = () => { closeModal(); resolve(false); };
  });
}

// ─── Loader ──────────────────────────────────────────────────
export function loading(el, show) {
  if (show) el.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
}

// ─── Active nav link ─────────────────────────────────────────
export function setActiveNav(page) {
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

// ─── Error boundary ──────────────────────────────────────────
export function showError(el, err) {
  console.error(err);
  el.innerHTML = `<div class="error-box">
    <strong>Error:</strong> ${err.message || 'Algo salió mal'}
  </div>`;
}
