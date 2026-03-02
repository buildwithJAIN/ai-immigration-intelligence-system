// VisaMasterView.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/_visaMasterStyle';
import {
  generateVisasForCountry,
  generateVisaTranslations,
} from '../util/_openAiService';

export default function VisaMasterView() {
  const [countryList, setCountryList] = useState([]);
  const [selectedCode, setSelectedCode] = useState(null);
  const [visadCountries, setVisadCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [languages, setLanguages] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const [maxLangSetting, setMaxLangSetting] = useState(null);
  const [visaPrompt, setVisaPrompt] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    fetchValidCountries();
    fetchValidLanguages();
    fetchSettings();
    fetchVisaPrompt();
  }, []);

  // ----------------------------------------
  // 🔹 Fetch valid countries
  // ----------------------------------------
  const fetchValidCountries = async () => {
    try {
      const q = query(collection(db, 'countries'), where('validStatus', '==', true));
      const snapshot = await getDocs(q);

      const countries = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setCountryList(countries);

      const countriesWithVisas = [];
      for (const country of countries) {
        const visaListSnap = await getDocs(
          collection(db, 'visas', country.countryCode, 'list')
        );

        if (!visaListSnap.empty) {
          countriesWithVisas.push({
            code: country.countryCode,
            name: country.countryName,
          });
        }
      }

      setVisadCountries(countriesWithVisas);
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  // ----------------------------------------
  // 🔹 Fetch categories dynamically by country
  // ----------------------------------------
  useEffect(() => {
    if (!selectedCode) {
      setCategoryList([]);
      setSelectedCategory('');
      return;
    }

    const fetchCategoriesForCountry = async () => {
      try {
        const q = query(
          collection(db, 'categories'),
          where('countryCode', '==', selectedCode),
          where('active', '==', true)
        );

        const snapshot = await getDocs(q);

        const categories = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        console.log("Country:", selectedCode);
        console.log("Categories found:", snapshot.size);

        setCategoryList(categories);
        setSelectedCategory('');
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategoriesForCountry();
  }, [selectedCode]);

  // ----------------------------------------
  // 🔹 Fetch valid languages
  // ----------------------------------------
  const fetchValidLanguages = async () => {
    try {
      const q = query(collection(db, 'languages'), where('active', '==', true));
      const snapshot = await getDocs(q);

      const langs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setLanguages(langs);
    } catch (err) {
      console.error('Error fetching languages:', err);
    }
  };

  // ----------------------------------------
  // 🔹 Fetch settings
  // ----------------------------------------
  const fetchSettings = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'settings'));
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.type === 1) setMaxLangSetting(Number(data.value));
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // ----------------------------------------
  // 🔹 Fetch prompt
  // ----------------------------------------
  const fetchVisaPrompt = async () => {
    try {
      const promptRef = doc(db, 'settings', 'visaPrompt');
      const promptSnap = await getDoc(promptRef);
      if (promptSnap.exists()) {
        const data = promptSnap.data();
        if (data.value) setVisaPrompt(data.value);
      }
    } catch (err) {
      console.error('Error fetching visa prompt:', err);
    }
  };

  // ----------------------------------------
  // 🔹 Language toggle
  // ----------------------------------------
  const toggleLanguage = (lang) => {
    if (selectedLanguages.includes(lang.code)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang.code));
    } else {
      const limit = maxLangSetting || 3;
      if (selectedLanguages.length >= limit) {
        Alert.alert('Limit Reached', `You can only select up to ${limit} languages.`);
        return;
      }
      setSelectedLanguages([...selectedLanguages, lang.code]);
    }
  };

  // ----------------------------------------
  // 🔹 Generate visas
  // ----------------------------------------
  const handleGenerateVisas = async () => {
    if (!selectedCode || !selectedCategory) {
      Alert.alert('Validation', 'Please select country and category.');
      return;
    }

    const country = countryList.find(
      (c) => c.countryCode === selectedCode
    );

    if (!country) return;

    setLoading(true);

    try {
      const finalPrompt = `${visaPrompt}
Country: ${country.countryName} (${country.countryCode})
Category: ${selectedCategory}`;

      const englishVisa = await generateVisasForCountry(finalPrompt);

      if (!englishVisa?.visaName || !englishVisa?.type) {
        throw new Error("Invalid visa data returned.");
      }

      const visaId = englishVisa.visaName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_');

      const visaDocRef = doc(
        db,
        'visas',
        country.countryCode,
        'list',
        visaId
      );

      await setDoc(visaDocRef, {
        translations: { en: englishVisa },
        baseLanguage: "en",
        category: selectedCategory,
        type: englishVisa.type,
        createdAt: new Date().toISOString(),
        isNew: true,
      });

      Alert.alert("Success", "Visa saved successfully!");
    } catch (err) {
      console.error("Visa Generation Error:", err);
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // UI
  // ----------------------------------------
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Select Country</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCode}
            onValueChange={(code) => setSelectedCode(code)}
          >
            <Picker.Item label="-- Select a country --" value={null} />
            {countryList.map((c) => (
              <Picker.Item
                key={c.countryCode}
                label={c.countryName}
                value={c.countryCode}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Select Category</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(cat) => setSelectedCategory(cat)}
          >
            <Picker.Item label="-- Select a category --" value="" />
            {categoryList.map((cat) => (
              <Picker.Item
                key={cat.id}
                label={cat.categoryName}
                value={cat.categoryName}
              />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleGenerateVisas}
        style={[styles.generateBtn, loading && { opacity: 0.5 }]}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateBtnText}>Generate Visas</Text>}
      </TouchableOpacity>

      <View style={styles.divider} />
    </ScrollView>
  );
}