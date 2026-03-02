import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  __COLORS: {
    primary: '#0b316b',
  },

  scrollContent: {
    padding: 14,
    paddingBottom: 90,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f7fb',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 15,
  },
  loadingText: {
    marginTop: 10,
    color: '#0b316b',
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#0b316b',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 6,
  },

  desc: {
    marginTop: 4,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },

  bottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  link: {
    color: '#0b316b',
    fontWeight: '600',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 2,
  marginBottom: 4,
},

pipe: {
  fontSize: 15,
  color: '#0b316b',
  fontWeight: '500',
  marginHorizontal: 4,
},

countryTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#0b316b',
  textAlign: 'center',
  marginBottom: 2, // reduced gap between country and visa line
},

title: {
  fontSize: 15,
  fontWeight: '700',
  color: '#0b316b',
  textAlign: 'center',
},

category: {
  fontSize: 14,
  fontWeight: '600',
  color: '#475569',
  textAlign: 'center',
},

});
export default styles;
