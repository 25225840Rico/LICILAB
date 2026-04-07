"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Header ──
export function Header() {
  return (
    <header style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px",borderBottom:"1px solid var(--bd)",background:"var(--s1)",position:"sticky",top:0,zIndex:50}}>
      <Link href="/" style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,var(--ac),var(--acd))",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        </div>
        <span style={{fontSize:17,fontWeight:900,letterSpacing:"-.02em",background:"linear-gradient(135deg,var(--ac),#6EE7B7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>LICILAB</span>
      </Link>
      <div style={{flex:1}}/>
      <span style={{fontSize:9,color:"var(--t3)",fontWeight:700,background:"var(--s2)",padding:"3px 10px",borderRadius:6,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".08em"}}>LIVE</span>
    </header>
  );
}

// ── Bottom Nav ──
export function BottomNav() {
  const path = usePathname();
  const items = [
    {href:"/",label:"Inicio",d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"},
    {href:"/resultados",label:"Buscar",d:"M11 11m-8 0a8 8 0 1 0 16 0 8 8 0 1 0-16 0M21 21l-4.3-4.3"},
    {href:"/dashboard",label:"Panel",d:"M3 3v18h18M19 9l-5 5-4-4-3 3"},
  ];
  return (
    <nav style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,display:"flex",justifyContent:"space-around",alignItems:"center",padding:"7px 0 max(10px, env(safe-area-inset-bottom))",borderTop:"1px solid var(--bd)",background:"var(--s1)"}}>
      {items.map(n=>(
        <Link key={n.href} href={n.href} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,color:path===n.href?"var(--ac)":"var(--t3)",padding:"3px 16px",transition:"color .2s"}}>
          <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{n.d.split(/(?=M)/g).map((p,i)=><path key={i} d={p}/>)}</svg>
          <span style={{fontSize:9,fontWeight:700}}>{n.label}</span>
        </Link>
      ))}
    </nav>
  );
}

// ── Card ──
export function Card({children,style,...p}: React.HTMLAttributes<HTMLDivElement>) {
  return <div style={{background:"var(--s1)",borderRadius:16,padding:18,border:"1px solid var(--bd)",marginBottom:10,...style}} {...p}>{children}</div>;
}

// ── Badge ──
export function Badge({children,color="var(--ac)",sm}: {children:React.ReactNode;color?:string;sm?:boolean}) {
  return <span style={{display:"inline-flex",alignItems:"center",padding:sm?"2px 8px":"4px 12px",borderRadius:999,fontSize:sm?10:11,fontWeight:700,background:color+"18",color,border:`1px solid ${color}25`,letterSpacing:".02em"}}>{children}</span>;
}

// ── Score Ring ──
export function ScoreRing({score,size=88}: {score:number;size?:number}) {
  const c = score>=65?"var(--ac)":score>=40?"var(--w)":"var(--r)";
  const circ = 2*Math.PI*36;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} viewBox="0 0 88 88" style={{transform:"rotate(-90deg)"}}>
        <circle cx="44" cy="44" r="36" fill="none" stroke="var(--bd)" strokeWidth="5"/>
        <circle cx="44" cy="44" r="36" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ-(score/100)*circ} style={{transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:size*.3,fontWeight:900,color:c,lineHeight:1}}>{score}</span>
        <span style={{fontSize:8,color:"var(--t3)",fontWeight:700,letterSpacing:".1em",marginTop:2}}>SCORE</span>
      </div>
    </div>
  );
}

// ── Section Title ──
export function STitle({children,color="var(--ac)"}: {children:React.ReactNode;color?:string}) {
  return <h4 style={{fontSize:11,fontWeight:800,color,marginBottom:10,letterSpacing:".06em",textTransform:"uppercase"}}>{children}</h4>;
}

// ── Spinner ──
export function Spinner({text="Cargando..."}: {text?:string}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:48}}>
      <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      <span style={{color:"var(--t2)",fontSize:13}}>{text}</span>
    </div>
  );
}
