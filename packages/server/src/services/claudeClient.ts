import Anthropic from "@anthropic-ai/sdk";
import { ReportSchema, type ReportData } from "../schemas/biomarker.js";

function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

const EXTRACTION_PROMPT = `You are a medical lab report data extraction assistant. You will receive raw text extracted from a lab report PDF. Your job is to:

1. Extract patient metadata: name (if visible), date of birth, sex, blood type, report date.
2. Calculate the patient's age from their date of birth and the report date.
3. Extract EVERY biomarker from the report. For each biomarker extract:
   - Original name (as it appears in the report)
   - English standardized name
   - Value (numeric, preserve precision)
   - Original unit
   - Standardized unit (use international standard units)
   - Reference range minimum (if provided)
   - Reference range maximum (if provided)
   - Category (e.g., "Complete Blood Count", "Lipid Panel", "Renal Function", "Glucose Metabolism", "Proteins", "Immunohematology", "Liver Function", "Thyroid Function", "Vitamins", "Inflammation Markers")
4. If a value has a qualifier like "<" or ">", note it in a "qualifier" field.

IMPORTANT:
- Translate all biomarker names from Spanish to English medical terminology.
- Standardize units (e.g., x10⁶/mm³ → 10⁶/µL, x10³/mm³ → 10³/µL, g/dL stays g/dL).
- For percentage biomarkers (like Neutrophils %), extract both the percentage and absolute count as separate biomarkers if both are present.
- Do NOT classify results — only extract raw data.
- Respond with ONLY valid JSON, no markdown, no explanation.

Expected JSON structure:
{
  "patient": {
    "dateOfBirth": "YYYY-MM-DD",
    "age": <number>,
    "sex": "male" or "female",
    "bloodType": "A" or "B" or "AB" or "O" (optional),
    "rhFactor": "+" or "-" (optional),
    "reportDate": "YYYY-MM-DD"
  },
  "biomarkers": [
    {
      "originalName": "string",
      "englishName": "string",
      "value": <number or null>,
      "qualifier": "<" or ">" or "none",
      "originalUnit": "string",
      "standardizedUnit": "string",
      "referenceMin": <number or null>,
      "referenceMax": <number or null>,
      "category": "string"
    }
  ]
}`;

export async function structureReport(
  text: string,
  retryCount = 0
): Promise<ReportData> {
  try {
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `${EXTRACTION_PROMPT}\n\nLab Report Text:\n${text}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    let jsonText = content.text.trim();
    
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    const parsed = JSON.parse(jsonText);
    const validated = ReportSchema.parse(parsed);

    return validated;
  } catch (error) {
    if (retryCount < 1) {
      console.log("Validation failed, retrying...", error);
      return structureReport(text, retryCount + 1);
    }
    throw error;
  }
}
