
import { getProjects }  from '../services/projects.js';
import { getAllEntries } from '../services/time-entries.js';
import { fmtHours, setActiveNav, showError } from '../utils.js';

export async function render() {
  setActiveNav('dashboard');
  const el = document.getElementById('app-content');
  el.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

  try {
    const [projects, docs, entries] = await Promise.all([
      getProjects(),
      fetch_all_documents(),
      getAllEntries(null, null)
    ]);

    // ── Aggregate ───────────────────────────────────────────
    const hoursPerProject = {};
    const docsPerProject  = {};
    let totalHours = 0;

    entries.forEach(e => {
      hoursPerProject[e.project_id] = (hoursPerProject[e.project_id] || 0) + Number(e.hours);
      totalHours += Number(e.hours);
    });
    docs.forEach(d => {
      docsPerProject[d.project_id] = (docsPerProject[d.project_id] || 0) + 1;
    });

    const projectCards = projects.map(p => `
      <div class="project-card" onclick="window.goTo('projects/${p.id}')">
        <div class="project-card-top">
          <span class="badge badge--code">${p.code}</span>
          <span class="project-hours-badge">${fmtHours(hoursPerProject[p.id] || 0)}</span>
        </div>
        <h3 class="project-card-name">${p.name}</h3>
        <p class="project-card-desc">${p.description || ''}</p>
        <div class="project-card-bottom">
          <span class="project-docs-count">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            ${docsPerProject[p.id] || 0} documentos
          </span>
          <span class="project-card-link">Ver proyecto →</span>
        </div>
      </div>
    `).join('');

    el.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Resumen general de horas registradas</p>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">${projects.length}</span>
            <span class="kpi-label">Proyectos</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--violet">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">${docs.length}</span>
            <span class="kpi-label">Documentos</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">${totalHours.toFixed(1)} h</span>
            <span class="kpi-label">Horas totales</span>
          </div>
        </div>
      </div>

      <div class="section-header">
        <h2 class="section-title">Proyectos</h2>
        <button class="btn btn--primary" onclick="window.goTo('projects')">
          Ver todos
        </button>
      </div>
      <div class="projects-grid">${projectCards}</div>
    `;
  } catch(err) {
    showError(el, err);
  }
}

async function fetch_all_documents() {
  const { db } = await import('../db.js');
  const { data, error } = await db.from('documents').select('id, project_id');
  if (error) throw error;
  return data;
}
