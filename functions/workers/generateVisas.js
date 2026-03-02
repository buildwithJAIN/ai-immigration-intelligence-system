// functions/workers/generateVisas.js
const axios = require("axios");
const admin = require("firebase-admin");


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// functions/workers/generateVisas.js
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

// Safe slug for visaId
function slugify(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

module.exports = async function generateVisas(db) {
  console.log("🛂 generateVisas worker started...");

  // 1️⃣ Retrieve existing incomplete visa-generation task
  let taskSnap = await db
    .collection("visaGenerationTasks")
    .where("completed", "==", false)
    .limit(1)
    .get();

  let task;
  if (!taskSnap.empty) {
    const doc = taskSnap.docs[0];
    task = { id: doc.id, ref: doc.ref, ...doc.data() };
    console.log("🔁 Continuing task:", task.countryCode, task.categoryCode);
  } else {
    // ------------------------------------------------------------
    // 2️⃣ No existing task → CREATE NEW TASK (country + category)
    // ------------------------------------------------------------
    const countriesSnap = await db
      .collection("countries")
      .where("validStatus", "==", true)
      .get();

    if (countriesSnap.empty) {
      console.log("⚠️ No valid countries.");
      return;
    }

    // choose FIRST country with visaGenerated=false
    let countryDoc = null;
    for (const c of countriesSnap.docs) {
      if (!c.data().visaGenerated) {
        countryDoc = c;
        break;
      }
    }

    if (!countryDoc) {
      console.log("✨ All countries already have all visas.");
      return;
    }

    const countryCode = countryDoc.id;
    const countryName = countryDoc.data().countryName || countryCode;

    // ---------------------------------------
    // Choose the NEXT category for this country
    // ---------------------------------------
    const catSnap = await db.collection("categories").get();
    const categories = catSnap.docs;

    let chosenCatDoc = null;

    for (const cat of categories) {
      const catId = cat.id;

      // check if a task exists for this country+category
      const exists = await db
        .collection("visaGenerationTasks")
        .where("countryCode", "==", countryCode)
        .where("categoryCode", "==", catId)
        .limit(1)
        .get();

      if (exists.empty) {
        chosenCatDoc = cat;
        break;
      }
    }

    // no more categories for this country
    if (!chosenCatDoc) {
      await countryDoc.ref.set(
        { visaGenerated: true, lastVisaGeneratedAt: new Date() },
        { merge: true }
      );
      console.log("🌍 Country fully generated:", countryCode);
      return;
    }

    const categoryCode = chosenCatDoc.id;
    const categoryName = chosenCatDoc.data().name || categoryCode;

    // create new task
    const newTaskRef = await db.collection("visaGenerationTasks").add({
      countryCode,
      countryName,
      categoryCode,
      categoryName,
      completedLanguages: [],
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    task = {
      id: newTaskRef.id,
      ref: newTaskRef,
      countryCode,
      countryName,
      categoryCode,
      categoryName,
      completedLanguages: [],
      completed: false,
    };

    console.log("🆕 Created new task:", countryCode, categoryCode);
  }

  // Task fields
  const {
    countryCode,
    countryName,
    categoryCode,
    categoryName,
    completedLanguages = [],
  } = task;

  // ------------------------------------------------------------
  // 3️⃣ Get next 5 languages (dynamic)
  // ------------------------------------------------------------
  const langSnap = await db.collection("languages").where("active", "==", true).get();
  const allLanguages = langSnap.docs.map((l) => l.id);

  const remaining = allLanguages.filter((l) => !completedLanguages.includes(l));

  if (remaining.length === 0) {
    console.log("🎉 Category fully translated for:", countryCode, categoryCode);

    await task.ref.set(
      { completed: true, updatedAt: new Date() },
      { merge: true }
    );

    // check if country fully done
    const open = await db
      .collection("visaGenerationTasks")
      .where("countryCode", "==", countryCode)
      .where("completed", "==", false)
      .limit(1)
      .get();

    if (open.empty) {
      await db.collection("countries").doc(countryCode).set(
        {
          visaGenerated: true,
          lastVisaGeneratedAt: new Date(),
        },
        { merge: true }
      );
      console.log("🌍 Marked country fully generated:", countryCode);
    }

    return;
  }

  const batchLangs = remaining.slice(0, 5);
  console.log("🌐 Languages in this loop:", batchLangs);

  // ------------------------------------------------------------
  // 4️⃣ Build Gemini prompt
  // ------------------------------------------------------------
  const prompt = `
You are an immigration assistant. Return STRICT JSON.

Country:
- code: "${countryCode}"
- name: "${countryName}"

Visa Category:
- code: "${categoryCode}"
- name: "${categoryName}"

Languages to output:
${JSON.stringify(batchLangs)}

Return ONLY JSON:

{
  "visas": [
    {
      "visaId": "slug_id",
      "translations": {
        "${batchLangs[0]}": { ... },
        "${batchLangs[1] || ""}": { ... }
      }
    }
  ]
}

Rules:
- visaId MUST be lowercase, underscores, no spaces.
- For each visa: include visaName, type, description, duration, workRights, helpfulLink.
- First create English, then translate to requested languages.
- NO text outside JSON.
`;

  let raw = "";
  try {
    const { data } = await axios.post(
      GEMINI_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.25,
          responseMimeType: "application/json",
        },
      }
    );
    raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (err) {
    console.error("❌ Gemini API failure:", err.message);
    return;
  }

  // ------------------------------------------------------------
  // 5️⃣ Parse JSON safely
  // ------------------------------------------------------------
  let json = {};
  try {
    json = JSON.parse(raw);
  } catch (err) {
    console.error("❌ BAD JSON FROM GEMINI:", raw);
    return;
  }

  const visas = Array.isArray(json.visas) ? json.visas : [];

  if (!visas.length) {
    console.log("⚠️ No visas found.");
    return;
  }

  // ------------------------------------------------------------
  // 6️⃣ Save visas to Firestore
  // ------------------------------------------------------------
  const batch = db.batch();
  const now = admin.firestore.Timestamp.now();

  visas.forEach((visa) => {
    const id = slugify(visa.visaId || visa.translations?.en?.visaName || "visa");
    const translations = visa.translations || {};

    batchLangs.forEach((lang) => {
      const t = translations[lang] || translations["en"];
      if (!t) return;

      const docRef = db
        .collection("visas")
        .doc(countryCode)
        .collection(lang)
        .collection("visas")
        .doc(id);

      batch.set(
        docRef,
        {
          visaId: id,
          countryCode,
          visaName: t.visaName || translations.en?.visaName,
          category: categoryName,
          type: t.type || "",
          description: t.description || "",
          duration: t.duration || "",
          workRights: t.workRights || "",
          helpfulLink: t.helpfulLink || "",
          isNew: true,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
    });
  });

  await batch.commit();
  console.log(
    `✅ Saved ${visas.length} visas → ${countryCode} → ${categoryCode} → langs:`,
    batchLangs
  );

  // ------------------------------------------------------------
  // 7️⃣ Update task with completed languages
  // ------------------------------------------------------------
  const updatedList = Array.from(new Set([...completedLanguages, ...batchLangs]));

  await task.ref.set(
    {
      completedLanguages: updatedList,
      updatedAt: new Date(),
    },
    { merge: true }
  );

  console.log("➡️ Updated completedLanguages:", updatedList);
};

