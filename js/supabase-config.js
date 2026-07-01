// ══════════════════════════════════════════════════════════════════════
// Supabase Configuration — Marcador de Consumo Alimentar
// ══════════════════════════════════════════════════════════════════════
// ⚠️ Substitua os valores abaixo pelas credenciais do seu projeto Supabase.
//    Encontre-os em: Supabase Dashboard → Settings → API
// ══════════════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://zhjvtlvqfasgynwbuoyp.supabase.co';       // Ex: https://abcdefg.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoanZ0bHZxZmFzZ3lud2J1b3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTk4MDcsImV4cCI6MjA5ODQ5NTgwN30.iS72x0weuRdf7I_qFpuDcBxIKXXL0ORXLbYS-mysTacANON_KEY';   // A chave "anon" (pública)

// Inicializa o cliente Supabase (variável global `supabase` vem do CDN)
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
