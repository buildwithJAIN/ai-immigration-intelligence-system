import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Speech from "expo-speech";
import styles from "../styles/_interviewSimulatorStyle";

export default function InterviewSimulatorView({ route }) {
  const { country, visaType, mode } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [countdown, setCountdown] = useState(10);
  const [showCountdown, setShowCountdown] = useState(true);
  const [inputText, setInputText] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);

  const listRef = useRef(null);
  const sessionStartRef = useRef(null);

  // 🔐 Cloud Function URL (NO API KEY HERE)
  const CLOUD_FUNCTION_URL =
    "https://us-central1-immigrationguideapp.cloudfunctions.net/callGemini";

  // ----------------------------------------
  // COUNTDOWN
  // ----------------------------------------
  useEffect(() => {
    if (!showCountdown) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowCountdown(false);
          setTimeout(() => startInterview(), 400);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showCountdown]);

  // ----------------------------------------
  // AUTOSCROLL
  // ----------------------------------------
  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // ----------------------------------------
  // START INTERVIEW
  // ----------------------------------------
  const startInterview = async () => {
    sessionStartRef.current = Date.now();

    const intro = `Let's start your practice interview. I am your visa officer for ${country?.name || "your destination"
      }. Please introduce yourself and explain why you are applying for ${visaType?.name || "this visa"
      }.`;

    addMessage("officer", intro);

    if (mode === "Voice") await speakText(intro);

    setIsUserTurn(true);
  };

  const addMessage = (role, text) => {
    setMessages((prev) => [
      ...prev,
      { id: String(prev.length + 1), role, text },
    ]);
  };

  // ----------------------------------------
  // SECURE GEMINI CALL (via Cloud Function)
  // ----------------------------------------
  const getGeminiResponse = async (promptHistory) => {
    try {
      const constructedPrompt = `
You are acting as a simulated Visa Officer for a ${visaType?.name || "general"
        } interview in ${country?.name || "a country"}.

- Stay professional and concise.
- Ask one question at a time.
- Give brief feedback.
- Keep tone natural.
- Interview duration ~2 minutes.

Conversation so far:
${promptHistory
          .map(
            (m) =>
              `${m.role === "officer" ? "Officer" : "Applicant"}: ${m.text}`
          )
          .join("\n")}
`;

      const res = await fetch(CLOUD_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: constructedPrompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Cloud Function error:", data);
        return "Sorry, something went wrong.";
      }

      return data.text?.trim() || "No response generated.";
    } catch (err) {
      console.log("❌ Cloud Function error:", err);
      return "Error generating response.";
    }
  };

  // ----------------------------------------
  // TTS
  // ----------------------------------------
  const speakText = async (text) => {
    return new Promise((resolve) => {
      Speech.speak(text, {
        language: "en",
        rate: 0.95,
        onDone: resolve,
      });
    });
  };

  // ----------------------------------------
  // HANDLE USER REPLY
  // ----------------------------------------
  const handleUserReply = async (userReply) => {
    if (!userReply.trim()) return;

    addMessage("user", userReply);
    setIsUserTurn(false);
    setAiThinking(true);

    const reply = await getGeminiResponse([
      ...messages,
      { role: "user", text: userReply },
    ]);

    addMessage("officer", reply);

    if (mode === "Voice") await speakText(reply);

    setAiThinking(false);

    const elapsed = (Date.now() - sessionStartRef.current) / 1000;

    if (elapsed < 120) {
      setIsUserTurn(true);
    } else {
      const closing = "That concludes our session. Good luck!";
      addMessage("officer", closing);
      if (mode === "Voice") await speakText(closing);
    }
  };

  // ----------------------------------------
  // RENDER CHAT
  // ----------------------------------------
  const renderItem = ({ item }) => {
    const isOfficer = item.role === "officer";

    return (
      <View
        style={[
          styles.msgRow,
          isOfficer ? styles.leftRow : styles.rightRow,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isOfficer ? styles.officerBubble : styles.userBubble,
          ]}
        >
          <Text style={styles.bubbleText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  // ----------------------------------------
  // UI
  // ----------------------------------------
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Interview Simulator</Text>
        <Text style={styles.headerSub}>
          {country?.name || "—"} · {visaType?.name || "—"} · {mode || "—"}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      {mode === "Text" && (
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your answer..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            editable={isUserTurn && !aiThinking && !showCountdown}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || aiThinking || !isUserTurn) &&
              styles.sendButtonDisabled,
            ]}
            onPress={() => {
              handleUserReply(inputText.trim());
              setInputText("");
            }}
            disabled={!inputText.trim() || aiThinking || !isUserTurn}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}

      {showCountdown && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownNumber}>
            {countdown > 0 ? countdown : "Let's start!"}
          </Text>
        </View>
      )}
    </View>
  );
}