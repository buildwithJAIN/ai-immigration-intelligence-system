import { StyleSheet,Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1E40AF',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingName: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flexShrink: 1,
  },
  inlineEditor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  saveBtn: {
    marginLeft: 10,
    backgroundColor: '#1E40AF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  promptEditor: {
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2, // for Android subtle card look
  },
  textArea: {
    minHeight: 220,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#111',
  },
    /* -------------------------
     Agent Batch Modal Styles
  ------------------------- */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,

    shadowColor: "#0B3C74",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B3C74",
    marginBottom: 18,
    textAlign: "center",
  },

  counterRow: {
    marginBottom: 18,
  },

  counterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B3C74",
    marginBottom: 8,
  },

  counterControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  counterBtn: {
    backgroundColor: "#0B3C74",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 40,
    alignItems: "center",
  },

  counterBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  counterInput: {
    flex: 1,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D6DFEE",
    borderRadius: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#0B3C74",
    backgroundColor: "#EEF3FB",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  cancelText: {
    color: "#AAB3C5",
    fontSize: 14,
    fontWeight: "600",
  },

});

export default styles;
