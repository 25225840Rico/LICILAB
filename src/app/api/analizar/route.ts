import { NextRequest, NextResponse } from "next/server";

const OLLAMA = process.env.OLLAMA_URL || "http://localhost:11434";

const SYSTEM = `Eres un analista experto en licitaciones públicas chilenas (ChileCompra/MercadoPúblico).
Analiza la licitación proporcionada y responde ÚNICAMENTE con un JSON válido.
NO uses markdown, NO uses backticks, NO agregues texto antes ni después del JSON.

El JSON debe tener EXACTAMENTE esta estructura:
{
  "resumen": "Resumen ejecutivo en 3-5 oraciones claras",
  "objeto": "Descripción del objeto de la licitación",
  "requisitos": ["requisito obligatorio 1", "requisito 2", "..."],
  "documentos": ["documento requerido 1", "documento 2", "..."],
  "criterios": [{"nombre": "Criterio", "peso": "XX%", "detalle": "explicación"}],
  "plazos": [{"fecha": "dd mmm yyyy", "evento": "descripción"}],
  "riesgos": [{"riesgo": "descripción", "impacto": "Alto/Medio/Bajo", "mitigacion": "acción concreta"}],
  "barreras": ["barrera de entrada 1", "..."],
  "oportunidades": ["oportunidad 1", "..."],
  "score": 65,
  "viabilidad": "Alta/Media/Baja",
  "justificacionViabilidad": "explicación del score",
  "estrategia": ["acción estratégica 1", "acción 2", "..."],
  "decision": "POSTULAR o NO POSTULAR",
  "justificacionDecision": "razón clara de la decisión",
  "correo": "texto del correo de consulta si hay ambigüedades, o cadena vacía si no aplica"
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const texto = body.texto || JSON.stringify(body.licitacion, null, 2);

    if (!texto) {
      return NextResponse.json({ error: "Se requiere texto o licitacion" }, { status: 400 });
    }

    // Intentar Ollama
    try {
      const ollamaRes = await fetch(`${OLLAMA}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.1:8b",
          prompt: `${SYSTEM}\n\nAnaliza esta licitación chilena:\n\n${texto.substring(0, 12000)}`,
          stream: false,
          options: { temperature: 0.2, num_predict: 4000, num_ctx: 8192 },
        }),
        signal: AbortSignal.timeout(120000),
      });

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        const raw = (data.response || "").trim();
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          return NextResponse.json(parsed);
        }
      }
    } catch (ollamaErr) {
      console.log("Ollama no disponible, usando fallback:", (ollamaErr as Error).message);
    }

    // Fallback: análisis heurístico
    const lic = body.licitacion || {};
    return NextResponse.json(buildFallback(lic));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function buildFallback(lic: any) {
  const org = lic?.Comprador?.NombreOrganismo || "No especificado";
  const nombre = lic?.Nombre || "";
  const desc = (lic?.Descripcion || "").substring(0, 400);
  let sc = 55;
  if (lic?.CodigoEstado == 5) sc += 12;
  if (lic?.MontoEstimado && lic.MontoEstimado < 50000000) sc += 8;
  if (["L1", "LE"].includes(lic?.Tipo)) sc += 5;
  sc = Math.min(sc, 90);

  const fd = (d: string) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  return {
    resumen: `Licitación "${nombre}" publicada por ${org}. ${desc || "Sin descripción detallada disponible en los metadatos."} Análisis generado sin IA (Ollama no conectado). Para análisis profundo, asegúrese de tener Ollama corriendo.`,
    objeto: desc || nombre,
    requisitos: ["Inscripción vigente en ChileProveedores", "Sin deudas laborales ni previsionales vigentes", "Declaración jurada simple de habilidad para contratar", "Garantía de seriedad de la oferta (si aplica)", "Certificados tributarios al día (F30 y F30-1)"],
    documentos: ["Formulario de identificación del oferente", "Declaración jurada simple (Anexo)", "Certificado de deudas laborales y previsionales", "Propuesta técnica según formato de bases", "Propuesta económica según formato requerido", "Experiencia acreditable (contratos, OC, facturas)"],
    criterios: [{ nombre: "Precio", peso: "40-60%", detalle: "Fórmula de puntaje inversamente proporcional" }, { nombre: "Experiencia", peso: "20-30%", detalle: "Experiencia verificable en trabajos similares" }, { nombre: "Calidad técnica", peso: "15-25%", detalle: "Propuesta metodológica y equipo de trabajo" }],
    plazos: [
      lic?.Fechas?.FechaCierre ? { fecha: fd(lic.Fechas.FechaCierre)!, evento: "Cierre recepción de ofertas" } : null,
      lic?.Fechas?.FechaEstimadaAdjudicacion ? { fecha: fd(lic.Fechas.FechaEstimadaAdjudicacion)!, evento: "Adjudicación estimada" } : null,
      lic?.Fechas?.FechaFinal ? { fecha: fd(lic.Fechas.FechaFinal)!, evento: "Fin período de consultas" } : null,
      lic?.Fechas?.FechaVisitaTerreno ? { fecha: fd(lic.Fechas.FechaVisitaTerreno)!, evento: "Visita a terreno" } : null,
    ].filter(Boolean),
    riesgos: [
      { riesgo: "Plazos ajustados para preparación de oferta completa", impacto: "Medio", mitigacion: "Preparar documentación base estándar con anticipación" },
      { riesgo: "Requisitos técnicos específicos pueden no estar detallados en los metadatos", impacto: "Alto", mitigacion: "Descargar bases completas y consultar al organismo" },
      { riesgo: "Competencia de proveedores establecidos con historial en el organismo", impacto: "Medio", mitigacion: "Diferenciarse por precio competitivo y propuesta técnica sólida" },
    ],
    barreras: ["Experiencia previa específica requerida", "Garantías financieras obligatorias", "Posibles requisitos de infraestructura o personal dedicado"],
    oportunidades: ["Organismo público con compras recurrentes", "Posibilidad de renovación contractual", "Visibilidad para futuras licitaciones del mismo organismo"],
    score: sc,
    viabilidad: sc >= 65 ? "Alta" : sc >= 40 ? "Media" : "Baja",
    justificacionViabilidad: `Score ${sc}/100. Análisis heurístico basado en metadatos disponibles. Para mayor precisión, conecte Ollama y analice las bases completas.`,
    estrategia: ["Descargar y revisar bases administrativas y técnicas completas", "Preparar propuesta económica competitiva basada en precios de mercado", "Acreditar experiencia relevante con contratos u OC anteriores", "Usar el período de consultas para aclarar cualquier ambigüedad", "Completar toda la documentación antes del cierre"],
    decision: sc >= 50 ? "POSTULAR" : "NO POSTULAR",
    justificacionDecision: sc >= 50 ? "Condiciones favorables según datos disponibles. Se recomienda revisar bases completas antes de confirmar." : "Riesgos y barreras superan oportunidades identificadas en los metadatos.",
    correo: "",
  };
}
