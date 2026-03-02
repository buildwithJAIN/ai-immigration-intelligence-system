import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../config/firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import styles from "../styles/_langaugeMasterStyle";
import {
  generateLanguageTranslation,
  normalizeLanguageName,
} from "../util/_openAiService";

export default function LanguageMasterView() {
  const [languageName, setLanguageName] = useState("");
  const [languageCode, setLanguageCode] = useState("");
  const [nativeName, setNativeName] = useState("");
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ generated now means: we have a normalized language + translations doc exists/created
  const [generated, setGenerated] = useState(false);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const snap = await getDocs(collection(db, "languages"));
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      // sort A-Z for nice UX
      list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      setLanguages(list);
    } catch (err) {
      console.error("Error fetching languages:", err);
    }
  };

  const normalizeCode = (c) => String(c || "").trim().toLowerCase();
  const normalizeName = (n) => String(n || "").trim().toLowerCase();

  // ---------------------------------------------
  // 🔥 STEP 1: Normalize + Generate UI Translations
  // ---------------------------------------------
  const handleGenerate = async () => {
    if (!languageName.trim()) {
      Alert.alert("Validation", "Please enter language name.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Normalize language (spelling correction happens here)
      const normalized = await normalizeLanguageName(languageName.trim());

      if (!normalized?.valid) {
        Alert.alert("Invalid", "Language not recognized. Please try another spelling.");
        return;
      }

      const correctedName = String(normalized.correctedLanguageName || "").trim();
      const code = normalizeCode(normalized.languageCode);
      const native = String(normalized.nativeName || "").trim();

      if (!correctedName || !code) {
        Alert.alert("Error", "Could not detect a valid language code/name.");
        return;
      }

      // Set UI fields to corrected values
      setLanguageName(correctedName);
      setLanguageCode(code);
      setNativeName(native || correctedName);

      // 2️⃣ Check Firestore states
      const langRef = doc(db, "languages", code);
      const transRef = doc(db, "languageTranslations", code);

      const [existingLang, existingTrans] = await Promise.all([
        getDoc(langRef),
        getDoc(transRef),
      ]);

      // ✅ If translations exist already, we consider "generated" done.
      // User can click "Add Language" to create language doc if missing.
      if (existingTrans.exists()) {
        setGenerated(true);

        if (existingLang.exists()) {
          Alert.alert("Info", `✅ ${correctedName} (${code}) already exists and translations are ready.`);
        } else {
          Alert.alert(
            "Translations Ready",
            `✅ Translations already exist for ${correctedName} (${code}).\nNow click "Add Language" to save it in Languages list.`
          );
        }
        return;
      }

      // 3️⃣ Build a strict JSON-only prompt
      const translationPrompt = `
You are a STRICT JSON output machine.

DO NOT explain.
DO NOT describe.
DO NOT ask questions.
DO NOT include markdown.
DO NOT include commentary.

Translate the following UI labels into ${correctedName}.

Return EXACT JSON only.

Output format MUST be exactly:

{
  "category": "",
  "clear": "",
  "close": "",
  "description": "",
  "duration": "",
  "filterOptions": "",
  "languages": "",
  "loading": "",
  "moreInfo": "",
  "noVisasFound": "",
  "type": "",
  "workRights": ""
}

Translate these keys now.
`;

      // 4️⃣ Generate translations (Gemini)
      const translationPayload = await generateLanguageTranslation(translationPrompt);

      // ✅ More robust validation (all required keys must exist and be strings)
      const requiredKeys = [
        "category",
        "clear",
        "close",
        "description",
        "duration",
        "filterOptions",
        "languages",
        "loading",
        "moreInfo",
        "noVisasFound",
        "type",
        "workRights",
      ];

      const missing = requiredKeys.filter(
        (k) =>
          typeof translationPayload?.[k] !== "string" ||
          String(translationPayload[k]).trim().length === 0
      );

      if (missing.length > 0) {
        throw new Error(`Invalid translation response. Missing/empty keys: ${missing.join(", ")}`);
      }

      // 5️⃣ Save translations doc
      await setDoc(transRef, {
        ...translationPayload,
        languageCode: code,
        languageName: correctedName,
        nativeName: native || correctedName,
        source: "gemini-2.5-flash-lite",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setGenerated(true);

      // ✅ If language doc exists but translations didn't, we still keep user on "Add Language"
      // so they can add/update language doc in a consistent flow.
      Alert.alert(
        "Success",
        `✅ ${correctedName} (${code}) normalized & translations generated.\nNow click "Add Language".`
      );
    } catch (err) {
      console.error("Generate Error:", err);
      Alert.alert("Error", err?.message || "Failed to generate language data");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // 🔥 STEP 2: Add language entry (or update if exists)
  // ---------------------------------------------
  const handleAddLanguage = async () => {
    // Safety guard: don’t add unless generated (translations ready)
    if (!generated) {
      Alert.alert("Info", "Please click Generate first.");
      return;
    }

    const code = normalizeCode(languageCode);
    const name = String(languageName || "").trim();
    const native = String(nativeName || "").trim() || name;

    if (!code || !name) {
      Alert.alert("Validation", "Language name/code missing. Click Generate again.");
      return;
    }

    try {
      setLoading(true);

      const langRef = doc(db, "languages", code);
      const transRef = doc(db, "languageTranslations", code);

      const [existingLang, existingTrans] = await Promise.all([
        getDoc(langRef),
        getDoc(transRef),
      ]);

      if (!existingTrans.exists()) {
        Alert.alert(
          "Missing translations",
          "Translations doc is not found. Click Generate to create translations first."
        );
        setGenerated(false);
        return;
      }

      // ✅ If language already exists, update it (don’t block)
      if (existingLang.exists()) {
        await setDoc(
          langRef,
          {
            code,
            name,
            nativeName: native,
            // keep active if already exists unless missing
            active: existingLang.data()?.active ?? true,
            translationsGenerated: true,
            updatedAt: new Date(),
          },
          { merge: true }
        );

        Alert.alert("Updated", "Language updated successfully.");
      } else {
        await setDoc(langRef, {
          code,
          name,
          nativeName: native,
          active: true,
          translationsGenerated: true,
          addedAt: new Date(),
          updatedAt: new Date(),
        });

        Alert.alert("Added", "Language added successfully.");
      }

      setLanguageName("");
      setLanguageCode("");
      setNativeName("");
      setGenerated(false);

      fetchLanguages();
    } catch (err) {
      console.error("Error saving language:", err);
      Alert.alert("Error", err?.message || "Failed to save language.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditActive(!!languages[index].active);
  };

  const handleSaveEdit = async () => {
    try {
      const lang = languages[editingIndex];
      await updateDoc(doc(db, "languages", lang.code), {
        active: editActive,
        updatedAt: new Date(),
      });
      setEditingIndex(null);
      fetchLanguages();
    } catch (err) {
      console.error("Error updating language:", err);
      Alert.alert("Error", "Failed to update language.");
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.listRow}>
      {editingIndex === index ? (
        <>
          <View style={{ flex: 1 }}>
            <Text style={styles.listText}>
              {item.name} ({item.code}) — {item.nativeName}
            </Text>
            <View style={styles.row}>
              <Text style={styles.toggleLabel}>Active</Text>
              <Switch
                value={editActive}
                onValueChange={setEditActive}
                thumbColor={editActive ? "#3b82f6" : "#9ca3af"}
                trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
              />
            </View>
          </View>
          <TouchableOpacity onPress={handleSaveEdit} style={styles.editBtn}>
            <Ionicons name="save-outline" size={20} color="#2563eb" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.listText}>
            {item.name} ({item.code}) — {item.nativeName} |{" "}
            {item.active ? "Active" : "Inactive"}
          </Text>
          <TouchableOpacity onPress={() => handleEdit(index)} style={styles.editBtn}>
            <Ionicons name="create-outline" size={20} color="#2563eb" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputCard}>
        <TextInput
          style={[styles.inputBox, styles.nameInput]}
          placeholder="Language name (e.g., German)"
          value={languageName}
          onChangeText={(t) => {
            setLanguageName(t);
            // if user edits input again, reset generated state
            if (generated) setGenerated(false);
          }}
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={generated ? handleAddLanguage : handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.addBtnText}>
            {generated ? "Add Language" : "Generate"}
          </Text>
        )}
      </TouchableOpacity>

      <FlatList
        data={languages}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        style={styles.list}
      />
    </View>
  );
}