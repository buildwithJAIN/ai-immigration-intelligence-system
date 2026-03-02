import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e8f0fe',
    padding: 16,
  },

  /* ---------------- Header ---------------- */

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  total: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },

  /* ---------------- Add Card ---------------- */

  addCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#60a5fa',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: 'rgba(209,213,219,0.6)',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0b316b',
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* ---------------- Country Selector ---------------- */

  countrySelectBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },

  countrySelected: {
    backgroundColor: '#0b316b',
  },

  countrySelectText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },

  /* ---------------- Type Selector ---------------- */

  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    alignItems: 'center',
  },

  typeActive: {
    backgroundColor: '#0b316b',
  },

  /* ---------------- Add Button ---------------- */

  plusBtn: {
    backgroundColor: '#0b316b',
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  plus: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },

  /* ---------------- Tree Structure ---------------- */

  countryRow: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#60a5fa',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  countryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0b316b',
  },

  categoryContainer: {
    paddingLeft: 24,
    marginBottom: 8,
  },

  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 10,
  },

  categoryText: {
    fontSize: 14,
    color: '#0b316b',
    fontWeight: '600',
  },

  /* ---------------- Back Button ---------------- */

  backBtn: {
    marginTop: 16,
    backgroundColor: '#0b316b',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 12,
  },

  backText: {
    fontWeight: '700',
    color: 'white',
    fontSize: 15,
  },
});

export default styles;