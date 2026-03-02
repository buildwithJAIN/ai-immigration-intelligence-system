// -----------------------------------------------------------
// 🌍 Secure Gemini AI Service (Frontend → Cloud Function)
// -----------------------------------------------------------

/* ------------------------------ JSON HELPERS ------------------------------ */

const stripMarkdownJson = (s = "") =>
  String(s)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

const extractJsonBlock = (raw = "", type = "object") => {
  const s = stripMarkdownJson(raw);

  const open = type === "array" ? "[" : "{";
  const close = type === "array" ? "]" : "}";

  const start = s.indexOf(open);
  const end = s.lastIndexOf(close);

  if (start === -1 || end === -1 || end <= start) return null;
  return s.substring(start, end + 1);
};

const safeJsonParse = (jsonStr, label = "JSON") => {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error(`❌ ${label} parse error:`, e);
    console.log(`🧾 ${label} snippet:`, String(jsonStr || "").slice(0, 350));
    throw new Error(`Invalid ${label} returned from AI.`);
  }
};

/* ------------------------------ CLOUD CALL ------------------------------ */

const callGemini = async (prompt, maxTokens = 1024) => {
  try {
    const res = await fetch(
      "https://us-central1-immigrationguideapp.cloudfunctions.net/callGemini",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, maxTokens }),
      }
    );

    if (!res.ok) {
      throw new Error("Cloud function request failed");
    }

    const data = await res.json();
    return data.text || "";

  } catch (err) {
    console.error("Cloud Gemini Error:", err);
    throw err;
  }
};

/* -------------------------------------------------------------------------- */
/*                               MAIN SERVICES                                */
/* -------------------------------------------------------------------------- */

export const generateVisasForCountry = async (finalPrompt) => {
  const rawText = await callGemini(finalPrompt, 2000);

  if (!rawText) throw new Error("No output text found.");

  const jsonString = extractJsonBlock(rawText, "object");
  if (!jsonString) throw new Error("No valid JSON block detected.");

  return safeJsonParse(jsonString, "Visa JSON");
};

export const generateVisaAdvisory = async (finalPrompt) => {
  const rawText = await callGemini(finalPrompt, 12000);

  if (!rawText) return {};

  const jsonString = extractJsonBlock(rawText, "object");
  if (!jsonString) {
    return {
      _rawText: rawText,
      createdAt: new Date().toISOString(),
      source: "gemini-2.5-flash-lite",
    };
  }

  const parsed = safeJsonParse(jsonString, "Advisory JSON");

  parsed.createdAt = new Date().toISOString();
  parsed.source = "gemini-2.5-flash-lite";

  return parsed;
};

export const generateVisaTranslations = async (finalPrompt) => {
  const rawText = await callGemini(finalPrompt, 4000);

  if (!rawText) throw new Error("No translation output received.");

  const jsonString = extractJsonBlock(rawText, "object");
  if (!jsonString) throw new Error("Invalid JSON format.");

  const parsed = safeJsonParse(jsonString, "Visa Translation JSON");

  if (!parsed.translations)
    throw new Error("No translations object found.");

  return parsed.translations;
};

export async function normalizeLanguageName(inputName) {
  const prompt = `
You are a language normalization engine.

Given an input language name (possibly misspelled), do the following:
1. Identify the correct language.
2. Correct the spelling.
3. Return the ISO 639-1 code (two-letter). If not available, return a valid 3-letter code.
4. Return the native name in original script.

If the language does not exist, return:
{
  "valid": false
}

Return ONLY JSON:

{
  "valid": true,
  "correctedLanguageName": "",
  "languageCode": "",
  "nativeName": ""
}

Input:
${String(inputName || "").trim()}
`;

  const rawText = await callGemini(prompt, 1000);

  if (!rawText) throw new Error("No normalization response received.");

  const jsonString = extractJsonBlock(rawText, "object");
  if (!jsonString) throw new Error("Invalid JSON output.");

  return safeJsonParse(jsonString, "Normalization JSON");
}

export const generateCategoryDescription = async (categoryName) => {
  const prompt = `
You are a strict JSON generator.

Generate a short professional description for this visa category.

Category: ${categoryName}

Rules:
- Under 25 words
- Professional tone
- No markdown
- Return JSON ONLY

{
  "description": "Short description here."
}
`;

  const raw = await callGemini(prompt, 512);

  const jsonString = extractJsonBlock(raw, "object");
  if (!jsonString)
    throw new Error("Invalid category description response");

  return safeJsonParse(jsonString, "Category Description JSON");
};

export const generateLanguageTranslation = async (prompt) => {
  const rawText = await callGemini(prompt, 1500);

  if (!rawText) throw new Error("Invalid translation response");

  const jsonStr = extractJsonBlock(rawText, "object");
  if (!jsonStr) throw new Error("Invalid translation response");

  return safeJsonParse(jsonStr, "Language Translation JSON");
};