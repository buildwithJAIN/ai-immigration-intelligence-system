// CountryMasterView.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Switch,
} from 'react-native';
import { db } from '../config/firebaseConfig';
import {
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import styles from '../styles/_countryMasterStyle';
import { Ionicons } from '@expo/vector-icons';

export default function CountryMasterView({ navigation }) {
  const [countryName, setCountryName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [countries, setCountries] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const q = query(collection(db, 'countries'));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const sorted = data.sort((a, b) =>
        (a.countryName || '').localeCompare(b.countryName || '', 'en', {
          sensitivity: 'base',
        })
      );

      setCountries(sorted);
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!countryName.trim() || !countryCode.trim()) {
      Alert.alert('Error', 'Please enter both country name and code');
      return;
    }

    const nameTrimmed = countryName.trim();
    const codeTrimmed = countryCode.trim().toUpperCase();

    const nameExists = countries.some(
      (c) =>
        (c.countryName || '').toLowerCase() === nameTrimmed.toLowerCase() &&
        c.id !== editingId
    );

    if (nameExists) {
      Alert.alert('Duplicate Country', 'This country name is already used.');
      return;
    }

    const codeExists = countries.some(
      (c) => c.id === codeTrimmed && c.id !== editingId
    );

    if (codeExists) {
      Alert.alert('Duplicate Code', 'This ISO country code is already used.');
      return;
    }

    try {
      if (editingId) {
        // ✅ UPDATE EXISTING
        await updateDoc(doc(db, 'countries', editingId), {
          countryName: nameTrimmed,
          countryCode: codeTrimmed,
          validStatus: isValid,
          updatedAt: new Date(),
        });

        Alert.alert('Success', 'Country updated!');
      } else {
        // ✅ CREATE NEW COUNTRY WITH UPDATED SCHEMA
        await setDoc(doc(db, 'countries', codeTrimmed), {
          countryName: nameTrimmed,
          countryCode: codeTrimmed,
          validStatus: isValid,

          // 🔥 NEW REQUIRED KEYS
          categoriesGenerated: false,
          visasGenerated: false,

          // 🔁 Generation tracking
          isGenerating: false,
          generationStartedAt: null,
          lastVisaGenerationAt: null,

          createdAt: new Date(),
          updatedAt: new Date(),
        });

        Alert.alert('Success', 'Country added!');
      }
    } catch (err) {
      console.error('Error adding/updating country:', err);
      Alert.alert('Error', 'Failed to save country');
    }

    setCountryName('');
    setCountryCode('');
    setIsValid(false);
    setEditingId(null);
    fetchCountries();
  };

  const startEditing = (item) => {
    setCountryName(item.countryName || '');
    setCountryCode(item.countryCode || '');
    setIsValid(!!item.validStatus);
    setEditingId(item.id);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: item.validStatus ? '#22c55e' : '#ef4444' },
          ]}
        />
        <Text style={styles.countryItemText}>
          {item.countryName} ({item.countryCode})
        </Text>
      </View>
      <TouchableOpacity onPress={() => startEditing(item)}>
        <Ionicons name="create-outline" size={20} color="#2563eb" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.totalCountText}>Total: {countries.length}</Text>
      </View>

      <View style={styles.inputGrid}>
        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder="Country name"
          placeholderTextColor="#9ca3af"
          value={countryName}
          onChangeText={setCountryName}
        />

        <TextInput
          style={[styles.input, styles.codeInput]}
          placeholder="Code (US)"
          placeholderTextColor="#9ca3af"
          value={countryCode}
          onChangeText={setCountryCode}
        />

        <View style={styles.validWrapper}>
          <Text style={styles.validLabel}>Valid</Text>
          <Switch
            value={isValid}
            onValueChange={setIsValid}
            thumbColor={isValid ? '#3b82f6' : '#9ca3af'}
            trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddOrUpdate}>
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={countries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}