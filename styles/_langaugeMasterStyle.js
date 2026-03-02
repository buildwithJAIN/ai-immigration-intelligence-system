// _languageMasterStyle.js
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8f0fe",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0b316b",
    textAlign: "center",
    marginBottom: 16,
  },

  inputCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#60a5fa",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "rgba(209,213,219,0.6)",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0b316b",
    shadowColor: "#60a5fa",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  nameInput: {
    width: "65%",
  },
  codeInput: {
    width: "30%",
  },

  toggleWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "47%",
    backgroundColor: "#0b316b",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#60a5fa",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  toggleLabel: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  smallToggle: {
    transform: [{ scale: 0.8 }],
  },

  addBtn: {
    backgroundColor: "#0b316b",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  list: {
    marginTop: 10,
    marginBottom: 80,
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#60a5fa",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  listText: {
    color: "#0b316b",
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
  },
  editBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },

  saveBtn: {
    backgroundColor: "#0b316b",
    padding: 14,
    borderRadius: 14,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  saveBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 17,
  },
});

export default styles;
