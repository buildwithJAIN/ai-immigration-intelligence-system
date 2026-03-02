import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#222',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', // ensures text starts at the top for multiline
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  shortForm: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#aaa',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  countrySelector: {
  height: 50,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 12,
  paddingHorizontal: 16,
  justifyContent: 'center',
  backgroundColor: '#fff',
  marginBottom: 20,
},
countryText: {
  fontSize: 16,
  color: '#000',
},
placeholderText: {
  color: '#888',
},
modalContainer: {
  flex: 1,
  backgroundColor: '#fff',
  marginTop: 'auto',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingHorizontal: 20,
  paddingTop: 20,
  maxHeight: '25%',
},
countryItem: {
  paddingVertical: 15,
  borderBottomColor: '#eee',
  borderBottomWidth: 1,
},
modalCloseButton: {
  paddingVertical: 15,
  alignItems: 'center',
},
modalCloseText: {
  color: '#007AFF',
  fontSize: 18,
},

});
export default styles;