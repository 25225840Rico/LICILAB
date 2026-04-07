// Tipos y constantes de LICILAB

export interface Licitacion {
  CodigoExterno: string;
  Nombre: string;
  CodigoEstado: number;
  Descripcion?: string;
  Tipo?: string;
  Moneda?: string;
  Etapas?: number;
  MontoEstimado?: number;
  TipoConvocatoria?: number;
  FechaCierre?: string;
  Comprador?: {
    CodigoOrganismo?: string;
    NombreOrganismo?: string;
    RutUnidad?: string;
    NombreUnidad?: string;
    DireccionUnidad?: string;
    ComunaUnidad?: string;
    RegionUnidad?: string;
  };
  Fechas?: {
    FechaCreacion?: string;
    FechaCierre?: string;
    FechaPublicacion?: string;
    FechaAdjudicacion?: string;
    FechaEstimadaAdjudicacion?: string;
    FechaActoAperturaTecnica?: string;
    FechaActoAperturaEconomica?: string;
    FechaVisitaTerreno?: string;
    FechaEntregaAntecedentes?: string;
    FechaInicio?: string;
    FechaFinal?: string;
    FechaPubRespuestas?: string;
  };
  Items?: {
    Cantidad: number;
    Listado?: Array<{
      Correlativo?: number;
      NombreProducto?: string;
      Descripcion?: string;
      Categoria?: string;
      CodigoCategoria?: string;
      Cantidad?: number;
      UnidadMedida?: string;
    }>;
  };
  Adjudicacion?: {
    Tipo?: number;
    Fecha?: string;
    Numero?: string;
    NumeroOferentes?: number;
    UrlActa?: string;
  };
}

export interface Analisis {
  resumen: string;
  objeto: string;
  requisitos: string[];
  documentos: string[];
  criterios: Array<{ nombre: string; peso: string; detalle: string }>;
  plazos: Array<{ fecha: string; evento: string }>;
  riesgos: Array<{ riesgo: string; impacto: string; mitigacion: string }>;
  barreras: string[];
  oportunidades: string[];
  score: number;
  viabilidad: string;
  justificacionViabilidad: string;
  estrategia: string[];
  decision: string;
  justificacionDecision: string;
  correo: string;
}

export const ESTADO: Record<number, string> = {
  5:"Publicada",6:"Cerrada",7:"Desierta",8:"Adjudicada",
  15:"Revocada",16:"Suspendida",18:"Readjudicada",19:"En evaluación",
};

export const ESTADO_COLOR: Record<number, string> = {
  5:"#10B981",6:"#F59E0B",7:"#EF4444",8:"#3B82F6",
  15:"#EF4444",16:"#F59E0B",18:"#8B5CF6",19:"#F59E0B",
};

export const TIPO: Record<string, string> = {
  L1:"Pública < 100 UTM",LE:"Pública 100–1.000 UTM",LP:"Pública 1.000–2.000 UTM",
  LQ:"Pública 2.000–5.000 UTM",LR:"Pública ≥ 5.000 UTM",E2:"Privada < 100 UTM",
  CO:"Privada 100–1.000 UTM",B2:"Privada 1.000–2.000 UTM",
  H2:"Privada 2.000–5.000 UTM",I2:"Privada > 5.000 UTM",
  LS:"Serv. personales especializados",
};

export const MODALIDAD_PAGO: Record<number, string> = {
  1:"Pago a 30 días",2:"Pago a 30, 60, 90 días",3:"Pago al día",
  4:"Anual",5:"Bimensual",6:"Contra entrega",7:"Mensual",
  8:"Por avance",9:"Trimestral",10:"Pago a 60 días",
};

export function formatCLP(n?: number | null): string {
  if (!n || isNaN(n)) return "No especificado";
  return "$" + Number(n).toLocaleString("es-CL");
}

export function formatDate(d?: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("es-CL", { day:"2-digit", month:"short", year:"numeric" });
  } catch { return d; }
}

export function dateToDDMMYYYY(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}${m}${y}`;
}

export function todayDDMMYYYY(): string {
  const n = new Date();
  return `${String(n.getDate()).padStart(2,"0")}${String(n.getMonth()+1).padStart(2,"0")}${n.getFullYear()}`;
}
