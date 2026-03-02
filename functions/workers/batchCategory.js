const getBatchConfig = require("../utils/getBatchConfig");
const axios = require("axios");
const admin = require("firebase-admin");


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


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

module.exports = async function batchCategory(db) {
  console.log("🏷 batchCategory WORKER EXECUTED");

  const { categories: LIMIT } = await getBatchConfig();
  const today = admin.firestore.Timestamp.now();
  const engineRef = db.collection("agentState").doc("engine");

  // 🔥 Set phase + task
  await engineRef.set(
    {
      phase: "categories",
      currentTask: "Generating categories...",
    },
    { merge: true }
  );

  // 1️⃣ Fetch limited countries needing categories
  const countrySnap = await db
    .collection("countries")
    .where("validStatus", "==", true)
    .where("categoriesGenerated", "==", false)
    .limit(LIMIT)
    .get();

  if (countrySnap.empty) {
    console.log("✅ No countries pending category generation.");

    await engineRef.set(
      { phase: "idle", currentTask: "-" },
      { merge: true }
    );

    return 0;
  }

  let totalCreated = 0;

  for (const countryDoc of countrySnap.docs) {
    const country = countryDoc.data();
    const countryRef = countryDoc.ref;
    const countryName = country.countryName;
    const countryCode = country.countryCode;

    console.log("=====================================");
    console.log(`🚀 Generating categories for ${countryName}`);

    await engineRef.set(
      {
        currentTask: `Categories → ${countryName}`,
      },
      { merge: true }
    );

    const prompt = `
You are a strict JSON generator.

Generate official immigration categories used in ${countryName}.

Rules:
- Must be realistic for that country
- Include BOTH Immigrant and Non-Immigrant categories if applicable
- JSON ONLY
- Return ARRAY format

Return format:
[
  {
    "categoryName": "",
    "categoryType": "Immigrant or Non-Immigrant",
    "description": ""
  }
]
`;

    let raw = "";

    try {
      const { data } = await axios.post(GEMINI_URL, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.15,
          maxOutputTokens: 1500,
        },
      });

      raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      await addTokens(engineRef, data?.usageMetadata);

    } catch (err) {
      console.error(`❌ Gemini failed for ${countryName}`, err.message);
      continue;
    }

    if (!raw || typeof raw !== "string") {
      console.log("⚠️ Empty Gemini response");
      continue;
    }

    raw = stripMarkdownJson(raw);

    let categoriesArray;

    try {
      const parsed = JSON.parse(raw);
      categoriesArray = Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
      console.error("❌ JSON parse error:", raw);
      continue;
    }

    if (!categoriesArray.length) {
      console.log("⚠️ No categories returned");
      continue;
    }

    let countryCreated = 0;

    for (const cat of categoriesArray) {
      if (!cat.categoryName || !cat.categoryType || !cat.description) {
        console.log("⚠️ Invalid category object:", cat);
        continue;
      }

      try {
        await db.collection("categories").add({
          countryCode,
          categoryName: cat.categoryName.trim(),
          categoryType: cat.categoryType.trim(),
          description: cat.description.trim(),
          active: true,
          createdAt: today,
          updatedAt: today,
          createdBy: "agent",
        });

        countryCreated++;
        totalCreated++;

      } catch (err) {
        console.error("❌ Firestore write failed:", err);
      }
    }

    if (countryCreated > 0) {
      await countryRef.update({
        categoriesGenerated: true,
        updatedAt: today,
      });

      console.log(`✅ ${countryCreated} categories created for ${countryName}`);
    } else {
      console.log("⚠️ No categories saved. Not marking as generated.");
    }
  }

  // 🔥 Update metrics
  if (totalCreated > 0) {
    await engineRef.set(
      {
        totalCategories:
          admin.firestore.FieldValue.increment(totalCreated),
        currentCategoryIndex:
          admin.firestore.FieldValue.increment(totalCreated),
        lastCategoryUpdate: today,
      },
      { merge: true }
    );
  }

  // 🔥 Reset phase
  await engineRef.set(
    {
      phase: "idle",
      currentTask: "-",
    },
    { merge: true }
  );

  console.log(`🎯 Total categories created: ${totalCreated}`);

  return totalCreated;
};