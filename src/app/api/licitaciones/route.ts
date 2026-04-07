import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.mercadopublico.cl/servicios/v1/publico";
const TICKET = process.env.CHILECOMPRA_TICKET || "0270331F-17BF-4BC7-96D6-74D6CCF7799D";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const codigo = searchParams.get("codigo");
  const fecha = searchParams.get("fecha");
  const estado = searchParams.get("estado");
  const organismo = searchParams.get("organismo");

  let url = `${BASE}/licitaciones.json?ticket=${TICKET}`;
  if (codigo) url += `&codigo=${codigo}`;
  if (fecha) url += `&fecha=${fecha}`;
  if (estado) url += `&estado=${estado}`;
  if (organismo) url += `&CodigoOrganismo=${organismo}`;

  try {
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `API Mercado Público: HTTP ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error conectando con API" }, { status: 500 });
  }
}
