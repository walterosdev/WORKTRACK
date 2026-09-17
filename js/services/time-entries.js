
import { db } from '../db.js';

export async function getEntriesByDocument(documentId) {
  const { data, error } = await db
    .from('time_entries')
    .select('*')
    .eq('document_id', documentId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllEntries(dateFrom, dateTo) {
  let q = db.from('time_entries').select('project_id, document_id, hours, date');
  if (dateFrom) q = q.gte('date', dateFrom);
  if (dateTo)   q = q.lte('date', dateTo);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function createEntry(obj) {
  const { data, error } = await db.from('time_entries').insert(obj).select().single();
  if (error) throw error;
  return data;
}

export async function updateEntry(id, obj) {
  const { data, error } = await db.from('time_entries').update(obj).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEntry(id) {
  const { error } = await db.from('time_entries').delete().eq('id', id);
  if (error) throw error;
}
