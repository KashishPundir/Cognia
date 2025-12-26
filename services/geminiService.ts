
import { GoogleGenAI, Type } from "@google/genai";
import { DatasetContext, AnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `You are a Senior Professional Data Analyst. 
Your primary purpose is to deliver accurate, responsible, and human-like data analysis answers in natural language.

STRICT FORMATTING RULES:
1. NEVER use bold markdown (e.g., **text**) or italics in the "detailedExplanation". Use plain, professional text with clear paragraph spacing.
2. The "detailedExplanation" must ONLY contain analytical narrative and findings. 
3. DO NOT include limitations, risks, or suggestions inside the "detailedExplanation". Use the specific fields provided in the schema for those.
4. Ensure the narrative is calm, objective, and structured for an executive audience.

ANALYTICAL THINKING PROCESS:
- Understand intent, map columns, select approach, validate quality, execute logic, interpret cautiously, and communicate simply.

STRICT ANALYSIS RULES:
- Use ONLY the provided dataset metadata and global statistics.
- Distinguish correlation from causation.
- Do NOT provide medical, legal, or financial advice.

RESPONSE STRUCTURE (JSON ONLY):
- "directAnswer": One high-impact summary sentence.
- "detailedExplanation": 2-3 paragraphs of pure analytical narrative. NO BOLDING.
- "pythonCode": Clean pandas/numpy code for transparency.
- "attributesUsed": Array of columns analyzed.
- "keyFactors": Notable variables and their observed values.
- "limitations": Specific data gaps or contextual constraints.
- "furtherAnalysis": Proactive next steps or deeper inquiries.`;

export const analyzeData = async (
  question: string,
  context: DatasetContext
): Promise<AnalysisResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          text: `DATASET CONTEXT:
- Total Records: ${context.rowCount}
- Attributes: ${context.columnNames.join(", ")}
- Stats: ${JSON.stringify(context.summaryStats)}

USER DIRECTIVE: "${question}"

Provide a professional analysis without any bold markdown formatting in the explanation.`
        }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            directAnswer: { type: Type.STRING },
            detailedExplanation: { type: Type.STRING },
            pythonCode: { type: Type.STRING },
            attributesUsed: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            keyFactors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  factor: { type: Type.STRING },
                  value: { type: Type.STRING }
                },
                required: ["factor", "value"]
              }
            },
            limitations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            furtherAnalysis: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["directAnswer", "detailedExplanation", "pythonCode", "attributesUsed"]
        }
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return parsed as AnalysisResponse;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Analytical logic core failed to process the request. Ensure data integrity.");
  }
};
