
import { db } from '../db.js';

export async function getProjects() {
  const { data, error } = await db.from('projects').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProject(id) {
  const { data, error } = await db.from('projects').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createProject(obj) {
  const { data, error } = await db.from('projects').insert(obj).select().single();
  if (error) throw error;
  return data;
}

export async function updateProject(id, obj) {
  const { data, error } = await db.from('projects').update(obj).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id) {
  const { error } = await db.from('projects').delete().eq('id', id);
  if (error) throw error;
}
