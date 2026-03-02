// VisaAdvisorView.js
import React, { useEffect, useMemo, useState } from "react";
import { FlatList } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Modal,
} from "react-native";
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  setDoc,
  where, // ✅ added
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import styles from "../styles/_visaAdvisoryStyle";
import { generateVisaAdvisory } from "../util/_openAiService";

/* -----------------------------
   Main Visa Advisor View
--------------------------------*/
function SelectListModal({ title, options, visible, onSelect, onClose, isCountry }) {
  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return "";
    return countryCode
      .toUpperCase()
      .replace(/./g, char =>
        String.fromCodePoint(127397 + char.charCodeAt())
      );
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.countryModal}>
          <Text style={styles.modalTitle}>{title}</Text>

          <FlatList
            data={options}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryRow}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                {isCountry && (
                  <Text style={styles.flag}>
                    {getFlagEmoji(item.countryCode)}
                  </Text>
                )}
                <Text style={styles.countryText}>
                  {item.categoryName ?? item.countryName ?? item.name}
                </Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function VisaAdvisorView() {
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [visaAdvisoryPrompt, setVisaAdvisoryPrompt] = useState("");
  const [pickerType, setPickerType] = useState(null);

  /* -------- Fetch Countries -------- */
  useEffect(() => {
    const q1 = query(collection(db, "countries"));
    const unsubCountries = onSnapshot(q1, (snap) => {
      const rows = [];
      snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
      setCountries(rows);
    });
    return () => unsubCountries();
  }, []);

  /* -------- FIXED: Fetch Categories AFTER Destination -------- */
  useEffect(() => {
    if (!destination?.countryCode) {
      setCategories([]);
      setCategory(null);
      return;
    }

    setLoading(true);
    setCategory(null);

    const q = query(
      collection(db, "categories"),
      where("countryCode", "==", destination.countryCode),
      where("active", "==", true)
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows = [];
      snap.forEach((d) => {
        rows.push({ id: d.id, ...d.data() });
      });
      console.log("Destination countryCode:", destination?.countryCode);
      rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setCategories(rows);
      setLoading(false);
    });

    return () => unsub();
  }, [destination]); // 👈 important dependency

  /* -------- Fetch Advisory Prompt -------- */
  useEffect(() => {
    const fetchVisaPrompt = async () => {
      try {
        const promptRef = doc(db, "settings", "visaAdvisoryPrompt");
        const promptSnap = await getDoc(promptRef);
        if (promptSnap.exists()) {
          const data = promptSnap.data();
          if (data.value) setVisaAdvisoryPrompt(data.value);
        }
      } catch (err) {
        console.error("Error fetching visa advisory prompt:", err);
      }
    };
    fetchVisaPrompt();
  }, []);

  const originOptions = useMemo(
    () => countries.filter((c) => !destination || c.countryCode !== destination.countryCode),
    [countries, destination]
  );
  const destinationOptions = useMemo(
    () => countries.filter((c) => !origin || c.countryCode !== origin.countryCode),
    [countries, origin]
  );

  /* -------- Search Advisory -------- */
  const onSearch = async () => {
    if (!origin || !destination || !category) {
      Alert.alert("Missing info", "Please select Purpose, Origin, and Destination.");
      return;
    }

    setSearching(true);
    setResult(null);

    const payload = {
      purpose: category.categoryName,
      origin: origin.countryName || origin.countryCode,
      destination: destination.countryName || destination.countryCode,
    };

    const slug = `${payload.purpose}_${payload.origin}_${payload.destination}`
      .toLowerCase()
      .replace(/\s+/g, "_");

    const advisoryRef = doc(db, "advisories", slug);

    try {
      const existing = await getDoc(advisoryRef);
      if (existing.exists()) {
        setResult(existing.data().advisory);
        return;
      }

      const promptBuilder = `Purpose: ${payload.purpose}, Origin: ${payload.origin}, Destination: ${payload.destination}`;
      const finalPrompt = `${visaAdvisoryPrompt}\n\nContext - ${promptBuilder}`;
      console.log(finalPrompt)
      const advisory = await generateVisaAdvisory(finalPrompt);

      await setDoc(advisoryRef, {
        ...payload,
        advisory,
        createdAt: new Date().toISOString(),
      });

      setResult(advisory);
    } catch (e) {
      setResult({ error: e.message || "Failed to fetch guidance. Try again." });
    } finally {
      setSearching(false);
    }
  };


  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.wrap} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Pick purpose, origin & destination. Hit Search.</Text>

        {/* Purpose Picker */}
        <TouchableOpacity style={styles.field} onPress={() => setPickerType("purpose")}>
          <Text style={styles.fieldLabel}>Purpose</Text>
          <Text style={[styles.fieldValue, !category && styles.placeholder]}>
            {category?.categoryName || "Select Purpose"}
          </Text>
        </TouchableOpacity>

        {/* Origin Picker */}
        <TouchableOpacity style={styles.field} onPress={() => setPickerType("origin")}>
          <Text style={styles.fieldLabel}>Origin</Text>
          <Text style={[styles.fieldValue, !origin && styles.placeholder]}>
            {origin?.countryName || "Select Origin Country"}
          </Text>
        </TouchableOpacity>

        {/* Destination Picker */}
        <TouchableOpacity style={styles.field} onPress={() => setPickerType("destination")}>
          <Text style={styles.fieldLabel}>Destination</Text>
          <Text style={[styles.fieldValue, !destination && styles.placeholder]}>
            {destination?.countryName || "Select Destination Country"}
          </Text>
        </TouchableOpacity>

        {/* Results */}
        {result && !result.error && (
          <View style={styles.resultWrap}>
            <Text style={styles.resultTitle}>
              {result.purpose} — {result.origin} ➜ {result.destination}
            </Text>

            <ListCard title="Eligibility" items={result.eligibilityRequirements} />
            <ListCard title="Documents" items={result.requiredDocuments} />
            <ListCard title="Process" items={result.applicationProcess} />

            {/* Fees */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fees & Time</Text>
              <View style={styles.subRow}>
                <Text style={styles.subKey}>Visa Fee:</Text>
                <Text style={styles.subValue}>{result?.feesAndCosts?.visaFee || "—"}</Text>
              </View>
              <View style={styles.subRow}>
                <Text style={styles.subKey}>Work Permit Fee:</Text>
                <Text style={styles.subValue}>{result?.feesAndCosts?.workPermitFee || "—"}</Text>
              </View>
              <View style={styles.subRow}>
                <Text style={styles.subKey}>Residence Permit Fee:</Text>
                <Text style={styles.subValue}>{result?.feesAndCosts?.residencePermitFee || "—"}</Text>
              </View>
            </View>

            {/* Validity & Stay */}
            {result.validityAndStay && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Validity & Stay</Text>
                <View style={styles.subRow}>
                  <Text style={styles.subKey}>Visa Validity:</Text>
                  <Text style={styles.subValue}>{result.validityAndStay.visaValidity}</Text>
                </View>
                <View style={styles.subRow}>
                  <Text style={styles.subKey}>Residence Permit:</Text>
                  <Text style={styles.subValue}>{result.validityAndStay.residencePermit}</Text>
                </View>
                <View style={styles.subRow}>
                  <Text style={styles.subKey}>Path to PR:</Text>
                  <Text style={styles.subValue}>{result.validityAndStay.pathToPR}</Text>
                </View>
              </View>
            )}

            {/* Work Rights */}
            {result.workRights && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Work Rights</Text>
                <View style={styles.subRow}>
                  <Text style={styles.subKey}>Employment:</Text>
                  <Text style={styles.subValue}>{result.workRights.employment}</Text>
                </View>
                <View style={styles.subRow}>
                  <Text style={styles.subKey}>Switching Jobs:</Text>
                  <Text style={styles.subValue}>{result.workRights.switchingJobs}</Text>
                </View>
                <View style={styles.subRow}>
                  <Text style={styles.subKey}>Part-Time Work:</Text>
                  <Text style={styles.subValue}>{result.workRights.partTimeWork}</Text>
                </View>
              </View>
            )}

            {/* Dependents & Family */}
            {result.dependentsAndFamily && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Dependents & Family</Text>
                <View style={styles.subRow}>
                  <Text style={styles.subKey}>Eligibility:</Text>
                  <Text style={styles.subValue}>{result.dependentsAndFamily.eligibility}</Text>
                </View>
                <View style={styles.subRow}>
                  <Text style={styles.subKey}>Rights:</Text>
                  <Text style={styles.subValue}>{result.dependentsAndFamily.rights}</Text>
                </View>
              </View>
            )}

            {/* Travel Flexibility */}
            {result.travelFlexibility && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Travel Flexibility</Text>
                <View style={styles.subRow}>
                  <Text style={styles.subKey}>Entry Type:</Text>
                  <Text style={styles.subValue}>{result.travelFlexibility.entryType}</Text>
                </View>
                <View style={styles.subRow}>
                  <Text style={styles.subKey}>Regional Travel:</Text>
                  <Text style={styles.subValue}>{result.travelFlexibility.regionalTravel}</Text>
                </View>
              </View>
            )}

            {/* Special Notes */}
            <ListCard title="Special Notes" items={result.specialNotes} />

            {/* Helpful Resources */}
            {Array.isArray(result.helpfulResources) && result.helpfulResources.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Helpful Resources</Text>
                {result.helpfulResources.map((l, i) => (
                  <Text
                    key={i}
                    style={[styles.link, { textDecorationLine: "none" }]}
                    onPress={() => Linking.openURL(l.url)}
                  >
                    🔗 {l.name}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {result?.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{result.error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.searchBtn,
            (!origin || !destination || !category) && styles.searchBtnDisabled,
          ]}
          disabled={!origin || !destination || !category || searching}
          onPress={onSearch}
        >
          {searching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Pickers */}
      <SelectListModal
        title="Select Purpose"
        options={categories}
        visible={pickerType === "purpose"}
        onSelect={setCategory}
        onClose={() => setPickerType(null)}
        isCountry={false}
      />
      <SelectListModal
        title="Select Origin"
        options={originOptions}
        visible={pickerType === "origin"}
        onSelect={setOrigin}
        onClose={() => setPickerType(null)}
        isCountry={true}
      />
      <SelectListModal
        title="Select Destination"
        options={destinationOptions}
        visible={pickerType === "destination"}
        onSelect={setDestination}
        onClose={() => setPickerType(null)}
        isCountry={true}
      />
    </View>
  );
}

/* -----------------------------
   Result Cards
--------------------------------*/
function ListCard({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {items.map((t, i) => (
        <Text key={i} style={styles.cardText}>
          • {t}
        </Text>
      ))}
    </View>
  );
}
