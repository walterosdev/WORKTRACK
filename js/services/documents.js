
import { db } from '../db.js';

export async function getDocumentsByProject(projectId) {
  const { data, error } = await db
    .from('documents')
    .select('*, time_entries(hours)')
    .eq('project_id', projectId)
    .order('code');
  if (error) throw error;
  return data.map(d => ({
    ...d,
    total_hours: (d.time_entries || []).reduce((s, e) => s + Number(e.hours), 0)
  }));
}

export async function getDocument(id) {
  const { data, error } = await db.from('documents').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createDocument(obj) {
  const { data, error } = await db.from('documents').insert(obj).select().single();
  if (error) throw error;
  return data;
}

export async function updateDocument(id, obj) {
  const { data, error } = await db.from('documents').update(obj).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteDocument(id) {
  const { error } = await db.from('documents').delete().eq('id', id);
  if (error) throw error;
}
