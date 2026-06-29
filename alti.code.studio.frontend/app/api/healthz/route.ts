import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let backendHealthy = false;

  try {
    const response = await fetch(`${backendUrl}/healthz`, { cache: 'no-store' });
    if (response.ok) {
      backendHealthy = true;
    }
  } catch (error) {
    console.error("Backend health check failed:", error);
  }

  const status = backendHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: backendHealthy ? "OK" : "DEGRADED",
      backend: backendHealthy ? "UP" : "DOWN",
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
