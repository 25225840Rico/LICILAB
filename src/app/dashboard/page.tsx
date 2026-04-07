"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Header, BottomNav, Spinner } from "@/components/ui";
import { obtenerGuardadas } from "@/lib/supabase";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const d = await obtenerGuardadas(30);
      setData(d);
      setLoading(false);
    })();
  }, []);

  const sorted = [...data].sort((a, b) => (b.analisis?.[0]?.score || 0) - (a.analisis?.[0]?.score || 0));

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Header/>
      <main style={{flex:1,padding:16,maxWidth:520,margin:"0 auto",width:"100%",paddingBottom:80}}>
        <h2 style={{fontSize:17,fontWeight:800,marginBottom:2}}>Dashboard</h2>
        <p style={{fontSize:12,color:"var(--t3)",marginBottom:16}}>Ranking de oportunidades analizadas</p>

        {loading ? <Spinner/> : data.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 16px"}}>
            <div style={{width:60,height:60,borderRadius:16,margin:"0 auto 14px",background:"var(--s2)",border:"1px solid var(--bd)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            </div>
            <p style={{fontSize:13,color:"var(--t2)",marginBottom:4}}>Sin datos aún</p>
            <p style={{fontSize:11,color:"var(--t3)",marginBottom:12}}>Busca y analiza licitaciones para ver el ranking.</p>
            <p style={{fontSize:11,color:"var(--t3)"}}>Nota: Requiere Supabase configurado en .env.local</p>
            <Link href="/" style={{fontSize:12,fontWeight:700,color:"var(--ac)",marginTop:12,display:"inline-block"}}>Ir a buscar →</Link>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {sorted.map((lic, i) => {
              const score = lic.analisis?.[0]?.score || 0;
              const decision = lic.analisis?.[0]?.decision || "";
              const c = score >= 65 ? "var(--ac)" : score >= 40 ? "var(--w)" : "var(--r)";
              return (
                <Link key={lic.id} href={`/licitacion/${encodeURIComponent(lic.codigo)}`}
                  className="anim-s" style={{display:"flex",alignItems:"center",gap:12,background:"var(--s1)",borderRadius:14,padding:"12px 14px",border:"1px solid var(--bd)",animationDelay:`${i*.04}s`}}>
                  <div style={{width:28,height:28,borderRadius:8,background:"var(--s2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"var(--t3)",flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lic.nombre}</div>
                    <div style={{fontSize:10,color:"var(--t3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:2}}>{lic.organismo||"—"}</div>
                  </div>
                  {score > 0 && <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:18,fontWeight:900,color:c}}>{score}</div>
                    {decision && <div style={{fontSize:8,fontWeight:800,color:c}}>{decision}</div>}
                  </div>}
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav/>
    </div>
  );
}
