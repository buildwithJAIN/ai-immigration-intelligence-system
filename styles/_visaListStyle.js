import { StyleSheet, Platform } from 'react-native';

const COLORS = {
  bg: '#e8f0fe',               // app light-blue background
  card: 'rgba(255,255,255,0.78)',
  text: '#0f172a',             // slate-900-ish
  primary: '#0b316b',          // brand blue (as per previous theme)
  softBorder: 'rgba(255,255,255,0.55)',
  link: '#1d4ed8',
  shadow: Platform.OS === 'ios' ? '#000' : '#8b95a5',
  subtle: '#eef2f7',
};

const styles = StyleSheet.create({
  __COLORS: COLORS, // exposed for JS file to read primary color (loading spinner text)

  wrap: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // decorative blobs
  blobTL: {
    position: 'absolute',
    top: -30,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(59,130,246,0.18)',
    filter: 'blur(12px)', // ignored on native, harmless
  },
  blobBR: {
    position: 'absolute',
    right: -40,
    bottom: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(14,165,233,0.16)',
  },

  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 36,
  },

  title: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
    color: COLORS.primary,
    letterSpacing: 0.3,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 0.6,
    borderColor: COLORS.softBorder,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    color: COLORS.text,
    textDecorationLine: 'underline',
  },
  cardField: {
    fontSize: 14,
    marginBottom: 4,
    color: COLORS.text,
  },
  bold: { fontWeight: '700' },

  descBox: {
    backgroundColor: COLORS.subtle,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#dbeafe',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
  },

  link: {
    fontSize: 14,
    color: COLORS.link,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '700',
  },

  badgeNew: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16,185,129,0.15)',
    color: '#065f46',
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },

  // floating side tabs
  filterButton: {
    position: 'absolute',
    right: 0,
    width: 34,
    height: 110,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 60,
    borderBottomLeftRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
  },
  languageButton: {
    position: 'absolute',
    left: 0,
    width: 34,
    height: 110,
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 60,
    borderBottomRightRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
  },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#ffffff',
    width: '88%',
    height:'63%',
    padding: 20,
    borderRadius: 18,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 6,
    marginBottom: 10,
  },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
    justifyContent: 'center',
  },

  chip: {
    backgroundColor: '#f4f7fb',
    borderRadius: 22,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#f4f7fb',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearText: {
    color: '#0ea5e9',
    fontWeight: '800',
    fontSize: 15,
  },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-end',
  },
  closeModal: {
    color: '#1565C0',
    fontWeight: '800',
    fontSize: 15,
  },

  // states
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#334155',
    fontWeight: '600',
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 24,
  },
  emptyText: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  bottomRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 10,
},
bookmarkButton: {
  padding: 6,
},

});

export default styles;
