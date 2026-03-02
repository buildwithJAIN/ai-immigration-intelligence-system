const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")({ origin: true });

module.exports = functions
    .runWith({ secrets: ["GEMINI_API_KEY"] })
    .https.onRequest((req, res) => {
        cors(req, res, async () => {
            try {
                // Only allow POST
                if (req.method !== "POST") {
                    return res.status(405).json({ error: "Method Not Allowed" });
                }

                const { visa, langCode } = req.body;

                if (!visa || !langCode) {
                    return res.status(400).json({ error: "Missing visa or langCode" });
                }

                const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
                if (!GEMINI_API_KEY) {
                    console.error("Missing GEMINI_API_KEY secret");
                    return res.status(500).json({ error: "Server misconfigured" });
                }

                const GEMINI_URL =
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

                const prompt = `
You are a strict JSON machine.

Translate this visa into ${langCode}.

Return STRICT JSON only.

Keys must remain exactly:
visaName
description
duration
workRights

Visa:
${JSON.stringify(visa)}
`;

                const { data } = await axios.post(GEMINI_URL, {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 1000,
                    },
                });

                const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

                // Clean markdown if Gemini wraps response
                const cleaned = String(raw)
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
                    .trim();

                const start = cleaned.indexOf("{");
                const end = cleaned.lastIndexOf("}");

                if (start === -1 || end === -1 || end <= start) {
                    console.error("Invalid Gemini response:", cleaned);
                    return res.status(500).json({ error: "Invalid Gemini response" });
                }

                const jsonStr = cleaned.substring(start, end + 1);

                let parsed;
                try {
                    parsed = JSON.parse(jsonStr);
                } catch (err) {
                    console.error("JSON parse error:", err.message);
                    console.error("JSON string was:", jsonStr);
                    return res
                        .status(500)
                        .json({ error: "Failed to parse translation JSON" });
                }

                return res.status(200).json(parsed);
            } catch (err) {
                console.error(
                    "Translation error:",
                    err.response?.data || err.message
                );
                return res.status(500).json({ error: "Translation failed" });
            }
        });
    });