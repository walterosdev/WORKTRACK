
import { render as renderDashboard }   from './pages/dashboard.js';
import { render as renderProjects }    from './pages/projects-page.js';
import { render as renderProjectDetail} from './pages/project-detail.js';
import { render as renderDocDetail }   from './pages/document-detail.js';
import { closeModal } from './utils.js';

// ── Routing ──────────────────────────────────────────────────
async function route() {
  const hash  = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0 || parts[0] === 'dashboard') {
    await renderDashboard();
  } else if (parts[0] === 'projects') {
    if (parts.length === 1) {
      await renderProjects();
    } else if (parts.length === 2) {
      await renderProjectDetail(parts[1]);
    } else if (parts.length === 4 && parts[2] === 'documents') {
      await renderDocDetail(parts[1], parts[3]);
    }
  }
}

window.addEventListener('hashchange', route);

// ── Global helpers ───────────────────────────────────────────
window.goTo = (path) => { window.location.hash = path; };
window._closeModal = closeModal;

// ── Modal overlay click ──────────────────────────────────────
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.getElementById('modal-close').addEventListener('click', closeModal);

// ── Init ─────────────────────────────────────────────────────
route();
