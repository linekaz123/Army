import { NextResponse } from "next/server";
import { analyzeFood, isGeminiConfigured } from "@/lib/gemini";

const MAX_BASE64_LENGTH = 6_000_000; // ~4.5MB decoded, keeps us under typical function payload limits

export async function POST(request: Request) {
  if (!isGeminiConfigured()) {
    return NextResponse.json(
      {
        error:
          "AI scanning isn't configured yet. Add a free GEMINI_API_KEY from Google AI Studio to .env.local, or log this meal with Quick Log instead.",
      },
      { status: 501 }
    );
  }

  let body: {
    imageBase64?: string;
    mimeType?: string;
    hint?: string;
    text?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    if (body.imageBase64) {
      if (body.imageBase64.length > MAX_BASE64_LENGTH) {
        return NextResponse.json(
          { error: "That photo is too large. Try a smaller or recompressed image." },
          { status: 413 }
        );
      }
      const result = await analyzeFood({
        kind: "image",
        base64: body.imageBase64,
        mimeType: body.mimeType || "image/jpeg",
        hint: body.hint,
      });
      return NextResponse.json(result);
    }

    if (body.text && body.text.trim().length > 0) {
      const result = await analyzeFood({ kind: "text", description: body.text.trim() });
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Send an image (imageBase64) or a text description." },
      { status: 400 }
    );
  } catch (err) {
    console.error("analyze-food error", err);
    return NextResponse.json(
      { error: "The AI scanner hiccuped. Please try again or log it manually." },
      { status: 500 }
    );
  }
}
