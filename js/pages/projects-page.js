
import { getProjects, createProject, updateProject, deleteProject } from '../services/projects.js';
import { getAllEntries } from '../services/time-entries.js';
import { fmtHours, toast, openModal, closeModal, confirm, setActiveNav, showError } from '../utils.js';

let _projects = [];
let _hours    = {};
let _docs     = {};

export async function render() {
  setActiveNav('projects');
  const el = document.getElementById('app-content');
  el.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
  try {
    await loadData();
    renderPage(el);
  } catch(err) { showError(el, err); }
}

async function loadData() {
  const { db } = await import('../db.js');
  const [pRes, dRes, eRes] = await Promise.all([
    getProjects(),
    db.from('documents').select('id, project_id'),
    getAllEntries(null, null)
  ]);
  _projects = pRes;
  const docs = dRes.data || [];
  const entries = eRes;
  _hours = {};
  _docs  = {};
  entries.forEach(e => {
    _hours[e.project_id] = (_hours[e.project_id] || 0) + Number(e.hours);
  });
  docs.forEach(d => {
    _docs[d.project_id] = (_docs[d.project_id] || 0) + 1;
  });
}

function renderPage(el) {
  const rows = _projects.map(p => `
    <tr>
      <td><span class="badge badge--code">${p.code}</span></td>
      <td>
        <a class="project-link" onclick="window.goTo('projects/${p.id}')">${p.name}</a>
        ${p.description ? `<p class="text-muted small">${p.description}</p>` : ''}
      </td>
      <td class="text-center">${_docs[p.id] || 0}</td>
      <td class="text-right"><strong>${fmtHours(_hours[p.id] || 0)}</strong></td>
      <td class="actions-cell">
        <button class="btn-icon btn-icon--edit"   title="Editar"   onclick="window._editProject('${p.id}')">✎</button>
        <button class="btn-icon btn-icon--delete" title="Eliminar" onclick="window._deleteProject('${p.id}')">✕</button>
      </td>
    </tr>
  `).join('');

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Proyectos</h1>
        <p class="page-subtitle">${_projects.length} proyecto${_projects.length !== 1 ? 's' : ''} registrado${_projects.length !== 1 ? 's' : ''}</p>
      </div>
      <button class="btn btn--primary" id="new-project-btn">+ Nuevo proyecto</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Código</th><th>Nombre</th><th class="text-center">Documentos</th>
            <th class="text-right">Horas</th><th></th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="5" class="empty-row">No hay proyectos aún. Crea el primero.</td></tr>'}</tbody>
      </table>
    </div>
  `;

  document.getElementById('new-project-btn').onclick = () => showForm(null);

  window._editProject = (id) => {
    const p = _projects.find(x => x.id === id);
    if (p) showForm(p);
  };
  window._deleteProject = async (id) => {
    const p = _projects.find(x => x.id === id);
    const ok = await confirm(`¿Eliminar el proyecto "${p?.name}"? Se eliminarán todos sus documentos y registros.`);
    if (!ok) return;
    try {
      await deleteProject(id);
      toast('Proyecto eliminado');
      await loadData();
      renderPage(document.getElementById('app-content'));
    } catch(err) { toast(err.message, 'error'); }
  };
}

function showForm(project) {
  const title = project ? 'Editar proyecto' : 'Nuevo proyecto';
  const body = `
    <form id="project-form">
      <div class="form-group">
        <label class="form-label">Código <span class="req">*</span></label>
        <input class="form-input" id="f-code" value="${project?.code || ''}" placeholder="PRO-001" required>
      </div>
      <div class="form-group">
        <label class="form-label">Nombre <span class="req">*</span></label>
        <input class="form-input" id="f-name" value="${project?.name || ''}" placeholder="Nombre del proyecto" required>
      </div>
      <div class="form-group">
        <label class="form-label">Descripción</label>
        <textarea class="form-input form-textarea" id="f-desc" placeholder="Descripción opcional">${project?.description || ''}</textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn--ghost" onclick="window._closeModal()">Cancelar</button>
        <button type="submit" class="btn btn--primary">Guardar</button>
      </div>
    </form>`;
  openModal(title, body);

  document.getElementById('project-form').onsubmit = async (e) => {
    e.preventDefault();
    const obj = {
      code: document.getElementById('f-code').value.trim(),
      name: document.getElementById('f-name').value.trim(),
      description: document.getElementById('f-desc').value.trim()
    };
    if (!obj.code || !obj.name) return toast('Código y nombre son obligatorios', 'error');
    try {
      if (project) await updateProject(project.id, obj);
      else         await createProject(obj);
      closeModal();
      toast(project ? 'Proyecto actualizado' : 'Proyecto creado');
      await loadData();
      renderPage(document.getElementById('app-content'));
    } catch(err) { toast(err.message, 'error'); }
  };
}
