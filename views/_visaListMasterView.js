import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import styles from '../styles/_visaListMasterStyle';

export default function VisaListMasterView() {
  const [visas, setVisas] = useState([]);
  const [loading, setLoading] = useState(true);

  const route = useRoute();
  const navigation = useNavigation();
  const { countryCode } = route.params;

  useEffect(() => {
    const fetchVisas = async () => {
      try {
        const snap = await getDocs(collection(db, 'visas', countryCode, 'list'));
        const list = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVisas(list);
      } catch (err) {
        console.error('Error fetching visa list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisas();
  }, [countryCode]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visas for {countryCode}</Text>

      <FlatList
        data={visas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.visaCard}>
            <Text style={styles.visaName}>{item.visaName}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}
