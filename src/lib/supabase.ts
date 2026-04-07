import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = url && key ? createClient(url, key) : null;

// Guardar licitación en Supabase (no bloquea si no hay DB)
export async function guardarLicitacion(lic: any) {
  if (!supabase) return;
  try {
    await supabase.from("licitaciones").upsert({
      codigo: lic.CodigoExterno,
      nombre: lic.Nombre,
      organismo: lic.Comprador?.NombreOrganismo || null,
      tipo: lic.Tipo || null,
      estado: lic.CodigoEstado,
      monto: lic.MontoEstimado || null,
      fecha_cierre: lic.Fechas?.FechaCierre || null,
      fecha_publicacion: lic.Fechas?.FechaPublicacion || null,
      raw: lic,
    }, { onConflict: "codigo" });
  } catch (e) { console.error("DB save:", e); }
}

// Guardar análisis
export async function guardarAnalisis(codigo: string, analisis: any) {
  if (!supabase) return;
  try {
    await supabase.from("analisis").insert({
      codigo_licitacion: codigo,
      score: analisis.score,
      decision: analisis.decision,
      viabilidad: analisis.viabilidad,
      data: analisis,
    });
  } catch (e) { console.error("DB save analisis:", e); }
}

// Obtener licitaciones guardadas con análisis
export async function obtenerGuardadas(limit = 30) {
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from("licitaciones")
      .select("*, analisis(score, decision, viabilidad)")
      .order("created_at", { ascending: false })
      .limit(limit);
    return data || [];
  } catch { return []; }
}

/*
=== SQL PARA SUPABASE (ejecutar en SQL Editor) ===

create table licitaciones (
  id bigint generated always as identity primary key,
  codigo text unique not null,
  nombre text,
  organismo text,
  tipo text,
  estado int,
  monto float,
  fecha_cierre timestamptz,
  fecha_publicacion timestamptz,
  raw jsonb,
  created_at timestamptz default now()
);

create table analisis (
  id bigint generated always as identity primary key,
  codigo_licitacion text references licitaciones(codigo),
  score int,
  decision text,
  viabilidad text,
  data jsonb,
  created_at timestamptz default now()
);

alter table licitaciones enable row level security;
alter table analisis enable row level security;
create policy "public read" on licitaciones for select using (true);
create policy "public insert" on licitaciones for insert with check (true);
create policy "public update" on licitaciones for update using (true);
create policy "public read" on analisis for select using (true);
create policy "public insert" on analisis for insert with check (true);
*/
