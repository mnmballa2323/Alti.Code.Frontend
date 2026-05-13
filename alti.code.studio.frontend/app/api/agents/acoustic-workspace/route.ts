import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio") as Blob;

    if (!audioBlob) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 },
      );
    }

    // Phase 46: Forward the audio blob to the Alti.Code.Studio backend
    // The backend will transcribe via Whisper and trigger a graph.orchestrator.js sprint
    const backendFormData = new FormData();

    backendFormData.append("audio", audioBlob, "command.webm");

    const backendRes = await fetch(
      "http://localhost:3000/api/internal/acoustic-workspace",
      {
        method: "POST",
        body: backendFormData,
      },
    );

    if (!backendRes.ok)
      throw new Error("Backend failed to process acoustic command");

    const data = await backendRes.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
