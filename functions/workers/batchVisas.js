const axios = require("axios");
const admin = require("firebase-admin");
const getBatchConfig = require("../utils/getBatchConfig");


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MAX_VISAS_PER_CATEGORY = 3;
const LANGUAGE_CHUNK_SIZE = 5;

const GEMINI_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;



/* -------------------------------- HELPERS -------------------------------- */

function stripMarkdownJson(s = "") {
    return String(s).replace(/```json/gi, "").replace(/```/g, "").trim();
}

function extractJsonArray(raw) {
    const s = stripMarkdownJson(raw);
    const start = s.indexOf("[");
    const end = s.lastIndexOf("]");
    if (start === -1 || end === -1 || end <= start) return null;
    return s.substring(start, end + 1);
}

function slugifyVisaName(name = "") {
    return String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .substring(0, 80);
}

async function addTokens(engineRef, usageMetadata) {
    const tokens = usageMetadata?.totalTokenCount || 0;
    if (!tokens) return;

    await engineRef.set(
        { tokensUsedToday: admin.firestore.FieldValue.increment(tokens) },
        { merge: true }
    );
}

async function setTask(engineRef, task) {
    await engineRef.set({ currentTask: task }, { merge: true });
}

async function setPhase(engineRef, phase) {
    await engineRef.set({ phase }, { merge: true });
}

/* -------------------------------- MAIN -------------------------------- */

module.exports = async function batchVisa(db) {
    console.log("🛂 batchVisa WORKER EXECUTED");

    const { countries: COUNTRY_LIMIT, categories: CATEGORY_LIMIT } =
        await getBatchConfig();

    const today = admin.firestore.Timestamp.now();
    const engineRef = db.collection("agentState").doc("engine");

    await setPhase(engineRef, "visas");
    await setTask(engineRef, "Initializing visa generation...");

    const countrySnap = await db
        .collection("countries")
        .where("validStatus", "==", true)
        .where("visasGenerated", "==", false)
        .where("isGenerating", "==", false)
        .limit(COUNTRY_LIMIT || 1)
        .get();

    if (countrySnap.empty) {
        console.log("✅ No countries pending visa generation.");
        await setTask(engineRef, "-");
        await setPhase(engineRef, "idle");
        return 0;
    }

    let totalCreated = 0;
    let totalCountriesDone = 0;

    for (const countryDoc of countrySnap.docs) {
        const country = countryDoc.data();
        const countryCode = String(country.countryCode || "").toUpperCase();
        const countryName = country.countryName || countryCode;
        const countryRef = countryDoc.ref;

        console.log("=====================================");
        console.log(`🌍 Processing country: ${countryName}`);
        await setTask(engineRef, `Visas → ${countryName}`);

        try {
            await countryRef.update({
                isGenerating: true,
                generationStartedAt: today,
                updatedAt: today,
            });

            const categorySnap = await db
                .collection("categories")
                .where("countryCode", "==", countryCode)
                .where("active", "==", true)
                .get();

            if (categorySnap.empty) {
                console.log("⚠️ No categories found.");
            }

            const limitedCategories = categorySnap.docs.slice(0, CATEGORY_LIMIT || 3);

            for (const catDoc of limitedCategories) {
                const category = catDoc.data();
                const categoryName = category.categoryName;
                const categoryType = category.categoryType;

                if (!categoryName || !categoryType) continue;

                await setTask(engineRef, `Visas → ${countryName} → ${categoryName}`);

                const existingVisaSnap = await db
                    .collection("visas")
                    .doc(countryCode)
                    .collection("list")
                    .where("category", "==", categoryName)
                    .limit(1)
                    .get();

                if (!existingVisaSnap.empty) continue;

                /* ---------------- ENGLISH GENERATION ONLY ---------------- */

                // ✅ NEW: ask Gemini for an official "helpfulLink" (gov/immigration authority)
                const prompt = `
You are a strict JSON machine.

Generate up to ${MAX_VISAS_PER_CATEGORY} officially recognized visa programs for:

Country: ${countryName}
Category: ${categoryName}
Type: ${categoryType}

Return STRICT JSON ARRAY ONLY. No markdown. No commentary.

Each object MUST contain EXACTLY these keys:
- visaName (string)
- description (string)
- duration (string)
- workRights (string)
- helpfulLink (string)

Rules for helpfulLink:
- Must be a REAL, working URL from an OFFICIAL government / embassy / immigration authority domain for ${countryName}.
- If you are not confident about an official link, return "" (empty string). Do NOT guess.

Also:
- Keep description concise (2-4 lines).
- Use plain text only (no bullets).
`;

                let raw = "";

                try {
                    const { data } = await axios.post(GEMINI_URL, {
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.15, maxOutputTokens: 1600 },
                    });

                    raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    await addTokens(engineRef, data?.usageMetadata);
                } catch (err) {
                    console.error("❌ Gemini failed (visa gen):", err.message);
                    continue;
                }

                const arrStr = extractJsonArray(raw);
                if (!arrStr) continue;

                let visasArray;
                try {
                    visasArray = JSON.parse(arrStr);
                } catch {
                    continue;
                }

                if (!Array.isArray(visasArray) || visasArray.length === 0) continue;

                for (const visa of visasArray) {
                    const visaName = visa?.visaName;
                    const description = visa?.description;
                    const duration = visa?.duration;
                    const workRights = visa?.workRights;

                    // ✅ NEW: link field
                    const helpfulLink = visa?.helpfulLink;

                    if (!visaName || !description) continue;

                    const slug = slugifyVisaName(visaName);
                    if (!slug) continue;

                    const visaRef = db
                        .collection("visas")
                        .doc(countryCode)
                        .collection("list")
                        .doc(slug);

                    // ✅ Store link at top-level (not inside translations)
                    // because link is language-independent and your UI checks visa.helpfulLink
                    const cleanedLink =
                        typeof helpfulLink === "string" && helpfulLink.trim().length > 0
                            ? helpfulLink.trim()
                            : "";

                    await visaRef.set(
                        {
                            baseLanguage: "en",
                            category: categoryName,
                            type: categoryType,
                            createdAt: today,
                            isNew: true,

                            // ✅ NEW: moreInfo link field for VisaListView
                            helpfulLink: cleanedLink,

                            translations: {
                                en: {
                                    visaName: String(visaName).trim(),
                                    description: String(description).trim(),
                                    duration: String(duration || "").trim(),
                                    workRights: String(workRights || "").trim(),
                                },
                            },
                        },
                        { merge: true }
                    );

                    totalCreated++;
                }
            }

            await countryRef.update({
                visasGenerated: true,
                isGenerating: false,
                lastVisaGenerationAt: today,
                updatedAt: today,
            });

            totalCountriesDone++;
            console.log(`✅ Country completed: ${countryName}`);
        } catch (err) {
            console.error(`❌ Country failed: ${countryName}`, err);

            await countryRef.update({
                visasGenerated: false,
                isGenerating: false,
                updatedAt: today,
            });
        }
    }

    if (totalCreated > 0) {
        await engineRef.set(
            {
                totalVisas: admin.firestore.FieldValue.increment(totalCreated),
                currentVisaIndex: admin.firestore.FieldValue.increment(totalCreated),
                lastVisaUpdate: today,
            },
            { merge: true }
        );
    }

    await setTask(engineRef, "-");
    await setPhase(engineRef, "idle");

    console.log(`🎯 Total visas created: ${totalCreated}`);
    console.log(`🌍 Countries completed: ${totalCountriesDone}`);

    return totalCreated;
};