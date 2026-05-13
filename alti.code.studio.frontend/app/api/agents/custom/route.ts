import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate payload
    if (!data.name || !data.preamble) {
      return NextResponse.json(
        { error: "Name and preamble are required" },
        { status: 400 },
      );
    }

    // Phase 44: Write the new agent to a shared volume or backend directory
    // This assumes the backend and frontend are running on the same machine/filesystem for testing
    const backendAgentsPath = path.resolve(
      process.cwd(),
      "../alti.code.studio.backend/src/app/modules/agents/custom",
    );

    // Ensure directory exists
    if (!fs.existsSync(backendAgentsPath)) {
      fs.mkdirSync(backendAgentsPath, { recursive: true });
    }

    // Write a .json definition that the backend `capability.router.js` dynamic ingester will pick up
    const agentDefinitionFile = path.join(
      backendAgentsPath,
      `${data.name}.json`,
    );

    fs.writeFileSync(
      agentDefinitionFile,
      JSON.stringify(
        {
          ...data,
          tier: data.tier || "Tier 21",
          version: "1.0.0",
          createdAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );

    // Phase 45 (Trigger): If we had a live HTTP webhook to the backend, we would ping it here.
    // For now, the backend will watch the directory or poll it.
    try {
      // Best effort ping to backend
      fetch("http://localhost:3000/api/internal/agents/reload", {
        method: "POST",
      }).catch(() => {});
    } catch {
      // Ignore webhook errors
    }

    return NextResponse.json(
      { success: true, agent: data.name },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
