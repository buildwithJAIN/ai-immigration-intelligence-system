import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';

import styles from '../styles/_requestVisaStyle';

// APIs
import { fetchCategories } from '../api/categoryApi';
import { fetchCountries } from '../api/countryApi';
import { fetchUserProfile } from '../api/userApi';
import { submitVisaRequest } from '../api/requestApi';

export default function RequestVisaView({ navigation }) {
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(true);

  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [countryRes, categoryRes, user] = await Promise.all([
        fetchCountries(),
        fetchCategories(),
        fetchUserProfile(),
      ]);

      setCountries(countryRes || []);
      setCategories(categoryRes || []);
      setLanguage(user?.preferredLanguage || 'English');
    } catch (error) {
      console.error('Error loading request visa data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!selectedCountry || !selectedCategory) {
      Alert.alert('Missing fields', 'Please select country and category');
      return;
    }

    try {
      await submitVisaRequest({
        countryCode: selectedCountry.countryCode,
        countryName:selectedCountry.countryName,
        category: selectedCategory.name,
        language,
      });

      Alert.alert(
        'Request submitted',
        'Your visa request has been submitted successfully.'
      );

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request');
    }
  };

  // ⏳ Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0b316b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Request visas across countries to explore them
      </Text>

      <View style={styles.card}>
        {/* Country Selector */}
        <Text style={styles.fieldLabel}>Country</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setCountryModalVisible(true)}
        >
          <Text style={styles.selectorText}>
            {selectedCountry
              ? selectedCountry.countryName || selectedCountry.name
              : 'Select Country'}
          </Text>
        </TouchableOpacity>

        {/* Category Selector */}
        <Text style={styles.fieldLabel}>Visa Category</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Text style={styles.selectorText}>
            {selectedCategory ? selectedCategory.name : 'Select Category'}
          </Text>
        </TouchableOpacity>

        {/* Language Info */}
        <Text style={styles.languageText}>
          Preferred Language (default): {language}
        </Text>

        {/* Disclaimer */}
        <Text style={styles.infoText}>
          Visa information is generated using AI for educational purposes and may
          change. Please verify with official government sources.
        </Text>

        {/* Request Button */}
        <TouchableOpacity
          style={[
            styles.button,
            (!selectedCountry || !selectedCategory) && { opacity: 0.5 },
          ]}
          disabled={!selectedCountry || !selectedCategory}
          onPress={handleRequest}
        >
          <Text style={styles.buttonText}>
            Request Visa Information
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------------- COUNTRY MODAL ---------------- */}
<Modal
  visible={countryModalVisible}
  transparent
  animationType="fade"
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Select Country</Text>

      <FlatList
  data={countries}
  keyExtractor={(item, index) =>
    `${item.countryCode || item.code || 'country'}-${index}`
  }
  ItemSeparatorComponent={() => <View style={styles.modalDivider} />}
  renderItem={({ item }) => {
    let flag = '';

    try {
      const code = (item.countryCode || item.code || '').toUpperCase();

      if (code.length === 2) {
        flag = String.fromCodePoint(
          ...[...code].map((c) => 127397 + c.charCodeAt())
        );
      }
    } catch (e) {}

    return (
      <TouchableOpacity
        style={styles.modalItem}
        onPress={() => {
          setSelectedCountry(item);
          setCountryModalVisible(false);
        }}
      >
        <Text style={styles.modalItemText}>
          {flag ? `${flag}  ` : ''}
          {item.countryName || item.name}
        </Text>
      </TouchableOpacity>
    );
  }}
/>


      <TouchableOpacity
        style={styles.modalCloseButton}
        onPress={() => setCountryModalVisible(false)}
      >
        <Text style={styles.modalCloseButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      {/* ---------------- CATEGORY MODAL ---------------- */}
      {/* ---------------- CATEGORY MODAL ---------------- */}
<Modal
  visible={categoryModalVisible}
  transparent
  animationType="fade"
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Select Category</Text>

      <FlatList
        data={categories}
        keyExtractor={(item, index) => `${item.code}-cat-${index}`}
        ItemSeparatorComponent={() => <View style={styles.modalDivider} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
              setSelectedCategory(item);
              setCategoryModalVisible(false);
            }}
          >
            <Text style={styles.modalItemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.modalCloseButton}
        onPress={() => setCategoryModalVisible(false)}
      >
        <Text style={styles.modalCloseButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
  );
}
