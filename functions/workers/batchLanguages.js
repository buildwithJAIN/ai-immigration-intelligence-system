const axios = require("axios");
const admin = require("firebase-admin");
const getBatchConfig = require("../utils/getBatchConfig");
// ⚠️ TEMP: move to env later


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log(GEMINI_API_KEY, "------------------------rytdfgyuijk")
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const MIN_BATCH = 2;
const MAX_LANGUAGES = 150;

// 🔹 Helper: Add tokens
async function addTokens(engineRef, usageMetadata) {
  const tokens = usageMetadata?.totalTokenCount || 0;
  if (!tokens) return;

  await engineRef.set(
    { tokensUsedToday: admin.firestore.FieldValue.increment(tokens) },
    { merge: true }
  );
}

// 🔹 Helper: Set current task
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

module.exports = async function batchLanguages(db) {

  console.log("🌐 ================= batchLanguages START =================");

  const { languages } = await getBatchConfig();
  const LIMIT = languages;
  const today = admin.firestore.Timestamp.now();
  const engineRef = db.collection("agentState").doc("engine");

  await setTask(engineRef, "Generating Languages");

  // 1️⃣ Fetch existing languages
  const langSnap = await db.collection("languages").get();

  const existingCodes = langSnap.docs.map((d) => d.id.toLowerCase());
  const existingNames = langSnap.docs.map((d) =>
    (d.data().name || "").toLowerCase()
  );

  console.log("📚 Existing language count:", existingCodes.length);

  // 🛑 Hard stop
  if (existingCodes.length >= MAX_LANGUAGES) {
    console.log("🛑 Language limit reached. Skipping generation.");
    await setTask(engineRef, "-");
    return 0;
  }

  // 2️⃣ Build prompt
  const prompt = `
You are a STRICT JSON generator.

Existing ISO-639-1 language codes:
${JSON.stringify(existingCodes)}

Task:
- Generate NEW real-world languages
- ISO-639-1 2-letter codes ONLY
- MUST NOT duplicate existing codes
- MUST be globally recognized

Return ONLY a JSON ARRAY like:

[
  {
    "code": "es",
    "name": "Spanish",
    "nativeName": "Español"
  }
]

Rules:
- JSON only
- No comments
- No explanations
- Return up to ${LIMIT} items
`;

  let raw = "";

  try {
    const { data } = await axios.post(
      GEMINI_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      }
    );

    raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // ✅ Count tokens
    await addTokens(engineRef, data?.usageMetadata);

  } catch (err) {
    console.error("❌ Gemini API error:", err.response?.data || err.message);
    await setTask(engineRef, "-");
    return 0;
  }

  if (!raw || typeof raw !== "string") {
    console.log("⚠️ Empty or invalid Gemini output");
    await setTask(engineRef, "-");
    return 0;
  }

  // 3️⃣ Clean markdown
  const cleanedRaw = cleanJson(raw);

  // 4️⃣ Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(cleanedRaw);
  } catch (err) {
    console.error("❌ JSON parse failed");
    console.error("🔴 CLEANED RAW:\n", cleanedRaw);
    await setTask(engineRef, "-");
    return 0;
  }

  if (!Array.isArray(parsed)) {
    console.log("⚠️ Gemini output is not an array:", parsed);
    await setTask(engineRef, "-");
    return 0;
  }

  // 5️⃣ Validate + dedupe
  const validLanguages = parsed.filter((lang) => {
    const code = (lang.code || "").toLowerCase().trim();
    const name = (lang.name || "").toLowerCase().trim();

    if (!/^[a-z]{2}$/.test(code)) return false;
    if (!name) return false;
    if (existingCodes.includes(code)) return false;
    if (existingNames.includes(name)) return false;

    return true;
  });

  if (validLanguages.length === 0) {
    console.log("ℹ️ No new valid languages after filtering.");
    await setTask(engineRef, "-");
    return 0;
  }

  // 6️⃣ Save to Firestore
  const batch = db.batch();

  validLanguages.forEach((lang) => {
    const code = lang.code.toLowerCase().trim();

    batch.set(
      db.collection("languages").doc(code),
      {
        code,
        name: lang.name.trim(),
        nativeName: lang.nativeName || lang.name.trim(),
        active: true,
        addedAt: today,
        updatedAt: today,
        translationsGenerated: false
      },
      { merge: true }
    );
  });

  await batch.commit();

  console.log(`✅ Firestore write complete: ${validLanguages.length} languages`);

  // 7️⃣ Update engine stats
  await engineRef.set(
    {
      currentLanguageIndex:
        admin.firestore.FieldValue.increment(validLanguages.length),
      lastLanguageUpdate: today,
    },
    { merge: true }
  );

  await setTask(engineRef, "-");

  console.log("🌐 ================= batchLanguages END =================");

  return validLanguages.length;
};