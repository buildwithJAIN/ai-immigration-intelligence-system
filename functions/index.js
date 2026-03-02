// ------------------------------
// Firebase Setup
// ------------------------------
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const functions = require("firebase-functions");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

// ------------------------------
// Task Sequence (FULL MODE)
// ------------------------------
const TASK_SEQUENCE = [
  "batchCountries",
  "batchLanguages",
  "batchCategory",
  "batchLanguageTranslations",
  "batchVisas",
];

// ------------------------------
// Utilities
// ------------------------------
async function queueJob(type, payload = {}) {
  await db.collection("agentJobs").add({
    type,
    payload,
    status: "pending",
    createdAt: new Date(),
  });
  console.log("📌 Job queued:", type);
}

async function hasPendingOrRunningJobs() {
  const snap = await db
    .collection("agentJobs")
    .where("status", "in", ["pending", "running"])
    .limit(1)
    .get();

  return !snap.empty;
}

// ------------------------------
// ✅ Gemini Single Call Function
// ------------------------------
exports.callGemini = functions
  .runWith({ secrets: ["GEMINI_API_KEY"] })
  .https.onRequest(async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt missing" });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      console.log("KEY EXISTS:", !!apiKey);

      const response = await axios({
        method: "post",
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
      });

      const text =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      return res.status(200).json({ text });
    } catch (error) {
      console.error("FULL GEMINI ERROR:", error.response?.data || error.message);
      return res.status(500).json({ error: "Gemini failed" });
    }
  });

// ------------------------------
// 🔵 START FULL AGENT MODE
// ------------------------------
exports.startAgentMode = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const engineRef = db.collection("agentState").doc("engine");
      const engineSnap = await engineRef.get();

      if (!engineSnap.exists) {
        await engineRef.set({
          mode: "running",
          runMode: "full",
          currentTaskIndex: 0,
          tokensUsedToday: 0,
          lastRunAt: new Date(),
        });
      } else {
        await engineRef.update({
          mode: "running",
          runMode: "full",
          lastRunAt: new Date(),
        });
      }

      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });
});

// ------------------------------
// 🟢 START SINGLE AGENT MODE
// ------------------------------
exports.startSingleAgent = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { type } = req.body;

      const typeMap = {
        1: "batchCountries",
        2: "batchLanguages",
        3: "batchCategory",
        4: "batchVisas",
        5: "batchLanguageTranslations",
      };

      const jobType = typeMap[type];

      if (!jobType) {
        return res.status(400).json({ error: "Invalid agent type" });
      }

      const engineRef = db.collection("agentState").doc("engine");

      await engineRef.update({
        mode: "running",
        runMode: "single",
        singleType: jobType,
        lastRunAt: new Date(),
      });

      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// ------------------------------
// 🔴 STOP AGENT MODE
// ------------------------------
exports.stopAgentMode = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await db.collection("agentState").doc("engine").update({
        mode: "stopped",
      });

      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// ------------------------------
// ⚙️ MAIN AGENT LOOP
// ✅ FIX: Inject GEMINI_API_KEY secret here too
// ------------------------------
exports.runAgentMode = functions
  .runWith({ secrets: ["GEMINI_API_KEY"] })
  .pubsub.schedule("every 1 minutes")
  .onRun(async () => {
    const engineRef = db.collection("agentState").doc("engine");
    const engineSnap = await engineRef.get();

    if (!engineSnap.exists) return null;

    const engine = engineSnap.data();

    if (engine.mode !== "running") return null;

    if (await hasPendingOrRunningJobs()) return null;

    if (engine.tokensUsedToday > 250000) {
      await engineRef.update({ mode: "paused" });
      return null;
    }

    // ------------------------------
    // SINGLE MODE
    // ------------------------------
    if (engine.runMode === "single") {
      console.log("⚡ Running SINGLE agent:", engine.singleType);

      await queueJob(engine.singleType);

      return null;
    }

    // ------------------------------
    // FULL MODE
    // ------------------------------
    const taskIndex = engine.currentTaskIndex ?? 0;
    const taskType = TASK_SEQUENCE[taskIndex];

    console.log("🧭 FULL MODE TASK INDEX:", taskIndex);
    console.log("🧭 RUNNING:", taskType);

    await queueJob(taskType);

    return null;
  });

// ------------------------------
// ⚡ WORKER PROCESSOR
// ✅ FIX: Inject GEMINI_API_KEY secret here too
// ------------------------------
exports.processAgentJob = functions
  .runWith({ secrets: ["GEMINI_API_KEY"] })
  .pubsub.schedule("every 1 minutes")
  .onRun(async () => {
    const jobSnap = await db
      .collection("agentJobs")
      .where("status", "==", "pending")
      .limit(1)
      .get();

    if (jobSnap.empty) return null;

    const jobDoc = jobSnap.docs[0];
    const job = jobDoc.data();
    const jobRef = jobDoc.ref;

    await jobRef.update({
      status: "running",
      startedAt: new Date(),
    });

    const engineRef = db.collection("agentState").doc("engine");

    try {
      let result;

      switch (job.type) {
        case "batchCountries":
          result = await require("./workers/batchCountries")(db);
          break;

        case "batchLanguages":
          result = await require("./workers/batchLanguages")(db);
          break;

        case "batchCategory":
          result = await require("./workers/batchCategory")(db);
          break;

        case "batchLanguageTranslations":
          result = await require("./workers/batchLanguageTranslations")(db);
          break;

        case "batchVisas": {
          // 🔐 DEPENDENCY VALIDATION
          const countrySnap = await db.collection("countries").limit(1).get();
          const categorySnap = await db.collection("categories").limit(1).get();
          const languageSnap = await db.collection("languages").limit(1).get();

          if (countrySnap.empty || categorySnap.empty || languageSnap.empty) {
            throw new Error(
              "Visa Agent requires at least one country, category, and language."
            );
          }

          result = await require("./workers/batchVisas")(db);
          break;
        }

        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      // Reset if single mode
      const engineSnap = await engineRef.get();
      const engine = engineSnap.data();

      if (engine.runMode === "single") {
        await engineRef.update({
          mode: "stopped",
          runMode: "full",
          singleType: admin.firestore.FieldValue.delete(),
        });
      } else {
        // advance full cycle
        await db.runTransaction(async (tx) => {
          const snap = await tx.get(engineRef);
          const engineData = snap.data() || {};
          let nextIndex = (engineData.currentTaskIndex ?? 0) + 1;

          if (nextIndex >= TASK_SEQUENCE.length) {
            nextIndex = 0;
          }

          tx.update(engineRef, {
            currentTaskIndex: nextIndex,
            lastRunAt: new Date(),
          });
        });
      }

      await jobRef.update({
        status: "completed",
        resultCount: result ?? 0,
        updatedAt: new Date(),
      });

      await engineRef.update({
        lastTaskName: job.type,
        lastTaskResultCount: result ?? 0,
        lastRunAt: new Date(),
      });
    } catch (err) {
      await jobRef.update({
        status: "failed",
        error: err.message,
        updatedAt: new Date(),
      });

      await engineRef.update({ mode: "stopped" });
    }

    return null;
  });

exports.translateVisa = require("./workers/translateVisa");