// Sog'liqni tekshirish — DB'siz, monitoring/keep-alive uchun.
export async function GET() {
  return Response.json({
    status: "ok",
    service: "Uvol Bo'lmasin",
    time: new Date().toISOString(),
  });
}
