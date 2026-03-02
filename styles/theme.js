import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const layout = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDark,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export const typography = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textMain,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textSoft,
    marginTop: 4,
  },

  sectionHeader: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.neonCyan,
  },

  label: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
