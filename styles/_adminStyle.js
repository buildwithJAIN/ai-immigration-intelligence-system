import { StyleSheet } from "react-native";

export default StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#EEF3FB",
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#0B3C74",
    marginVertical: 20,
    letterSpacing: 0.5,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 10,
    marginBottom: 22,
    alignItems: "center",

    shadowColor: "#0B3C74",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },

  disabledCard: {
    backgroundColor: "#F3F5F9",
    shadowOpacity: 0.05,
  },

  iconWrapper: {
    width: 74,
    height: 74,
    borderRadius: 20,
    backgroundColor: "#EEF3FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    color: "#0B3C74",
  },

  disabledLabel: {
    color: "#AAB3C5",
  },
});
