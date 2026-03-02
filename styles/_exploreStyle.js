import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    paddingTop: 40,
    width: '100%',
  },
  backgroundLottie: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    zIndex: -1,
    opacity: 0.35,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0b316b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 20,
    color: '#0b316b',
    marginBottom: 30,
  },
  card: {
    width: width * 0.65,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  cardPrimary: {
    backgroundColor: '#0b66ff',
  },
  cardSecondary: {
    backgroundColor: '#16a34a',
  },
  cardTertiary: {
    backgroundColor: '#ff5722',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginTop: 10,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#ffffffcc',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
});
