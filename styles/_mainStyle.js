import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },

  container: {
    flex: 1,
    backgroundColor: '#e8f0fe',
    paddingTop: 60,
    alignItems: 'center',
  },

  topRightIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },

  /* ================= SYSTEM INTRO ================= */

  welcomeCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    width: width * 0.9,
    shadowColor: '#0b316b',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    borderColor: 'rgba(11,49,107,0.15)',
  },

  systemTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0b316b',
    textAlign: 'center',
    marginBottom: 8,
  },

  systemSubtitle: {
    fontSize: 15,
    color: '#2a2a2a',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },

  systemDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },

  /* ================= LOGGED IN ================= */

  loggedInTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b316b',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 8,
  },

  loggedInDescription: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },

  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginTop: 12,
  },

  disclaimerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },

  /* ================= AUTH CARD ================= */

  loginCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    shadowColor: '#0b316b',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(11,49,107,0.15)',
    alignItems: 'center',
  },

  authTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b316b',
    textAlign: 'center',
    marginBottom: 4,
  },

  authSubtitle: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },

  inputField: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(11,49,107,0.2)',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    fontSize: 14,
    color: '#0b316b',
  },

  button: {
    backgroundColor: '#0b316b',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 6,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  createAccountLink: {
    marginTop: 16,
    fontSize: 14,
    color: '#0b316b',
    textAlign: 'center',
    fontWeight: '600',
  },

  /* ================= MODALS ================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },

  countryItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },

  countryText: {
    fontSize: 15,
    color: '#0b316b',
  },
  switchAuthLink: {
    marginTop: 18,
    fontSize: 14,
    color: '#0b316b',
    textAlign: 'center',
    fontWeight: '600',
  },
});