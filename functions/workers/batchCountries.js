
const getBatchConfig = require("../utils/getBatchConfig");
const axios = require("axios");
const admin = require("firebase-admin");


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// 🔑 Gemini API Key (set via env / config)


// ✅ Reliable model
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

function stripMarkdownJson(s = "") {
  return String(s).replace(/```json/gi, "").replace(/```/g, "").trim();
}

async function addTokens(engineRef, usageMetadata) {
  const tokens = usageMetadata?.totalTokenCount || 0;
  if (!tokens) return;

  await engineRef.set(
    { tokensUsedToday: admin.firestore.FieldValue.increment(tokens) },
    { merge: true }
  );
}

module.exports = async function batchCountries(db) {
  console.log("🌍 batchCountries WORKER EXECUTED");

  const { countries: LIMIT } = await getBatchConfig();
  const today = admin.firestore.Timestamp.now();
  const engineRef = db.collection("agentState").doc("engine");

  // 🔥 Set phase + task
  await engineRef.set(
    {
      phase: "countries",
      currentTask: "Generating countries...",
    },
    { merge: true }
  );

  // 1️⃣ Fetch existing countries
  const snap = await db.collection("countries").get();
  const existingCodes = snap.docs.map((d) => d.id.toUpperCase());
  const existingNames = snap.docs.map((d) =>
    (d.data().countryName || "").toLowerCase()
  );

  console.log("📚 Existing country count:", existingCodes.length);

  if (existingCodes.length >= 250) {
    console.log("🛑 Country limit reached.");
    await engineRef.set(
      { phase: "idle", currentTask: "-" },
      { merge: true }
    );
    return 0;
  }

  const recentCodes = existingCodes.slice(-30);

  const prompt = `
You are a strict JSON machine.

Existing country ISO2 codes:
${JSON.stringify(recentCodes)}

Generate EXACTLY ${LIMIT} NEW real countries.

Rules:
- ISO2 countryCode ONLY
- Real, globally recognized countries
- Must NOT repeat existing codes
- JSON ONLY (no text, no markdown)

Return format:
[
  {
    "countryName": "Country Name",
    "countryCode": "US"
  }
]
`;

  let raw = "";

  try {
    const { data } = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });

    raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    await addTokens(engineRef, data?.usageMetadata);

  } catch (err) {
    console.error("❌ Gemini request failed:", err.message);

    await engineRef.set(
      { phase: "idle", currentTask: "-" },
      { merge: true }
    );

    return 0;
  }

  if (!raw || typeof raw !== "string") {
    console.error("❌ Gemini returned empty output");
    await engineRef.set(
      { phase: "idle", currentTask: "-" },
      { merge: true }
    );
    return 0;
  }

  raw = stripMarkdownJson(raw);

  let countries;
  try {
    countries = JSON.parse(raw);
  } catch (err) {
    console.error("❌ JSON parse failed:", raw);

    await engineRef.set(
      { phase: "idle", currentTask: "-" },
      { merge: true }
    );

    return 0;
  }

  if (!Array.isArray(countries)) {
    console.error("❌ Gemini output not array");

    await engineRef.set(
      { phase: "idle", currentTask: "-" },
      { merge: true }
    );

    return 0;
  }

  countries = countries.filter((c) => {
    if (!c.countryCode || !c.countryName) return false;

    const code = c.countryCode.toUpperCase().trim();
    const name = c.countryName.toLowerCase().trim();

    return (
      /^[A-Z]{2}$/.test(code) &&
      !existingCodes.includes(code) &&
      !existingNames.includes(name)
    );
  });

  if (!countries.length) {
    console.log("⚠️ No valid NEW countries generated.");

    await engineRef.set(
      { phase: "idle", currentTask: "-" },
      { merge: true }
    );

    return 0;
  }

  const batch = db.batch();

  countries.forEach((c) => {
    const code = c.countryCode.toUpperCase().trim();

    batch.set(
      db.collection("countries").doc(code),
      {
        countryName: c.countryName.trim(),
        countryCode: code,
        validStatus: true,
        categoriesGenerated: false,
        visasGenerated: false,
        isGenerating: false,
        generationStartedAt: null,
        lastVisaGenerationAt: null,
        createdAt: today,
        updatedAt: today,
      },
      { merge: true }
    );
  });

  await batch.commit();

  console.log(`✅ Added ${countries.length} NEW countries`);

  // 🔥 Metrics update
  await engineRef.set(
    {
      totalCountries:
        admin.firestore.FieldValue.increment(countries.length),
      currentCountryIndex:
        admin.firestore.FieldValue.increment(countries.length),
      lastCountryUpdate: today,
    },
    { merge: true }
  );

  // 🔥 Reset phase to idle
  await engineRef.set(
    {
      phase: "idle",
      currentTask: "-",
    },
    { merge: true }
  );

  console.log("📦 batchCountries returning:", countries.length);

  return countries.length;
};

