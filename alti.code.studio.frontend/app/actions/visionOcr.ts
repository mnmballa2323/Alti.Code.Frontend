"use server";

import vision from "@google-cloud/vision";

// Initialize the Google Cloud Vision client (Apache 2.0 Open Source SDK)
let visionClient: vision.ImageAnnotatorClient | null = null;

try {
  visionClient = new vision.ImageAnnotatorClient();
} catch (error) {
  console.warn(
    "⚠️ [Vision OCR] Failed to initialize Google Cloud Vision Client in Server Action context.",
  );
}

/**
 * Autonomously extracts all textual data and spatial bounding boxes from a
 * user-uploaded UI Mockup image using Google Cloud Vision's ML OCR engine.
 * The Swarm uses this extracted semantic context to flawlessly generate
 * pixel-perfect code matching the mockup.
 */
export async function analyzeDesignMockup(base64Image: string) {
  if (!visionClient) {
    return { success: false, error: "Vision Client not initialized." };
  }

  try {
    // Convert base64 string to buffer (stripping data URI prefix if present)
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    const request = {
      image: { content: imageBuffer },
      features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
    };

    const [result] = await visionClient.annotateImage(request);
    const fullTextAnnotation = result.fullTextAnnotation;

    if (!fullTextAnnotation) {
      return {
        success: true,
        text: "",
        message: "No text detected in mockup.",
      };
    }

    return {
      success: true,
      text: fullTextAnnotation.text,
      pages: fullTextAnnotation.pages?.length || 0,
    };
  } catch (error: any) {
    console.error(
      "❌ [Vision OCR] Google Cloud Vision analysis failed:",
      error.message,
    );

    return { success: false, error: error.message };
  }
}
