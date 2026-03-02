import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f0fe',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0b316b',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#0b316b',
    shadowColor: '#0b316b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  flagText: {
    fontSize: 28,
    marginRight: 10,
  },
  countText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0b316b',
  },
  countryName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0b316b',
  },
});
