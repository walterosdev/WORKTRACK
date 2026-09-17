// Cliente Supabase centralizado
const cfg = window.WORKTRACK_CONFIG;
const { createClient } = window.supabase;
export const db = createClient(cfg.supabaseUrl, cfg.supabaseKey);
