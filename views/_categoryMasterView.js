// CategoryMasterView.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
  ActivityIndicator,
  LayoutAnimation
} from 'react-native';
import {
  collection,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import styles from '../styles/_categoryMasterStyle';
import { Ionicons } from '@expo/vector-icons';
import { generateCategoryDescription } from '../util/_openAiService';

const generateCode = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');

export default function CategoryMasterView({ navigation }) {

  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);

  const [name, setName] = useState('');
  const [type, setType] = useState('Immigrant');
  const [isValid, setIsValid] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch ALL countries
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'countries'), (snap) => {
      const rows = [];
      snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
      setCountries(rows.sort((a, b) => a.countryName.localeCompare(b.countryName)));
    });
    return () => unsub();
  }, []);

  // Fetch ALL categories
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'categories'), (snap) => {
      const rows = [];
      snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
      setCategories(rows);
    });
    return () => unsub();
  }, []);

  const toggleCountry = (code) => {
    LayoutAnimation.easeInEaseOut();
    setExpanded(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const resetForm = () => {
    setName('');
    setType('Immigrant');
    setIsValid(true);
    setEditingId(null);
    setSelectedCountry(null);
  };

  const addOrUpdate = async () => {

    if (!name.trim() || !selectedCountry) {
      Alert.alert("Error", "Enter category name and select country");
      return;
    }

    setLoading(true);

    try {

      const trimmed = name.trim();
      const code = generateCode(trimmed);

      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), {
          categoryName: trimmed,
          categoryType: type,
          valid: !!isValid,
          updatedAt: serverTimestamp()
        });
        resetForm();
        return;
      }

      const aiResponse = await generateCategoryDescription(trimmed);
      const description = aiResponse?.description || "";

      await setDoc(doc(collection(db, 'categories')), {
        countryCode: selectedCountry,
        categoryName: trimmed,
        categoryType: type,
        description,
        active: true,
        valid: !!isValid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: "admin"
      });

      resetForm();

    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setName(item.categoryName);
    setType(item.categoryType);
    setIsValid(!!item.valid);
    setSelectedCountry(item.countryCode);
  };

  const renderCountry = ({ item }) => {

    const countryCategories = categories.filter(
      c => c.countryCode === item.countryCode
    );

    return (
      <View>
        <TouchableOpacity
          style={styles.countryRow}
          onPress={() => toggleCountry(item.countryCode)}
        >
          <Text style={styles.countryTitle}>
            {item.countryName}
          </Text>

          <Ionicons
            name={expanded[item.countryCode] ? "chevron-down" : "chevron-forward"}
            size={18}
            color="#2563eb"
          />
        </TouchableOpacity>

        {expanded[item.countryCode] && (
          <View style={styles.categoryContainer}>
            {countryCategories.map(cat => (
              <View key={cat.id} style={styles.categoryRow}>
                <Text style={styles.categoryText}>
                  {cat.categoryName}
                </Text>

                <TouchableOpacity onPress={() => onEdit(cat)}>
                  <Ionicons name="create-outline" size={18} color="#2563eb" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.screen}>

      {/* Add Category Form */}
      <View style={styles.addCard}>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Category name"
          style={styles.input}
        />

        {/* Country Selector */}
        <FlatList
          horizontal
          data={countries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.countrySelectBtn,
                selectedCountry === item.countryCode && styles.countrySelected
              ]}
              onPress={() => setSelectedCountry(item.countryCode)}
            >
              <Text style={styles.countrySelectText}>
                {item.countryCode}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Type Selector */}
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              type === "Immigrant" && styles.typeActive
            ]}
            onPress={() => setType("Immigrant")}
          >
            <Text>Immigrant</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeBtn,
              type === "Non-Immigrant" && styles.typeActive
            ]}
            onPress={() => setType("Non-Immigrant")}
          >
            <Text>Non-Immigrant</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Switch value={isValid} onValueChange={setIsValid} />
          <TouchableOpacity onPress={addOrUpdate} style={styles.plusBtn}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.plus}>＋</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Tree View */}
      <FlatList
        data={countries}
        keyExtractor={(item) => item.id}
        renderItem={renderCountry}
      />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}