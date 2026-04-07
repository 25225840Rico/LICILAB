"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header, BottomNav } from "@/components/ui";
import { dateToDDMMYYYY, todayDDMMYYYY } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [fecha, setFecha] = useState("");
  const [q, setQ] = useState("");

  const buscar = () => {
    const p = new URLSearchParams();
    if (codigo.trim()) p.set("codigo", codigo.trim());
    else p.set("fecha", fecha ? dateToDDMMYYYY(fecha) : todayDDMMYYYY());
    if (q.trim()) p.set("q", q.trim());
    router.push(`/resultados?${p.toString()}`);
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Header/>
      <main style={{flex:1,padding:16,maxWidth:520,margin:"0 auto",width:"100%",paddingBottom:80}}>
        {/* Hero */}
        <div className="anim-f" style={{textAlign:"center",padding:"36px 12px 24px"}}>
          <div style={{width:68,height:68,borderRadius:18,margin:"0 auto 16px",background:"rgba(0,214,143,.08)",border:"1px solid rgba(0,214,143,.2)",display:"flex",alignItems:"center",justifyContent:"center",animation:"glow 3s ease-in-out infinite"}}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
              <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
            </svg>
          </div>
          <h1 style={{fontSize:26,fontWeight:900,letterSpacing:"-.03em",marginBottom:6,lineHeight:1.1}}>
            Inteligencia de<br/><span style={{color:"var(--ac)"}}>Licitaciones</span>
          </h1>
          <p style={{color:"var(--t2)",fontSize:13,lineHeight:1.5,maxWidth:340,margin:"0 auto"}}>
            Busca en Mercado Público, analiza con IA local y decide en segundos.
          </p>
        </div>

        {/* Search */}
        <div className="anim-s" style={{background:"var(--s1)",borderRadius:16,padding:20,border:"1px solid var(--bd)"}}>
          <Field label="Código licitación" mono>
            <input value={codigo} onChange={e=>setCodigo(e.target.value)} onKeyDown={e=>e.key==="Enter"&&buscar()} placeholder="Ej: 1057986-22-LE24" style={inputStyle}/>
          </Field>
          <Field label="Fecha publicación">
            <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={inputStyle}/>
          </Field>
          <Field label="Filtrar por texto">
            <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&buscar()} placeholder="Nombre, descripción, organismo..." style={inputStyle}/>
          </Field>
          <button onClick={buscar} style={{width:"100%",padding:"14px 24px",borderRadius:14,background:"var(--ac)",color:"#000",fontWeight:800,fontSize:15,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Buscar Licitaciones
          </button>
        </div>

        {/* Features */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:12}} className="anim-s">
          {[{l:"API Oficial",s:"MercadoPúblico",d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"},
            {l:"IA Ollama",s:"llama3.1 local",d:"M13 2 3 14h9l-1 8 10-12h-9l1-8z"},
            {l:"Decisión",s:"Instantánea",d:"M12 12m-10 0a10 10 0 1 0 20 0 10 10 0 1 0-20 0M12 12m-6 0a6 6 0 1 0 12 0 6 6 0 1 0-12 0M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0"}
          ].map((f,i)=>(
            <div key={i} style={{background:"var(--s1)",borderRadius:12,padding:"14px 10px",border:"1px solid var(--bd)",textAlign:"center"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" style={{margin:"0 auto 4px",display:"block"}}><path d={f.d}/></svg>
              <div style={{fontSize:11,fontWeight:800}}>{f.l}</div>
              <div style={{fontSize:9,color:"var(--t3)",marginTop:2}}>{f.s}</div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav/>
    </div>
  );
}

function Field({label,children,mono}:{label:string;children:React.ReactNode;mono?:boolean}) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{fontSize:10,fontWeight:700,color:"var(--t3)",marginBottom:5,display:"block",letterSpacing:".06em",textTransform:"uppercase"}}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width:"100%",padding:"11px 14px",borderRadius:10,background:"var(--s2)",
  border:"1px solid var(--bd)",color:"var(--t1)",fontSize:14,outline:"none",
};
