import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../config/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import styles from "../styles/_interviewLandingPageStyle";

export default function InterviewPracticeView({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [visaTypes, setVisaTypes] = useState([]);
  const [selectedVisa, setSelectedVisa] = useState(null);
  const [mode, setMode] = useState("Text");

  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [visaModalVisible, setVisaModalVisible] = useState(false);
  const [visaLoading, setVisaLoading] = useState(false);

  // 🔹 Step 1: Load all valid countries
  useEffect(() => {
    fetchValidCountries();
  }, []);

  const fetchValidCountries = async () => {
    try {
      const q = query(collection(db, "countries"), where("validStatus", "==", true));
      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({
        code: doc.data().countryCode || doc.data().code,
        name: doc.data().countryName || doc.data().name,
      }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setCountries(list);
    } catch (err) {
      console.log("❌ Error fetching valid countries:", err);
      Alert.alert("Error", "Could not load countries.");
    } finally {
      setLoading(false);
    }
  };

  const getFlag = (code) => {
    try {
      return String.fromCodePoint(
        ...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt())
      );
    } catch {
      return "";
    }
  };

  // 🔹 Step 2: Fetch only English visas when a country is selected
  const fetchEnglishVisas = async (countryCode) => {
    try {
      setVisaLoading(true);
      const visaSnap = await getDocs(
        collection(db, "visas", countryCode, "list", "en", "visas")
      );

      const allVisas = visaSnap.docs.map((v) => ({
        id: v.id,
        name: v.data().visaName || v.data().name || "Unnamed Visa",
      }));

      setVisaTypes(allVisas);
      console.log(`✅ ${allVisas.length} English visas found for ${countryCode}`);
    } catch (err) {
      console.log("❌ Error fetching visas:", err);
      Alert.alert("Error", "Could not load visas for this country.");
    } finally {
      setVisaLoading(false);
    }
  };

  const handleStartPractice = () => {
    if (!selectedCountry || !selectedVisa) {
      Alert.alert("Missing Info", "Please select both country and visa type.");
      return;
    }

    navigation.navigate("Interview Session", {
  country: selectedCountry,
  visaType: selectedVisa,
  mode,
});
  };

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#0b316b" />
        <Text style={styles.loaderText}>Loading available countries...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.introText}>
          Select a country to view its available visa interview types and start practicing confidently.
        </Text>

        <View style={styles.card}>
          <Text style={styles.title}>Setup Practice Session</Text>

          {/* Country */}
          <Text style={styles.label}>Country</Text>
          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => setCountryModalVisible(true)}
          >
            <Text style={styles.inputText}>
              {selectedCountry
                ? `${getFlag(selectedCountry.code)}  ${selectedCountry.name}`
                : "Select Country"}
            </Text>
          </TouchableOpacity>

          {/* Visa Type */}
          <Text style={[styles.label, { marginTop: 12 }]}>Visa Type</Text>
          <TouchableOpacity
            style={[
              styles.inputBox,
              { opacity: selectedCountry ? 1 : 0.6 },
            ]}
            disabled={!selectedCountry}
            onPress={() => {
              if (selectedCountry) setVisaModalVisible(true);
            }}
          >
            <Text style={styles.inputText}>
              {selectedVisa ? selectedVisa.name : "Select Visa"}
            </Text>
          </TouchableOpacity>

          {/* Mode */}
          <Text style={[styles.label, { marginTop: 10 }]}>Mode</Text>
          <View style={styles.modeContainer}>
            {["Text", "Voice"].map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.modeButton, mode === m && styles.modeButtonActive]}
                onPress={() => setMode(m)}
              >
                <Text
                  style={[
                    styles.modeText,
                    mode === m && styles.modeTextActive,
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={handleStartPractice}>
            <Text style={styles.startBtnText}>Start Practice Interview</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.goodLuck}>👍 Good Luck!</Text>
        <View style={styles.disclaimerBox}>
          <Ionicons
            name="warning-outline"
            size={18}
            color="#b45309"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.disclaimerText}>
            For practice only. Not affiliated with any government agency.
          </Text>
        </View>

        {/* Country Modal */}
        <Modal visible={countryModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Country</Text>
              {countries.length === 0 ? (
                <ActivityIndicator color="#0b316b" style={{ marginVertical: 20 }} />
              ) : (
                <FlatList
                  data={countries}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.countryItem}
                      onPress={() => {
                        setSelectedCountry(item);
                        setSelectedVisa(null);
                        setCountryModalVisible(false);
                        fetchEnglishVisas(item.code);
                      }}
                    >
                      <Text style={styles.countryText}>
                        {getFlag(item.code)}  {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setCountryModalVisible(false)}
              >
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Visa Modal */}
        <Modal visible={visaModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Visa</Text>
              {visaLoading ? (
                <ActivityIndicator color="#0b316b" style={{ marginVertical: 20 }} />
              ) : visaTypes.length === 0 ? (
                <Text style={{ textAlign: "center", color: "#6b7280", marginVertical: 20 }}>
                  No English visas found for this country
                </Text>
              ) : (
                <FlatList
                  data={visaTypes}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.countryItem}
                      onPress={() => {
                        setSelectedVisa(item);
                        setVisaModalVisible(false);
                      }}
                    >
                      <Text style={styles.countryText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setVisaModalVisible(false)}
              >
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}
