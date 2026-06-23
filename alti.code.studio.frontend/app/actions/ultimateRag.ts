"use server";

/**
 * Server Action: Triggers the backend's Ultimate Azure RAG Sequence.
 * This connects the Next.js frontend to the multi-modal Azure OpenAI + Cosmos DB + Azure CLI orchestration loop.
 */
export async function queryUltimateRAG(
  query: string,
  mode?: string,
  domain?: string,
  language?: string,
) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    const response = await fetch(`${backendUrl}/rag/ultimate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, mode, domain, language }),
    });

    if (!response.ok) {
      throw new Error(`Ultimate RAG API returned status: ${response.status}`);
    }

    const result = await response.json();

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("❌ [Frontend] Ultimate RAG Sequence failed:", error.message);

    return { success: false, error: error.message };
  }
}
