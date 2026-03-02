import { StyleSheet } from "react-native";

export default StyleSheet.create({
  scrollContent: { paddingBottom: 90 },
  wrap: { flex: 1, backgroundColor: "#e8f0fe", padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: "#6b7280", marginTop: 6 },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0b316b",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 12,
    textAlign: "center",
  },

  field: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: "#60a5fa",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  fieldLabel: { fontSize: 11, color: "#6b7280", marginBottom: 2 },
  fieldValue: { fontSize: 15, fontWeight: "700", color: "#0b316b" },
  placeholder: { color: "#9ca3af", fontWeight: "600" },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    paddingVertical: 8,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
  },
  searchBtn: {
    backgroundColor: "#0b316b",
    paddingVertical: 12,
    paddingHorizontal: 150,
    borderRadius: 12,
    alignItems: "center",
  },
  searchBtnDisabled: { opacity: 0.6 },
  searchText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  resultWrap: { marginTop: 14 },
  resultTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0b316b",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#60a5fa",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: "#0b316b", marginBottom: 6 },
  cardText: { fontSize: 14, lineHeight: 20, color: "#0b316b" },
  link: { fontSize: 14, color: "#2563eb", marginTop: 4 },

  errorBox: {
    marginTop: 12,
    backgroundColor: "#fff4f4",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  errorText: { color: "#991b1b", fontWeight: "700" },

  // Picker modal styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(209,213,219,0.3)",
  },
  pickerCancel: { fontSize: 16, color: "#6b7280", fontWeight: "600" },
  pickerDone: { fontSize: 16, color: "#2563eb", fontWeight: "700" },
  pickerTitle: { fontSize: 16, fontWeight: "700", color: "#0b316b" },
  pickerWheel: { backgroundColor: "transparent" },
  pickerItem: { fontSize: 18, color: "#0b316b" },
  subRow: {
  marginBottom: 6,  // slightly more breathing room
  marginTop: 2,
},

subKey: {
  fontWeight: "600",
  fontSize: 14,
  color: "#0b316b",
  marginRight: 4,
  textDecorationLine: "underline",   // ✅ underline the text
  textDecorationColor: "#0b316b",    // optional — matches your brand blue
  textDecorationStyle: "solid",      // solid line (use 'dotted' or 'dashed' if you like)
},


subValue: {
  fontSize: 14,
  lineHeight: 20,   // match bullet list spacing
  color: "#0b316b",
  flexShrink: 1,
},
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},

countryModal: {
  width: "85%",
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 20,
  maxHeight: "70%",
},

modalTitle: {
  fontSize: 20,
  fontWeight: "700",
  textAlign: "center",
  marginBottom: 15,
  color: "#0b316b",
},

countryRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 14,
  borderBottomWidth: 0.5,
  borderColor: "#eee",
},

flag: {
  fontSize: 20,
  marginRight: 12,
},

countryText: {
  fontSize: 16,
  color: "#0b316b",
},

closeBtn: {
  marginTop: 15,
  backgroundColor: "#0b316b",
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: "center",
},

closeText: {
  color: "#fff",
  fontWeight: "600",
},



});
