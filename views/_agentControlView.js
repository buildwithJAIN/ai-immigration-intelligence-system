import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import styles from "../styles/_agentControlStyle";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export default function AgentControlView() {
  const [loading, setLoading] = useState(false);
  const [engineState, setEngineState] = useState(undefined);

  // ===============================
  // 📡 Live Engine Listener (Safe)
  // ===============================
  useEffect(() => {
    const engineRef = doc(db, "agentState", "engine");

    const unsub = onSnapshot(
      engineRef,
      (snap) => {
        if (snap.exists()) {
          setEngineState(snap.data());
        } else {
          setEngineState(null);
        }
      },
      (error) => {
        console.log("Snapshot error:", error);
        setEngineState(null);
      }
    );

    return () => unsub();
  }, []);

  // ===============================
  // 🟢 Start Full Agent
  // ===============================
  const startAgent = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://us-central1-immigrationguideapp.cloudfunctions.net/startAgentMode",
        { method: "POST" }
      );

      const data = await res.json();
      console.log("Start response:", data);

      if (!res.ok) {
        Alert.alert("Error", data?.error || "Failed to start agent");
      }
    } catch (err) {
      console.log("Start error:", err);
      Alert.alert("Error", "Unable to reach server.");
    }
    setLoading(false);
  };

  // ===============================
  // 🔴 Stop Agent
  // ===============================
  const stopAgent = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://us-central1-immigrationguideapp.cloudfunctions.net/stopAgentMode",
        { method: "POST" }
      );

      const data = await res.json();
      console.log("Stop response:", data);

      if (!res.ok) {
        Alert.alert("Error", data?.error || "Failed to stop agent");
      }
    } catch (err) {
      console.log("Stop error:", err);
      Alert.alert("Error", "Unable to reach server.");
    }
    setLoading(false);
  };

  // ===============================
  // 🧠 Single Agent Trigger
  // ===============================
  const runSingleAgent = async (type) => {
    if (!engineState) return;

    if (engineState.mode === "running") {
      Alert.alert("Agent Running", "Another agent is already running.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "https://us-central1-immigrationguideapp.cloudfunctions.net/startSingleAgent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        }
      );

      const data = await res.json();
      console.log("Single agent response:", data);

      if (!res.ok) {
        Alert.alert("Error", data?.error || "Failed to start agent");
      }
    } catch (err) {
      console.log("Single agent error:", err);
      Alert.alert("Error", "Unable to reach server.");
    }

    setLoading(false);
  };

  const TASK_SEQUENCE = [
    "batchCountries",
    "batchLanguages",
    "batchCategory",
    "batchLanguageTranslations",
    "batchVisas"
  ];

  const currentTask =
    engineState && TASK_SEQUENCE[engineState.currentTaskIndex ?? 0];

  const getStatusColor = () => {
    if (!engineState) return "#64748b";
    if (engineState.mode === "running") return "#16a34a";
    if (engineState.mode === "paused") return "#f59e0b";
    if (engineState.mode === "stopped") return "#b91c1c";
    return "#64748b";
  };

  const formatDate = (timestamp) => {
    try {
      return timestamp?.toDate().toLocaleString() ?? "—";
    } catch {
      return "—";
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🤖 AI Agent Control Center</Text>

      {/* STATUS CARD */}
      <View style={styles.statusCard}>
        <Icon name="heartbeat" size={40} color="#0b316b" />
        <Text style={styles.statusTitle}>Engine Status</Text>

        {engineState === undefined && (
          <ActivityIndicator size="small" color="#0b316b" />
        )}

        {engineState === null && (
          <Text style={{ marginTop: 10, color: "#64748b" }}>
            Engine not initialized
          </Text>
        )}

        {engineState && (
          <>
            <Text
              style={[
                styles.statusValue,
                { color: getStatusColor() },
              ]}
            >
              {engineState.mode?.toUpperCase() ?? "UNKNOWN"}
            </Text>

            <Text style={styles.timeLabel}>
              Last Run: {formatDate(engineState.lastRunAt)}
            </Text>
          </>
        )}
      </View>

      {/* LIVE METRICS */}
      {engineState && (
        <View style={styles.metricsCard}>
          <Text style={styles.sectionTitle}>Live Agent Metrics</Text>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Current Task</Text>
            <Text style={styles.metricValue}>
              {currentTask || "—"}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Countries Generated</Text>
            <Text style={styles.metricValue}>
              {engineState.currentCountryIndex ?? 0}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Languages Generated</Text>
            <Text style={styles.metricValue}>
              {engineState.currentLanguageIndex ?? 0}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Categories Generated</Text>
            <Text style={styles.metricValue}>
              {engineState.currentCategoryIndex ?? 0}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Tokens Used Today</Text>
            <Text style={styles.metricValue}>
              {engineState.tokensUsedToday ?? 0}
            </Text>
          </View>
        </View>
      )}

      {/* ===============================
           🟦 SINGLE AGENT BUTTONS
         =============================== */}
      {/* ===============================
     🟦 SINGLE AGENT BUTTONS
   =============================== */}
      {engineState && (
        <View style={styles.quickAgentWrap}>
          <Text style={styles.sectionTitle}>Run Individual Agent</Text>

          {/* Row 1 */}
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => runSingleAgent(1)}
              disabled={loading}
            >
              <Text style={styles.quickButtonText}>Countries</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => runSingleAgent(2)}
              disabled={loading}
            >
              <Text style={styles.quickButtonText}>Languages</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => runSingleAgent(3)}
              disabled={loading}
            >
              <Text style={styles.quickButtonText}>Category</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => runSingleAgent(5)}
              disabled={loading}
            >
              <Text style={styles.quickButtonText}>Translations</Text>
            </TouchableOpacity>
          </View>

          {/* Row 3 - VISA CENTERED */}
          <View style={styles.quickCenterRow}>
            <TouchableOpacity
              style={styles.quickButtonCentered}
              onPress={() => runSingleAgent(4)}
              disabled={loading}
            >
              <Text style={styles.quickButtonText}>Visas</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}


      {/* FULL MODE BUTTONS */}
      <View style={styles.buttonWrap}>
        <TouchableOpacity
          style={[styles.agentButton, { backgroundColor: "#0b316b" }]}
          onPress={startAgent}
          disabled={loading}
        >
          <Text style={styles.agentButtonText}>
            Start Full Agent Mode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.agentButton, { backgroundColor: "#b91c1c" }]}
          onPress={stopAgent}
          disabled={loading}
        >
          <Text style={styles.agentButtonText}>
            Stop Agent Mode
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#0b316b"
          style={{ marginTop: 20 }}
        />
      )}
    </ScrollView>
  );
}
