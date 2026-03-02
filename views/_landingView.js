import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles/_landingStyle";

export default function LandingView() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* 🎬 Background looping video */}
      <Video
  source={require("../assets/istockphoto-1018006318-640_adpp_is.mp4")}
  style={styles.video}
  resizeMode="contain"
  shouldPlay
  isLooping
  isMuted
/>

      {/* 🌫 Overlay (optional for readability) */}
      <View style={styles.overlay} />

      {/* 💬 Content at bottom */}
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Main")}
          activeOpacity={0.8}
          style={styles.continueButton}
        >
          <Text style={styles.continueText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
