import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import styles from '../styles/_bookmarksStyle';
import { Ionicons } from '@expo/vector-icons';

export default function BookmarkView({ navigation }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [visas, setVisas] = useState([]);
  const [countryMap, setCountryMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem('loggedUser');
      if (!stored) return;

      const user = JSON.parse(stored);
      if (!user?.id) return;

      const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const data = userSnap.data();
      const userBookmarks = data.bookmarks || [];
      setBookmarks(userBookmarks);

      // Fetch country names for better display
      const countrySnap = await getDocs(collection(db, 'countries'));
      const map = {};
      countrySnap.forEach((c) => {
        const d = c.data();
        map[d.code?.toUpperCase()] = d.name;
      });
      setCountryMap(map);

      // Fetch all visa details
      const visaDetails = [];
      for (const b of userBookmarks) {
        const visaRef = doc(db, 'visas', b.countryCode, 'list', b.language, 'visas', b.visaId);
        const visaSnap = await getDoc(visaRef);
        if (visaSnap.exists()) {
          visaDetails.push({
            ...visaSnap.data(),
            id: b.visaId,
            countryCode: b.countryCode,
            language: b.language,
            savedAt: b.savedAt,
          });
        }
      }

      setVisas(visaDetails);
    } catch (err) {
      console.log('Error loading bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFlag = (code) => {
    try {
      return String.fromCodePoint(
        ...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt())
      );
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={styles.__COLORS.primary} />
        <Text style={styles.loadingText}>Loading bookmarks…</Text>
      </View>
    );
  }

  if (!visas.length) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="bookmark-outline" size={32} color="#64748b" />
        <Text style={styles.emptyText}>No bookmarks yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {visas.map((visa, i) => {
  const countryName = countryMap[visa.countryCode?.toUpperCase()] || visa.countryCode;
  const flag = getFlag(visa.countryCode || '');
  return (
    <View key={i} style={styles.card}>
      {/* Country Name */}
      <Text style={styles.countryTitle}>
        {flag} {countryName}
      </Text>

      {/* Visa Name + Category Centered with Pipe */}
      <View style={styles.centerRow}>
        <Text style={styles.title}>
          {visa.visaName}
        </Text>
        {visa.category ? (
          <>
            <Text style={styles.pipe}> | </Text>
            <Text style={styles.category}>{visa.category}</Text>
          </>
        ) : null}
      </View>

      <View style={styles.separator} />

      <Text style={styles.desc}>{visa.description}</Text>

      <View style={styles.bottomRow}>
        {visa.helpfulLink && (
          <TouchableOpacity onPress={() => Linking.openURL(visa.helpfulLink)}>
            <Text style={styles.link}>🔗 More Info</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
})}

    </ScrollView>
  );
}
