const admin = require("firebase-admin");

async function getBatchConfig() {
  try {
    const snap = await admin
      .firestore()
      .collection("settings")
      .doc("agentBatchConfig")
      .get();

    if (!snap.exists) {
      console.log("⚠️ batchConfig not found. Using defaults.");
      return {
        countries: 1,
        languages: 1,
        categories: 1,
        languageTranslations: 1
      };
    }

    const data = snap.data();
    console.log(data,"--------------------------------------------")
    return {
      countries: Number(data.countryBatchSize || 1),
      languages: Number(data.languageBatchSize || 1),
      categories: Number(data.categoryBatchSize || 1),
      languageTranslations: Number(data.languageTranslationBatchSize)
    };
  } catch (err) {
    console.error("❌ Error fetching batchConfig:", err);
    return {
      countries: 1,
      languages: 1,
      categories: 1,
      languageBatchSize: 1
    };
  }
}

module.exports = getBatchConfig;
