import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { db } from '../config/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import styles from '../styles/_countryExplorerStyle';

export default function CountryExplorerView({ navigation }) {
  const [countries, setCountries] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  // ✅ Correct Firestore fields
  const fetchCountries = async () => {
    try {
      const q = query(collection(db, 'countries'), where('validStatus', '==', true));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      // 🔤 Sort alphabetically by correct field: countryName
      const sorted = data.sort((a, b) =>
        a.countryName.localeCompare(b.countryName, 'en', { sensitivity: 'base' })
      );

      setCountries(sorted);
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  const handleCountryPress = async (country) => {
  try {
    setLoading(true);
    console.log(`🌍 Fetching visas for ${country.countryName} (${country.countryCode})`);

    const path = collection(db, "visas", country.countryCode, "list");
    const snap = await getDocs(path);

    if (snap.empty) {
      setLoading(false);
      Alert.alert("No visa data found for this country.");
      console.warn("🚫 No data found");
      return;
    }

    const visas = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Found ${visas.length} visas`);

    setLoading(false);

    navigation.navigate("VisaListView", {
      country: country.countryName,
      countryCode: country.countryCode,
      visas,
      defaultLanguage: "en", // fallback language
    });

  } catch (err) {
    console.error("❌ Visa fetch error:", err);
    setLoading(false);
    Alert.alert("Failed to fetch visa data");
  }
};

  // 🔍 Search using correct field
  const filteredCountries = countries.filter((item) =>
    item.countryName.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderCountry = ({ item }) => {
    const flagUrl = `https://flagcdn.com/w320/${item.countryCode?.toLowerCase()}.png`;

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => handleCountryPress(item)}
      >
        <ImageBackground
          source={{ uri: flagUrl }}
          style={styles.card}
          imageStyle={styles.cardImage}
        >
          <View style={styles.overlay}>
            <Text style={styles.cardText}>{item.countryName}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      <TextInput
        style={styles.searchBar}
        placeholder="Search country..."
        placeholderTextColor="rgba(11,49,107,0.6)"
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredCountries}
        renderItem={renderCountry}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />

      <Modal transparent visible={loading} animationType="fade">
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#0b316b" />
            <Text style={styles.loadingText}>Fetching visa details...</Text>
          </View>
        </View>
      </Modal>

    </View>
  );
}
