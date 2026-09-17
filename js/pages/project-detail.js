
import { getProject } from '../services/projects.js';
import { getDocumentsByProject, createDocument, updateDocument, deleteDocument } from '../services/documents.js';
import { fmtHours, toast, openModal, closeModal, confirm, setActiveNav, showError } from '../utils.js';

let _project  = null;
let _docs     = [];
let _projectId = null;
let _chartInst = null;

export async function render(projectId) {
  _projectId = projectId;
  setActiveNav('projects');
  const el = document.getElementById('app-content');
  el.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
  try {
    await loadData();
    renderPage(el);
  } catch(err) { showError(el, err); }
}

async function loadData() {
  [_project, _docs] = await Promise.all([
    getProject(_projectId),
    getDocumentsByProject(_projectId)
  ]);
}

function renderPage(el) {
  const totalHours = _docs.reduce((s, d) => s + d.total_hours, 0);
  const maxHours   = Math.max(..._docs.map(d => d.total_hours), 1);

  const docRows = _docs.map(d => `
    <tr>
      <td><span class="badge badge--code">${d.code}</span></td>
      <td><a class="project-link" onclick="window.goTo('projects/${_projectId}/documents/${d.id}')">${d.name}</a>
          ${d.description ? `<p class="text-muted small">${d.description}</p>` : ''}
      </td>
      <td class="text-right"><strong>${fmtHours(d.total_hours)}</strong></td>
      <td class="actions-cell">
        <button class="btn-icon btn-icon--edit"   title="Editar"   onclick="window._editDoc('${d.id}')">✎</button>
        <button class="btn-icon btn-icon--delete" title="Eliminar" onclick="window._deleteDoc('${d.id}')">✕</button>
      </td>
    </tr>
  `).join('');

  const barRows = _docs.map(d => {
    const pct = maxHours > 0 ? (d.total_hours / maxHours) * 100 : 0;
    return `
      <div class="bar-row">
        <div class="bar-label">
          <span class="bar-code">${d.code}</span>
          <span class="bar-name">${d.name}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%"></div>
        </div>
        <span class="bar-hours">${fmtHours(d.total_hours)}</span>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="page-header">
      <div>
        <button class="back-btn" onclick="window.goTo('projects')">← Proyectos</button>
        <h1 class="page-title">${_project.name}</h1>
        <p class="page-subtitle">
          <span class="badge badge--code">${_project.code}</span>
          ${_project.description ? `&nbsp;·&nbsp; ${_project.description}` : ''}
        </p>
      </div>
      <button class="btn btn--primary" id="new-doc-btn">+ Nuevo documento</button>
    </div>

    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-value">${totalHours.toFixed(1)} h</span>
          <span class="kpi-label">Horas totales</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--violet">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-value">${_docs.length}</span>
          <span class="kpi-label">Documentos</span>
        </div>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Documentos</h2>
        </div>
        <table class="table">
          <thead><tr>
            <th>Código</th><th>Nombre</th>
            <th class="text-right">Horas</th><th></th>
          </tr></thead>
          <tbody>${docRows || '<tr><td colspan="4" class="empty-row">Sin documentos aún</td></tr>'}</tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-header"><h2 class="card-title">Horas por documento</h2></div>
        <div class="bar-chart">${barRows || '<p class="text-muted" style="padding:16px">Sin datos</p>'}</div>
      </div>
    </div>
  `;

  document.getElementById('new-doc-btn').onclick = () => showDocForm(null);

  window._editDoc = (id) => {
    const d = _docs.find(x => x.id === id);
    if (d) showDocForm(d);
  };
  window._deleteDoc = async (id) => {
    const d = _docs.find(x => x.id === id);
    const ok = await confirm(`¿Eliminar el documento "${d?.code} – ${d?.name}"? Se eliminarán todos sus registros de horas.`);
    if (!ok) return;
    try {
      await deleteDocument(id);
      toast('Documento eliminado');
      await loadData();
      renderPage(document.getElementById('app-content'));
    } catch(err) { toast(err.message, 'error'); }
  };
}

function showDocForm(doc) {
  const title = doc ? 'Editar documento' : 'Nuevo documento';
  const body = `
    <form id="doc-form">
      <div class="form-group">
        <label class="form-label">Código <span class="req">*</span></label>
        <input class="form-input" id="f-code" value="${doc?.code || ''}" placeholder="P-01" required>
      </div>
      <div class="form-group">
        <label class="form-label">Nombre <span class="req">*</span></label>
        <input class="form-input" id="f-name" value="${doc?.name || ''}" placeholder="Nombre del documento" required>
      </div>
      <div class="form-group">
        <label class="form-label">Descripción</label>
        <textarea class="form-input form-textarea" id="f-desc" placeholder="Descripción opcional">${doc?.description || ''}</textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn--ghost" onclick="window._closeModal()">Cancelar</button>
        <button type="submit" class="btn btn--primary">Guardar</button>
      </div>
    </form>`;
  openModal(title, body);

  document.getElementById('doc-form').onsubmit = async (e) => {
    e.preventDefault();
    const obj = {
      project_id: _projectId,
      code: document.getElementById('f-code').value.trim(),
      name: document.getElementById('f-name').value.trim(),
      description: document.getElementById('f-desc').value.trim()
    };
    if (!obj.code || !obj.name) return toast('Código y nombre son obligatorios', 'error');
    try {
      if (doc) await updateDocument(doc.id, obj);
      else     await createDocument(obj);
      closeModal();
      toast(doc ? 'Documento actualizado' : 'Documento creado');
      await loadData();
      renderPage(document.getElementById('app-content'));
    } catch(err) { toast(err.message, 'error'); }
  };
}
