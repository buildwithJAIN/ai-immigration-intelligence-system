import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#eaf1fb",
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0b316b",
    marginBottom: 20,
  },

  // ================= STATUS CARD =================
  statusCard: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
    alignItems: "center",
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0b316b",
    marginTop: 10,
  },

  statusValue: {
    marginTop: 15,
    fontSize: 22,
    fontWeight: "800",
  },

  timeLabel: {
    marginTop: 6,
    fontSize: 12,
    color: "#444",
  },

  // ================= METRICS CARD =================
  metricsCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0b316b",
    marginBottom: 15,
  },

  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  metricLabel: {
    fontSize: 14,
    color: "#334155",
  },

  metricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0b316b",
  },

  // ================= TASK CYCLE =================
  cycleCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 20,
  },

  cycleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  cycleText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#334155",
  },

  // ================= QUICK AGENT BUTTONS =================
  quickAgentWrap: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 20,
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  quickButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },

  quickButtonText: {
    fontWeight: "600",
    color: "#0b316b",
    fontSize: 14,
  },
  quickCenterRow: {
  marginTop: 12,
  alignItems: "center",
},

quickButtonCentered: {
  width: "48%",   // Same visual width as half row buttons
  backgroundColor: "#f1f5f9",
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#cbd5e1",
},


  // ================= FULL MODE BUTTONS =================
  buttonWrap: {
    marginTop: 10,
  },

  agentButton: {
    paddingVertical: 15,
    borderRadius: 12,
    marginVertical: 8,
  },

  agentButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },
});
