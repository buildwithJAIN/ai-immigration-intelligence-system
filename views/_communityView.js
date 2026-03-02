import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import styles from '../styles/_communityStyle';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export default function CommunityView() {
  const [countryStats, setCountryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountryStats();
  }, []);

  const fetchCountryStats = async () => {
    try {
      // Fetch all valid countries
      const countrySnap = await getDocs(collection(db, 'countries'));
      const countries = countrySnap.docs.map((doc) => ({
        code: doc.data().countryCode?.toUpperCase(),
        name: doc.data().countryName,
        valid: doc.data().validStatus,
      }));

      // Fetch all users
      const userSnap = await getDocs(collection(db, 'users'));
      const users = userSnap.docs.map((doc) => doc.data());

      // Build statistics based on matching country codes
      const stats = countries.map((country) => {
        const count = users.filter(
          (u) =>
            u.countryCode &&
            u.countryCode.toUpperCase().trim() === country.code
        ).length;

        return {
          code: country.code,
          name: country.name,
          count,
        };
      });

      // Filter: only valid countries with at least 1 user
      const filtered = stats
        .filter((c) => c.count > 0 && c.name && c.code)
        .sort((a, b) => b.count - a.count);

      setCountryStats(filtered);
    } catch (error) {
      console.error('❌ Error fetching country stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return '';
    try {
      return countryCode
        .toUpperCase()
        .replace(/./g, (char) =>
          String.fromCodePoint(127397 + char.charCodeAt())
        );
    } catch {
      return '';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.countryCard} activeOpacity={0.8}>
      <Text style={styles.flagText}>{getFlagEmoji(item.code)}</Text>
      <Text style={styles.countText}>
        {item.count} user{item.count > 1 ? 's' : ''}
      </Text>
      <Text style={styles.countryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0b316b" />
      ) : (
        <FlatList
          data={countryStats}
          keyExtractor={(item) => item.code}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}
