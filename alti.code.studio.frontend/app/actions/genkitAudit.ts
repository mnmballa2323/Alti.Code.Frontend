"use server";

import { genkit, z } from "genkit";

// Initialize Google Genkit (Apache 2.0 Open Source SDK)
// This strictly enforces typed AI reasoning directly within the Next.js Server Action boundary.
const ai = genkit({
  model: "google-genai/gemini-pro",
});

/**
 * Executes a highly structured, observable Genkit Flow from the frontend.
 */
export async function runClientGenkitAudit(codeSnippet: string) {
  try {
    const auditSchema = z.object({
      isSafe: z
        .boolean()
        .describe("True if the code is entirely free of vulnerabilities."),
      vulnerabilityCount: z
        .number()
        .describe("Number of critical vulnerabilities found."),
      explanation: z
        .string()
        .describe("Detailed engineering analysis of the code."),
      suggestedFix: z
        .string()
        .describe("A secure refactor of the provided code.")
        .optional(),
    });

    // Define and execute a Genkit Flow inline for Next.js Server Actions
    const response = await ai.generate({
      prompt: `You are an elite Application Security Engineer. Audit the following codebase for vulnerabilities: \n\n${codeSnippet}`,
      output: { schema: auditSchema },
    });

    return { success: true, data: response.output };
  } catch (error: any) {
    console.error("❌ [Genkit Next] Failed to run Genkit Flow:", error);

    return { success: false, error: error.message };
  }
}
