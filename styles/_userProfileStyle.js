import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f0fe',
    paddingBottom: 30,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#0b316b',
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#0b316b',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0b316b',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
    color: '#0b316b',
  },
  saveButton: {
    backgroundColor: '#0b316b',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: '85%',
    maxHeight: '80%',
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b316b',
    marginBottom: 10,
    textAlign: 'center',
  },
  countryItem: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  countryText: {
    fontSize: 15,
    color: '#0b316b',
  },
  closeModalButton: {
    marginTop: 14,
    alignSelf: 'center',
    backgroundColor: '#0b316b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeModalText: {
    color: '#fff',
    fontWeight: '600',
  },
});
export default styles