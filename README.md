# LICILAB — Inteligencia de Licitaciones Públicas Chile

App web que busca licitaciones en Mercado Público (API real), las analiza con IA local (Ollama) y te dice si postular o no.

---

## PASO A PASO PARA WINDOWS

### 1. Instalar requisitos (una sola vez)

**Node.js** → https://nodejs.org (descargar LTS, instalar con defaults)

**Ollama** → https://ollama.com/download/windows (descargar e instalar)

**Git** → https://git-scm.com/download/win (instalar con defaults)

### 2. Descargar modelo IA

Abrir **PowerShell** o **CMD** y ejecutar:

```
ollama pull llama3.1:8b
```

Esto descarga ~4.7 GB. Solo se hace una vez.

### 3. Clonar proyecto

```
git clone https://github.com/TU-USUARIO/licilab.git
cd licilab
```

### 4. Instalar dependencias

```
npm install
```

(El ticket ya viene configurado. Supabase es opcional.)

### 6. Arrancar

Terminal 1 — Ollama (si no está corriendo):
```
ollama serve
```

Terminal 2 — App:
```
npm run dev
```

### 7. Abrir

→ **http://localhost:3000** en Chrome

---

## CÓMO FUNCIONA

1. **Buscar** → Por código, fecha o texto libre
2. **Ver detalle** → Organismo, plazos, ítems, descripción, montos
3. **Analizar con IA** → Ollama procesa y devuelve:
   - Score 0-100
   - Decisión: POSTULAR / NO POSTULAR
   - Requisitos y documentos
   - Riesgos con mitigación
   - Estrategia para ganar
   - Correo de consulta automático

---

## SUBIR A GITHUB

```
git init
git add .
git commit -m "LICILAB v1"
git remote add origin https://github.com/TU-USUARIO/licilab.git
git push -u origin main
```

---

## DEPLOY A VERCEL



---

## SUPABASE (opcional, para persistencia)

1. Crear cuenta gratis en https://supabase.com
2. Crear proyecto nuevo
3. Ir a **SQL Editor** y ejecutar:

```sql
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

-- Permisos públicos (para demo, en producción usar auth)
alter table licitaciones enable row level security;
alter table analisis enable row level security;
create policy "read" on licitaciones for select using (true);
create policy "write" on licitaciones for insert with check (true);
create policy "update" on licitaciones for update using (true);
create policy "read" on analisis for select using (true);
create policy "write" on analisis for insert with check (true);
```

4. Ir a **Settings → API** y copiar URL + anon key
5. Agregar a `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## ESTRUCTURA

```
licilab/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Home / Buscador
│   │   ├── resultados/page.tsx   ← Lista resultados
│   │   ├── licitacion/[id]/      ← Detalle + Análisis IA
│   │   ├── dashboard/page.tsx    ← Ranking (Supabase)
│   │   ├── api/
│   │   │   ├── licitaciones/     ← Proxy API MercadoPúblico
│   │   │   └── analizar/         ← Conexión Ollama
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/ui.tsx         ← Componentes compartidos
│   └── lib/
│       ├── types.ts              ← Tipos + constantes
│       └── supabase.ts           ← Cliente Supabase
├── .env.local                    ← Variables de entorno
├── package.json
└── README.md
```

---

## MODELOS OLLAMA RECOMENDADOS

| Modelo | RAM | Velocidad | Calidad |
|--------|-----|-----------|---------|
| `llama3.1:8b` | 8 GB | Rápido | Buena ← **recomendado** |
| `llama3.3:8b` | 8 GB | Rápido | Muy buena |
| `mistral:7b` | 8 GB | Muy rápido | Buena |
| `llama3.1:70b` | 40 GB | Lento | Excelente |
| `deepseek-r1:8b` | 8 GB | Medio | Muy buena (razonamiento) |

Para cambiar modelo, editar `src/app/api/analizar/route.ts` → campo `model`.

```
ollama pull llama3.3:8b
```
