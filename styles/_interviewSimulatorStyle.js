import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingVertical: 16,
    backgroundColor: "#0b316b",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSub: {
    color: "#c7d2fe",
    fontSize: 13,
  },
  listContent: {
    padding: 14,
    paddingBottom: 100,
  },
  msgRow: {
    marginBottom: 10,
    flexDirection: "row",
  },
  leftRow: {
    justifyContent: "flex-start",
  },
  rightRow: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 14,
  },
  officerBubble: {
    backgroundColor: "#0b316b",
  },
  userBubble: {
    backgroundColor: "#e0e7ff",
  },
  bubbleText: {
    color: "#fff",
    fontSize: 14,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10,
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: "#111827",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#0b316b",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  voiceContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  micButton: {
    backgroundColor: "#0b316b",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  micDisabled: {
    backgroundColor: "#9ca3af",
  },
  micIcon: {
    color: "#fff",
    fontSize: 30,
  },
  voiceHint: {
    marginTop: 8,
    color: "#0b316b",
    fontSize: 13,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  countdownNumber: {
    fontSize: 64,
    color: "#fff",
    fontWeight: "800",
  },
});
