import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const neon = StyleSheet.create({
  // Neon glowing tiles
  tile: {
    backgroundColor: colors.glassDark,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.shadowNeonCyan,
    shadowOpacity: 0.8,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },

  // Icon container glow
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(34,211,238,0.12)",
    borderWidth: 1,
    borderColor: colors.neonCyan,
    shadowColor: colors.neonCyan,
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },

  // Gradient button
  gradientButton: {
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadowNeonBlue,
    shadowOpacity: 0.8,
    shadowRadius: 18,
  },

  gradientText: {
    color: colors.textMain,
    fontSize: 16,
    fontWeight: "600",
  },

  // Neon glowing input
  input: {
    backgroundColor: colors.glassDark,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.neonBlue,
    color: colors.textMain,
    shadowColor: colors.shadowNeonBlue,
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
});
