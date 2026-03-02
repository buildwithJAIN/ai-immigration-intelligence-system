
const getBatchConfig = require("../utils/getBatchConfig");
const admin = require("firebase-admin");
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;


// 🔹 Helper: Add tokens safely
async function addTokens(engineRef, usageMetadata) {
  const tokens = usageMetadata?.totalTokenCount || 0;
  if (!tokens) return;

  await engineRef.set(
    { tokensUsedToday: admin.firestore.FieldValue.increment(tokens) },
    { merge: true }
  );
}

// 🔹 Helper: Update current task
async function setTask(engineRef, task) {
  await engineRef.set({ currentTask: task }, { merge: true });
}

// 🔹 Helper: Clean markdown
function cleanJson(raw = "") {
  return String(raw)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

module.exports = async function batchLanguageTranslations(db) {

  console.log("🌍 batchLanguageTranslations WORKER EXECUTED");

  const { languageTranslations: LIMIT } = await getBatchConfig();
  const today = admin.firestore.Timestamp.now();
  const engineRef = db.collection("agentState").doc("engine");

  // 1️⃣ Fetch ONLY languages pending translation
  const snap = await db
    .collection("languages")
    .where("translationsGenerated", "==", false)
    .limit(LIMIT)
    .get();

  if (snap.empty) {
    console.log("✅ No pending languages found.");
    await setTask(engineRef, "-");
    return 0;
  }

  let processedCount = 0;

  for (const doc of snap.docs) {

    const data = doc.data();
    const languageCode = data.code;
    const languageName = data.name;

    if (!languageCode || !languageName) {
      console.log("⚠️ Invalid language document:", doc.id);
      continue;
    }

    // 🔹 Skip English safely
    if (languageCode.toLowerCase() === "en") {
      console.log("⏭ Skipping English");
      await doc.ref.update({
        translationsGenerated: true,
        updatedAt: today
      });
      continue;
    }

    console.log(`🌍 Generating translation for ${languageName} (${languageCode})`);
    await setTask(engineRef, `UI Translations → ${languageName}`);

    const prompt = `
You are a strict JSON machine.

Translate these UI keys into ${languageName}.

Return ONLY valid JSON:

{
  "category": "",
  "type": "",
  "description": "",
  "duration": "",
  "workRights": "",
  "moreInfo": "",
  "loading": "",
  "noVisasFound": "",
  "filterOptions": "",
  "languages": "",
  "clear": "",
  "close": ""
}

Rules:
- JSON only
- No explanation
`;

    let raw = "";

    try {
      const { data: response } = await axios.post(
        GEMINI_URL,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024
          }
        }
      );

      raw = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // ✅ Count tokens
      await addTokens(engineRef, response?.usageMetadata);

      console.log("🧠 RAW GEMINI OUTPUT:\n", raw);

    } catch (err) {
      console.error("❌ Gemini request failed:", err.message);
      continue;
    }

    if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
      console.error("❌ Gemini returned empty output");
      continue;
    }

    // 2️⃣ Clean markdown fences
    raw = cleanJson(raw);

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON parse failed. Raw output:\n", raw);
      continue;
    }

    // 3️⃣ Save translation document
    await db.collection("languageTranslations")
      .doc(languageCode)
      .set({
        ...parsed,
        languageCode,
        createdAt: today,
        updatedAt: today,
        source: "gemini-2.5-flash-lite"
      }, { merge: true });

    // 4️⃣ Mark language as completed
    await doc.ref.update({
      translationsGenerated: true,
      updatedAt: today
    });

    processedCount++;
  }

  await setTask(engineRef, "-");

  console.log("📦 batchLanguageTranslations returning:", processedCount);

  return processedCount;
};