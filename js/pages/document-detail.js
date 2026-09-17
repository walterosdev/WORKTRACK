
import { getDocument } from '../services/documents.js';
import { getProject }  from '../services/projects.js';
import { getEntriesByDocument, createEntry, updateEntry, deleteEntry } from '../services/time-entries.js';
import { fmtDate, fmtHours, today, toast, openModal, closeModal, confirm, setActiveNav, showError } from '../utils.js';

let _doc       = null;
let _project   = null;
let _entries   = [];
let _projectId = null;
let _docId     = null;

export async function render(projectId, docId) {
  _projectId = projectId;
  _docId     = docId;
  setActiveNav('projects');
  const el = document.getElementById('app-content');
  el.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
  try {
    await loadData();
    renderPage(el);
  } catch(err) { showError(el, err); }
}

async function loadData() {
  [_doc, _project, _entries] = await Promise.all([
    getDocument(_docId),
    getProject(_projectId),
    getEntriesByDocument(_docId)
  ]);
}

function renderPage(el) {
  const totalHours = _entries.reduce((s, e) => s + Number(e.hours), 0);

  const rows = _entries.map(e => `
    <tr>
      <td>${fmtDate(e.date)}</td>
      <td><span class="activity-badge">${e.activity}</span></td>
      <td class="desc-cell">${e.description || '<span class="text-muted">—</span>'}</td>
      <td class="text-right"><strong>${fmtHours(e.hours)}</strong></td>
      <td class="actions-cell">
        <button class="btn-icon btn-icon--edit"   title="Editar"   onclick="window._editEntry('${e.id}')">✎</button>
        <button class="btn-icon btn-icon--delete" title="Eliminar" onclick="window._deleteEntry('${e.id}')">✕</button>
      </td>
    </tr>
  `).join('');

  el.innerHTML = `
    <div class="page-header">
      <div>
        <button class="back-btn" onclick="window.goTo('projects/${_projectId}')">← ${_project.name}</button>
        <h1 class="page-title">
          <span class="badge badge--code">${_doc.code}</span>
          &nbsp;${_doc.name}
        </h1>
        ${_doc.description ? `<p class="page-subtitle">${_doc.description}</p>` : ''}
      </div>
      <button class="btn btn--primary" id="new-entry-btn">+ Registrar horas</button>
    </div>

    <div class="kpi-row kpi-row--small">
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-value">${totalHours.toFixed(1)} h</span>
          <span class="kpi-label">Horas acumuladas</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-value">${_entries.length}</span>
          <span class="kpi-label">Registros</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Registros de horas</h2>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Fecha</th><th>Actividad</th><th>Descripción</th>
            <th class="text-right">Horas</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="5" class="empty-row">Sin registros aún. Registra las primeras horas.</td></tr>'}
        </tbody>
        ${_entries.length > 0 ? `
        <tfoot>
          <tr class="table-total">
            <td colspan="3"><strong>Total</strong></td>
            <td class="text-right"><strong>${fmtHours(totalHours)}</strong></td>
            <td></td>
          </tr>
        </tfoot>` : ''}
      </table>
    </div>
  `;

  document.getElementById('new-entry-btn').onclick = () => showEntryForm(null);

  window._editEntry = (id) => {
    const e = _entries.find(x => x.id === id);
    if (e) showEntryForm(e);
  };
  window._deleteEntry = async (id) => {
    const ok = await confirm('¿Eliminar este registro de horas?');
    if (!ok) return;
    try {
      await deleteEntry(id);
      toast('Registro eliminado');
      await loadData();
      renderPage(document.getElementById('app-content'));
    } catch(err) { toast(err.message, 'error'); }
  };
}

function showEntryForm(entry) {
  const title = entry ? 'Editar registro' : 'Registrar horas';
  const body = `
    <form id="entry-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Fecha <span class="req">*</span></label>
          <input class="form-input" id="f-date" type="date" value="${entry?.date || today()}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Horas <span class="req">*</span></label>
          <input class="form-input" id="f-hours" type="number" step="0.25" min="0.25" max="24"
                 value="${entry?.hours || ''}" placeholder="2.5" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Actividad <span class="req">*</span></label>
        <input class="form-input" id="f-activity" value="${entry?.activity || ''}"
               placeholder="Diseño, Revisión, Corrección..." list="activity-list" required>
        <datalist id="activity-list">
          <option value="Diseño">
          <option value="Revisión">
          <option value="Corrección">
          <option value="Documentación">
          <option value="Reunión">
          <option value="Coordinación">
        </datalist>
      </div>
      <div class="form-group">
        <label class="form-label">Descripción</label>
        <textarea class="form-input form-textarea" id="f-desc"
                  placeholder="Descripción de la actividad realizada">${entry?.description || ''}</textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn--ghost" onclick="window._closeModal()">Cancelar</button>
        <button type="submit" class="btn btn--primary">Guardar registro</button>
      </div>
    </form>`;
  openModal(title, body);

  document.getElementById('entry-form').onsubmit = async (e) => {
    e.preventDefault();
    const hours = parseFloat(document.getElementById('f-hours').value);
    if (isNaN(hours) || hours <= 0 || hours > 24)
      return toast('Las horas deben estar entre 0 y 24', 'error');

    const obj = {
      project_id:  _projectId,
      document_id: _docId,
      date:        document.getElementById('f-date').value,
      activity:    document.getElementById('f-activity').value.trim(),
      description: document.getElementById('f-desc').value.trim(),
      hours
    };
    if (!obj.activity) return toast('La actividad es obligatoria', 'error');
    try {
      if (entry) await updateEntry(entry.id, obj);
      else       await createEntry(obj);
      closeModal();
      toast(entry ? 'Registro actualizado' : 'Horas registradas');
      await loadData();
      renderPage(document.getElementById('app-content'));
    } catch(err) { toast(err.message, 'error'); }
  };
}
