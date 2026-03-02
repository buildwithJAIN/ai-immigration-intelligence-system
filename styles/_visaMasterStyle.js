// _visaMasterStyle.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f0fe',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    color: '#0b316b',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#60a5fa',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0b316b',
    marginBottom: 6,
  },
  pickerWrapper: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    borderWidth: 1,
    color:'yellow',
    borderColor: '#0b316b',
    marginBottom: 12,
    height:'200'
  },
  languageBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  chipSelected: {
    backgroundColor: '#0b316b',
  },
  chipText: {
    color: '#0b316b',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: 'white',
  },
  generateBtn: {
    backgroundColor: '#0b316b',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  generateBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  divider: {
    marginVertical: 20,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    borderBottomWidth: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#0b316b',
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
  },
  countryItem: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#60a5fa',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0b316b',
  },
});
