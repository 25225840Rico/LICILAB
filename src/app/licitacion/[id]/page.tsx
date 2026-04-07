"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header, BottomNav, Card, Badge, ScoreRing, STitle, Spinner } from "@/components/ui";
import { ESTADO, ESTADO_COLOR, TIPO, MODALIDAD_PAGO, formatCLP, formatDate, type Licitacion, type Analisis } from "@/lib/types";
import { guardarLicitacion, guardarAnalisis } from "@/lib/supabase";

export default function LicitacionDetalle() {
  const { id } = useParams();
  const codigo = decodeURIComponent(id as string);
  const [lic, setLic] = useState<Licitacion | null>(null);
  const [analysis, setAnalysis] = useState<Analisis | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [tab, setTab] = useState("resumen");
  const [copied, setCopied] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Fetch detail
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/licitaciones?codigo=${codigo}`);
        const data = await res.json();
        const l = data.Listado?.[0];
        if (l) { setLic(l); guardarLicitacion(l); }
      } catch {}
      setLoading(false);
    })();
  }, [codigo]);

  // AI steps animation
  useEffect(() => {
    if (!aiLoading) { setAiStep(0); return; }
    let i = 0;
    const iv = setInterval(() => { if(++i < 6) setAiStep(i); }, 2000);
    return () => clearInterval(iv);
  }, [aiLoading]);

  const runAI = async () => {
    if (!lic) return;
    setAiLoading(true); setAnalysis(null); setShowAnalysis(true); setTab("resumen");
    try {
      const res = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licitacion: lic }),
      });
      const data = await res.json();
      setAnalysis(data);
      guardarAnalisis(codigo, data);
    } catch { setAnalysis(null); }
    setAiLoading(false);
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  if (loading) return <Page><Spinner text="Cargando licitación..."/></Page>;
  if (!lic) return <Page><div style={{textAlign:"center",padding:48,color:"var(--t3)"}}>Licitación no encontrada</div></Page>;

  const fechas = [
    ["Publicación", lic.Fechas?.FechaPublicacion],
    ["Cierre ofertas", lic.Fechas?.FechaCierre],
    ["Inicio consultas", lic.Fechas?.FechaInicio],
    ["Fin consultas", lic.Fechas?.FechaFinal],
    ["Pub. respuestas", lic.Fechas?.FechaPubRespuestas],
    ["Apertura técnica", lic.Fechas?.FechaActoAperturaTecnica],
    ["Apertura económica", lic.Fechas?.FechaActoAperturaEconomica],
    ["Adj. estimada", lic.Fechas?.FechaEstimadaAdjudicacion],
    ["Adjudicación", lic.Fechas?.FechaAdjudicacion],
    ["Visita terreno", lic.Fechas?.FechaVisitaTerreno],
    ["Entrega antecedentes", lic.Fechas?.FechaEntregaAntecedentes],
  ].filter(([,v]) => v) as [string, string][];

  const info = [
    ["Organismo", lic.Comprador?.NombreOrganismo],
    ["Unidad", lic.Comprador?.NombreUnidad],
    ["RUT Unidad", lic.Comprador?.RutUnidad],
    ["Dirección", lic.Comprador?.DireccionUnidad],
    ["Comuna", lic.Comprador?.ComunaUnidad],
    ["Región", lic.Comprador?.RegionUnidad],
    ["Tipo", lic.Tipo ? (TIPO[lic.Tipo] || lic.Tipo) : null],
    ["Monto estimado", lic.MontoEstimado && lic.MontoEstimado > 0 ? formatCLP(lic.MontoEstimado) : null],
    ["Moneda", lic.Moneda],
    ["Etapas", lic.Etapas],
    ["Convocatoria", lic.TipoConvocatoria === 1 ? "Abierta" : lic.TipoConvocatoria === 0 ? "Cerrada" : null],
  ].filter(([,v]) => v != null) as [string, any][];

  return (
    <Page>
      <div style={{padding:16,maxWidth:520,margin:"0 auto",paddingBottom:80}}>
        {/* Back */}
        <Link href="/resultados" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:"var(--t3)",marginBottom:12,fontWeight:600}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Volver
        </Link>

        {!showAnalysis ? (
          // ══════ DETAIL VIEW ══════
          <div className="anim-f">
            {/* Header */}
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,marginBottom:8}}>
                <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"var(--ac)",fontWeight:700}}>{lic.CodigoExterno}</span>
                <Badge color={ESTADO_COLOR[lic.CodigoEstado]||"var(--t3)"}>{ESTADO[lic.CodigoEstado]||lic.CodigoEstado}</Badge>
              </div>
              <h1 style={{fontSize:16,fontWeight:800,lineHeight:1.3,marginBottom:14}}>{lic.Nombre}</h1>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {info.map(([k,v],i) => (
                  <div key={i} style={{fontSize:12,color:"var(--t2)"}}>
                    <span style={{color:"var(--t1)",fontWeight:600}}>{k}:</span>{" "}
                    {k === "Monto estimado" ? <span style={{color:"var(--ac)",fontWeight:800}}>{v}</span> : v}
                  </div>
                ))}
              </div>
            </Card>

            {/* Fechas */}
            {fechas.length > 0 && (
              <Card>
                <STitle>Plazos y fechas</STitle>
                {fechas.map(([k,v],i) => (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",borderRadius:8,background:"var(--s2)",marginBottom:3}}>
                    <span style={{fontSize:11,color:"var(--t3)"}}>{k}</span>
                    <span style={{fontSize:11,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{formatDate(v)}</span>
                  </div>
                ))}
              </Card>
            )}

            {/* Descripción */}
            {lic.Descripcion && (
              <Card>
                <STitle>Descripción / Objeto</STitle>
                <p style={{fontSize:12,lineHeight:1.7,color:"var(--t2)",whiteSpace:"pre-wrap"}}>{lic.Descripcion}</p>
              </Card>
            )}

            {/* Items */}
            {lic.Items && lic.Items.Cantidad > 0 && (
              <Card>
                <STitle>Productos / Servicios ({lic.Items.Cantidad})</STitle>
                {(lic.Items.Listado || []).slice(0, 15).map((it, i) => (
                  <div key={i} style={{padding:"8px 10px",borderRadius:8,background:"var(--s2)",marginBottom:3}}>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:3}}>{it.NombreProducto || it.Descripcion || `Ítem ${it.Correlativo}`}</div>
                    <div style={{fontSize:10,color:"var(--t3)",display:"flex",gap:10,flexWrap:"wrap"}}>
                      {it.Categoria && <span>{it.Categoria}</span>}
                      {it.Cantidad != null && <span>Cantidad: {it.Cantidad} {it.UnidadMedida || ""}</span>}
                      {it.CodigoCategoria && <span>Código: {it.CodigoCategoria}</span>}
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {/* Adjudicación */}
            {lic.Adjudicacion?.NumeroOferentes != null && (
              <Card>
                <STitle>Adjudicación</STitle>
                <div style={{fontSize:12,color:"var(--t2)",display:"flex",flexDirection:"column",gap:4}}>
                  {lic.Adjudicacion.NumeroOferentes != null && <div>Oferentes: <strong>{lic.Adjudicacion.NumeroOferentes}</strong></div>}
                  {lic.Adjudicacion.Fecha && <div>Fecha: {formatDate(lic.Adjudicacion.Fecha)}</div>}
                  {lic.Adjudicacion.UrlActa && <a href={lic.Adjudicacion.UrlActa} target="_blank" rel="noopener" style={{color:"var(--ac)",fontWeight:600}}>Ver acta de adjudicación →</a>}
                </div>
              </Card>
            )}

            {/* Link MP */}
            <Card style={{background:"var(--s2)"}}>
              <a href={`https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx?qs=/${lic.CodigoExterno}`} target="_blank" rel="noopener"
                style={{display:"flex",alignItems:"center",gap:8,color:"var(--b)",fontSize:12,fontWeight:600}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                Ver en Mercado Público
              </a>
            </Card>

            {/* AI Button */}
            <button onClick={runAI} style={{width:"100%",padding:16,borderRadius:16,background:"var(--ac)",color:"#000",fontWeight:800,fontSize:16,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginTop:4}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
                <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
              </svg>
              Analizar con IA
            </button>
          </div>
        ) : (
          // ══════ ANALYSIS VIEW ══════
          <div className="anim-f">
            <button onClick={() => setShowAnalysis(false)} style={{background:"none",border:"none",color:"var(--t3)",cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Volver al detalle
            </button>

            {aiLoading ? (
              <div style={{textAlign:"center",padding:"40px 16px"}}>
                <div style={{width:80,height:80,borderRadius:20,margin:"0 auto 20px",background:"rgba(0,214,143,.08)",border:"1px solid rgba(0,214,143,.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" strokeWidth="1.5" strokeLinecap="round" style={{animation:"spin 2.5s linear infinite"}}>
                    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
                    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
                  </svg>
                </div>
                <h3 style={{fontSize:17,fontWeight:800,marginBottom:6}}>Analizando con Ollama...</h3>
                <p style={{color:"var(--t3)",fontSize:12,marginBottom:24}}>Procesando licitación con llama3.1</p>
                <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:240,margin:"0 auto"}}>
                  {["Leyendo metadata","Identificando requisitos","Evaluando riesgos","Calculando score","Generando estrategia","Preparando decisión"].map((s,i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:i<=aiStep?"var(--t2)":"var(--t3)",opacity:i<=aiStep?1:.3,transition:"all .4s"}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:i<=aiStep?"var(--ac)":"var(--bd)",transition:"all .3s",boxShadow:i===aiStep?"0 0 8px rgba(0,214,143,.5)":"none"}}/>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            ) : analysis ? (
              <div>
                {/* Score */}
                <Card style={{display:"flex",alignItems:"center",gap:16}}>
                  <ScoreRing score={analysis.score||0}/>
                  <div style={{flex:1,minWidth:0}}>
                    <Badge color={analysis.decision?.includes("POSTULAR") && !analysis.decision?.includes("NO") ? "var(--ac)" : "var(--r)"}>{analysis.decision}</Badge>
                    <div style={{fontSize:11,color:"var(--t3)",marginTop:6}}>Viabilidad: <strong style={{color:"var(--t1)"}}>{analysis.viabilidad}</strong></div>
                    <div style={{fontSize:10,color:"var(--t3)",marginTop:3,lineHeight:1.45}}>{analysis.justificacionDecision}</div>
                  </div>
                </Card>

                {/* Tabs */}
                <div style={{display:"flex",gap:2,overflowX:"auto",paddingBottom:6,marginBottom:10}}>
                  {[{id:"resumen",l:"Resumen"},{id:"requisitos",l:"Requisitos"},{id:"riesgos",l:"Riesgos"},{id:"estrategia",l:"Estrategia"},
                    ...(analysis.correo ? [{id:"correo",l:"Correo"}] : [])
                  ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{padding:"10px 14px",border:"none",cursor:"pointer",borderRadius:10,fontSize:12,fontWeight:700,whiteSpace:"nowrap",transition:"all .2s",background:tab===t.id?"rgba(0,214,143,.12)":"transparent",color:tab===t.id?"var(--ac)":"var(--t3)"}}>{t.l}</button>
                  ))}
                </div>

                {/* Resumen */}
                {tab === "resumen" && <div>
                  <Card><STitle>Resumen ejecutivo</STitle><p style={{fontSize:12,lineHeight:1.7,color:"var(--t2)"}}>{analysis.resumen}</p></Card>
                  <Card><STitle>Objeto</STitle><p style={{fontSize:12,lineHeight:1.7,color:"var(--t2)"}}>{analysis.objeto}</p></Card>
                  {analysis.plazos?.length > 0 && <Card><STitle>Plazos críticos</STitle>
                    {analysis.plazos.map((p,i) => <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<analysis.plazos.length-1?"1px solid var(--bd)":"none"}}><span style={{fontSize:11,color:"var(--t3)"}}>{p.evento}</span><span style={{fontSize:11,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{p.fecha}</span></div>)}
                  </Card>}
                  {analysis.criterios?.length > 0 && <Card><STitle>Criterios de evaluación</STitle>
                    {analysis.criterios.map((c,i) => <div key={i} style={{padding:"9px 10px",borderRadius:8,background:"var(--s2)",marginBottom:4}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,fontWeight:700}}>{c.nombre}</span>{c.peso && <Badge color="var(--ac)" sm>{c.peso}</Badge>}</div>
                      <span style={{fontSize:10,color:"var(--t3)"}}>{c.detalle}</span>
                    </div>)}
                  </Card>}
                </div>}

                {/* Requisitos */}
                {tab === "requisitos" && <div>
                  <Card><STitle>Requisitos obligatorios</STitle>
                    {analysis.requisitos?.map((r,i) => <div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:i<analysis.requisitos.length-1?"1px solid var(--bd)":"none"}}>
                      <span style={{width:18,height:18,borderRadius:6,border:"2px solid rgba(0,214,143,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"var(--ac)",fontWeight:800,flexShrink:0,marginTop:1}}>{i+1}</span>
                      <span style={{fontSize:12,color:"var(--t2)",lineHeight:1.45}}>{r}</span>
                    </div>)}
                  </Card>
                  <Card><STitle>Documentos requeridos</STitle>
                    {analysis.documentos?.map((d,i) => <div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:i<analysis.documentos.length-1?"1px solid var(--bd)":"none"}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:2}}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/></svg>
                      <span style={{fontSize:12,color:"var(--t2)"}}>{d}</span>
                    </div>)}
                  </Card>
                  {analysis.barreras?.length > 0 && <Card><STitle color="var(--w)">Barreras de entrada</STitle>
                    {analysis.barreras.map((b,i) => <div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:i<analysis.barreras.length-1?"1px solid var(--bd)":"none"}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--w)" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:2}}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
                      <span style={{fontSize:12,color:"var(--t2)"}}>{b}</span>
                    </div>)}
                  </Card>}
                </div>}

                {/* Riesgos */}
                {tab === "riesgos" && <div>
                  {analysis.riesgos?.map((r,i) => <Card key={i}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <STitle color="var(--r)">Riesgo {i+1}</STitle>
                      <Badge color={r.impacto==="Alto"?"var(--r)":r.impacto==="Medio"?"var(--w)":"var(--ac)"} sm>{r.impacto}</Badge>
                    </div>
                    <p style={{fontSize:12,color:"var(--t2)",lineHeight:1.5,marginBottom:8}}>{r.riesgo}</p>
                    {r.mitigacion && <div style={{padding:"8px 10px",borderRadius:8,background:"rgba(0,214,143,.05)",border:"1px solid rgba(0,214,143,.12)"}}>
                      <span style={{fontSize:10,fontWeight:800,color:"var(--ac)"}}>MITIGACIÓN: </span>
                      <span style={{fontSize:11,color:"var(--t2)"}}>{r.mitigacion}</span>
                    </div>}
                  </Card>)}
                  {analysis.oportunidades?.length > 0 && <Card><STitle>Oportunidades</STitle>
                    {analysis.oportunidades.map((o,i) => <div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:i<analysis.oportunidades.length-1?"1px solid var(--bd)":"none"}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:2}}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                      <span style={{fontSize:12,color:"var(--t2)"}}>{o}</span>
                    </div>)}
                  </Card>}
                </div>}

                {/* Estrategia */}
                {tab === "estrategia" && <div>
                  <Card><STitle>Estrategia para ganar</STitle>
                    {analysis.estrategia?.map((s,i) => <div key={i} style={{display:"flex",gap:8,padding:"9px 0",borderBottom:i<analysis.estrategia.length-1?"1px solid var(--bd)":"none"}}>
                      <span style={{width:22,height:22,borderRadius:7,background:"rgba(0,214,143,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"var(--ac)",flexShrink:0}}>{i+1}</span>
                      <span style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{s}</span>
                    </div>)}
                  </Card>
                  <Card>
                    <h4 style={{fontSize:12,fontWeight:800,marginBottom:6,color:analysis.decision?.includes("NO")?"var(--r)":"var(--ac)"}}>DECISIÓN: {analysis.decision}</h4>
                    <p style={{fontSize:12,color:"var(--t2)",lineHeight:1.55}}>{analysis.justificacionDecision}</p>
                  </Card>
                  <Card style={{background:"var(--s2)"}}><STitle color="var(--t3)">Viabilidad</STitle>
                    <p style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{analysis.justificacionViabilidad}</p>
                  </Card>
                </div>}

                {/* Correo */}
                {tab === "correo" && analysis.correo && <Card>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <STitle>Correo de consulta</STitle>
                    <button onClick={() => copy(analysis.correo)} style={{background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:8,padding:"5px 12px",fontSize:10,fontWeight:700,color:"var(--t2)",cursor:"pointer"}}>
                      {copied ? "✓ Copiado" : "Copiar"}
                    </button>
                  </div>
                  <div style={{background:"var(--s2)",borderRadius:10,padding:14,fontFamily:"'JetBrains Mono',monospace",fontSize:11,lineHeight:1.7,color:"var(--t2)",whiteSpace:"pre-wrap"}}>{analysis.correo}</div>
                </Card>}

                {/* Re-analyze */}
                <button onClick={runAI} style={{width:"100%",padding:12,borderRadius:12,background:"var(--s2)",border:"1px solid var(--bd)",color:"var(--t3)",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:4}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                  Re-analizar
                </button>
              </div>
            ) : (
              <div style={{textAlign:"center",padding:48,color:"var(--r)"}}>Error al analizar. Verifique que Ollama esté corriendo.</div>
            )}
          </div>
        )}
      </div>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Header/><main style={{flex:1}}>{children}</main><BottomNav/>
    </div>
  );
}
