import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loaderText: {
    marginTop: 12,
    color: "#0b316b",
    fontWeight: "600",
  },
  scroll: {
    flexGrow: 1,
    backgroundColor: "#f9fafb",
    paddingVertical: 40,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  introText: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 18,
    padding: 20,
    width: "100%",
    shadowColor: "#0b316b",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0b316b",
    textAlign: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0b316b",
    marginBottom: 6,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  inputText: {
    fontSize: 15,
    color: "#0b316b",
  },
  langRow: {
    flexDirection: "row",
    gap: 8,
  },
  langChip: {
    borderWidth: 1,
    borderColor: "#0b316b",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  langChipActive: {
    backgroundColor: "#0b316b",
  },
  langText: {
    color: "#0b316b",
    fontWeight: "600",
    fontSize: 14,
  },
  langTextActive: {
    color: "#ffffff",
  },
  modeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "#0b316b",
    borderColor: "#0b316b",
  },
  modeText: {
    color: "#0b316b",
    fontWeight: "600",
  },
  modeTextActive: {
    color: "#ffffff",
  },
  startBtn: {
    backgroundColor: "#0b316b",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 14,
  },
  startBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  goodLuck: {
    fontSize: 15,
    color: "#0b316b",
    fontWeight: "600",
    marginBottom: 10,
  },
  disclaimerBox: {
    flexDirection: "row",
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 10,
    alignItems: "center",
    width: "100%",
  },
  disclaimerText: {
    flex: 1,
    color: "#92400e",
    fontSize: 13,
  },
  // 🔹 Modal (Profile-style)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 14,
    width: "85%",
    maxHeight: "80%",
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0b316b",
    marginBottom: 10,
    textAlign: "center",
  },
  countryItem: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  countryText: {
    fontSize: 15,
    color: "#0b316b",
  },
  closeModalButton: {
    marginTop: 14,
    alignSelf: "center",
    backgroundColor: "#0b316b",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeModalText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default styles;
