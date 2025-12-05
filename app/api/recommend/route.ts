import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { symptomText, selectedTags, language } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = language === "FR" 
      ? `Tu es un assistant qui aide les Montréalais à naviguer le système de santé du Québec. 
Analyse la description de symptômes suivante et génère des recommandations de soins personnalisées.

Description: "${symptomText}"
Tags sélectionnés: ${selectedTags.join(", ") || "Aucun"}

Génère une réponse JSON avec 3 options de soins (GAP, CLSC, Pharmacie) dans cet ordre de priorité.
Pour chaque option, fournis:
- priority: nombre de 1-3 (1 = meilleur match)
- why: explication personnalisée en français expliquant pourquoi cette option correspond à leur besoin spécifique (2-3 phrases max)
- waitTime: estimation réaliste
- cost: "Couvert RAMQ" ou "Variable"

Format JSON:
{
  "options": [
    {
      "id": "gap",
      "priority": 1,
      "why": "...",
      "waitTime": "...",
      "cost": "..."
    },
    {
      "id": "clsc", 
      "priority": 2,
      "why": "...",
      "waitTime": "...",
      "cost": "..."
    },
    {
      "id": "pharmacy",
      "priority": 3,
      "why": "...",
      "waitTime": "...",
      "cost": "..."
    }
  ]
}

IMPORTANT: 
- Ne pose JAMAIS de diagnostic médical
- Base-toi uniquement sur la navigation vers les bons services
- Si c'est clairement un renouvellement de prescription, priorise la pharmacie
- Si c'est urgent ou grave, mentionne l'urgence mais garde les 3 options
- Réponds UNIQUEMENT en JSON valide, sans markdown`
      : `You are an assistant helping Montrealers navigate Québec's healthcare system.
Analyze the following symptom description and generate personalized care recommendations.

Description: "${symptomText}"
Selected tags: ${selectedTags.join(", ") || "None"}

Generate a JSON response with 3 care options (GAP, CLSC, Pharmacy) in priority order.
For each option, provide:
- priority: number 1-3 (1 = best match)
- why: personalized explanation in English explaining why this option matches their specific need (2-3 sentences max)
- waitTime: realistic estimate
- cost: "RAMQ covered" or "Variable"

JSON format:
{
  "options": [
    {
      "id": "gap",
      "priority": 1,
      "why": "...",
      "waitTime": "...",
      "cost": "..."
    },
    {
      "id": "clsc",
      "priority": 2,
      "why": "...",
      "waitTime": "...",
      "cost": "..."
    },
    {
      "id": "pharmacy",
      "priority": 3,
      "why": "...",
      "waitTime": "...",
      "cost": "..."
    }
  ]
}

IMPORTANT:
- NEVER provide medical diagnosis
- Base recommendations only on navigation to appropriate services
- If it's clearly a prescription renewal, prioritize pharmacy
- If urgent or serious, mention emergency but keep the 3 options
- Respond ONLY in valid JSON, no markdown`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response (remove markdown code blocks if present)
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const recommendations = JSON.parse(jsonText);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


