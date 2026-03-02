import { StyleSheet } from 'react-native';

const COLORS = {
  primary: '#1565C0',
  light: '#F1F3F6',
  text: '#1C2B3A',
  border: '#DDE3EB',
  gray: '#7A8B99',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
  },
  visaCard: {
    padding: 14,
    backgroundColor: COLORS.light,
    borderRadius: 10,
    marginBottom: 10,
  },
  visaName: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
