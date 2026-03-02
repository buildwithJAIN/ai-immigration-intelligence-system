import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  /* ---------- Screen ---------- */
  container: {
    flex: 1,
    backgroundColor: '#f4f7fc',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },

  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b316b',
    textAlign: 'center',
    marginBottom: 20,
  },

  /* ---------- Card ---------- */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#0b316b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },

  /* ---------- Field Labels ---------- */
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0b316b',
    marginBottom: 6,
    marginLeft: 4,
  },

  /* ---------- Selector (Touchable field) ---------- */
  selector: {
    borderWidth: 1,
    borderColor: '#d6e0f5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f9fbff',
  },

  selectorText: {
    fontSize: 15,
    color: '#0b316b',
  },

  /* ---------- Language & Info ---------- */
  languageText: {
    fontSize: 14,
    color: '#4a5d8f',
    marginTop: 6,
    marginBottom: 12,
    textAlign: 'center',
  },

  infoText: {
    fontSize: 13,
    color: '#6b7aa8',
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 18,
  },

  /* ---------- Button ---------- */
  button: {
    backgroundColor: '#0b316b',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#0b316b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  /* =================================================
     MODAL (Centered Card Style)
     ================================================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    shadowColor: '#0b316b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0b316b',
    textAlign: 'center',
    marginBottom: 12,
  },

  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 6,
  },

  modalItemText: {
    fontSize: 16,
    color: '#0b316b',
  },

  modalDivider: {
    height: 1,
    backgroundColor: '#eef2fb',
  },

  modalCloseButton: {
    marginTop: 14,
    backgroundColor: '#0b316b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  modalCloseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;
