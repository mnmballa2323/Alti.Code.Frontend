import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  
  try {
    const host = request.headers.get("host") || "localhost:3000";
    
    // Fetch dynamic catalog from backend
    const res = await fetch(`${backendUrl}/discovery`, {
      headers: {
        Host: host,
        "Cache-Control": "no-cache"
      },
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      throw new Error(`Backend discovery returned status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  } catch (error: any) {
    console.error("Error fetching ARD catalog:", error);
    
    // Fallback catalog structure in case backend is offline
    const domain = request.headers.get("host")?.split(":")[0] || "alti.code.studio";
    const protocol = request.url.startsWith("https") ? "https" : "http";
    const baseUrl = `${protocol}://${domain}`;

    const fallbackCatalog = {
      specVersion: "1.0",
      host: {
        displayName: "Alti.Code.Studio",
        identifier: `did:web:${domain}`,
        documentationUrl: `${baseUrl}/docs`
      },
      entries: [
        {
          identifier: `urn:air:${domain}:agent:architect`,
          displayName: "Architect Agent",
          type: "application/x-agent+json",
          url: `${backendUrl}/agents/status`,
          capabilities: ["system_architecture", "agentic_coordination"],
          representativeQueries: ["ask the architect agent for system design assistance"]
        }
      ]
    };

    return NextResponse.json(fallbackCatalog, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    });
  }
}
