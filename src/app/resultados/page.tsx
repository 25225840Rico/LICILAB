"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header, BottomNav, Card, Badge, Spinner } from "@/components/ui";
import { ESTADO, ESTADO_COLOR, TIPO, formatCLP, formatDate, todayDDMMYYYY } from "@/lib/types";
import { guardarLicitacion } from "@/lib/supabase";

function Content() {
  const params = useSearchParams();
  const [lics, setLics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setErr("");
      try {
        const sp = new URLSearchParams();
        const codigo = params.get("codigo");
        const fecha = params.get("fecha") || todayDDMMYYYY();
        const q = params.get("q");
        if (codigo) sp.set("codigo", codigo);
        else sp.set("fecha", fecha);

        const res = await fetch(`/api/licitaciones?${sp.toString()}`);
        const data = await res.json();
        if (data.error) { setErr(data.error); setLics([]); }
        else {
          let list = data.Listado || [];
          // Filtro texto client-side
          if (q) {
            const ql = q.toLowerCase();
            list = list.filter((l: any) =>
              (l.Nombre||"").toLowerCase().includes(ql) ||
              (l.Descripcion||"").toLowerCase().includes(ql) ||
              (l.CodigoExterno||"").toLowerCase().includes(ql) ||
              (l.Comprador?.NombreOrganismo||"").toLowerCase().includes(ql)
            );
          }
          setLics(list);
          if (!list.length) setErr("Sin resultados. Intenta otra fecha o código.");
          // Guardar en Supabase (background)
          list.slice(0, 20).forEach((l: any) => guardarLicitacion(l));
        }
      } catch (e: any) { setErr(e.message); }
      setLoading(false);
    })();
  }, [params]);

  return (
    <div style={{padding:16,maxWidth:520,margin:"0 auto",paddingBottom:80}}>
      <div style={{marginBottom:14}}>
        <h2 style={{fontSize:17,fontWeight:800}}>Resultados</h2>
        <p style={{fontSize:12,color:"var(--t3)"}}>{loading?"Buscando...":`${lics.length} licitaciones`}</p>
      </div>

      {loading && <Spinner text="Consultando Mercado Público..."/>}

      {err && !loading && (
        <div style={{padding:14,borderRadius:12,background:"rgba(255,92,92,.1)",border:"1px solid rgba(255,92,92,.2)",color:"var(--r)",fontSize:12,marginBottom:14}}>{err}</div>
      )}

      {!loading && lics.map((l: any, i: number) => (
        <Link key={i} href={`/licitacion/${encodeURIComponent(l.CodigoExterno)}`}
          className="anim-s" style={{display:"block",background:"var(--s1)",borderRadius:14,padding:15,border:"1px solid var(--bd)",marginBottom:8,transition:"all .2s",animationDelay:`${i*.04}s`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,flexWrap:"wrap",gap:4}}>
            <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"var(--ac)",fontWeight:700}}>{l.CodigoExterno}</span>
            <Badge color={ESTADO_COLOR[l.CodigoEstado]||"var(--t3)"} sm>{ESTADO[l.CodigoEstado]||`Estado ${l.CodigoEstado}`}</Badge>
          </div>
          <h3 style={{fontSize:13,fontWeight:700,lineHeight:1.35,marginBottom:6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{l.Nombre}</h3>
          <div style={{fontSize:10,color:"var(--t3)",marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.Comprador?.NombreOrganismo||"—"}</div>
          {l.Tipo && <div style={{fontSize:10,color:"var(--t2)",marginBottom:6}}>{TIPO[l.Tipo]||l.Tipo}</div>}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid var(--bd)"}}>
            <span style={{fontSize:11,color:"var(--t3)"}}>Cierre: {formatDate(l.Fechas?.FechaCierre||l.FechaCierre)}</span>
            {l.MontoEstimado>0 && <span style={{fontSize:11,fontWeight:800,color:"var(--ac)"}}>{formatCLP(l.MontoEstimado)}</span>}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Resultados() {
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Header/>
      <Suspense fallback={<Spinner/>}><Content/></Suspense>
      <BottomNav/>
    </div>
  );
}
