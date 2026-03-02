import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../styles/_appLayoutStyle';

export default function AppLayout({ children }) {
  const navigation = useNavigation();
  const route = useRoute();

  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);

  // 🔁 Listen to Firebase Auth state in real-time
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setRole(data.role || 'user');
          } else {
            setUserData(null);
            setRole(null);
          }
        } catch (err) {
          console.log('Error fetching user data:', err);
        }
      } else {
        setUserData(null);
        setRole(null);
      }
    });

    return unsubscribe;
  }, []);

  const titleMap = {
    Main: 'Main',
    ExploreView: 'Explore',
    AdminView: 'Admin',
    CommunityView: 'Community',
    VisaListView: 'Visa List',
    VisaAdvisorView: 'Visa Advisory',
    CountryExplorerView: 'Countries',
    CategoryMasterView: 'Category Master',
    VisaMasterView: 'Visa Master',
    CountryMasterView: 'Country Master',
    LanguageMasterView: 'Language Master',
    Settings: 'Settings',
    Bookmarks: 'Bookmarks',
    RequestVisa: 'RequestVisa',
  };

  const title = titleMap[route.name] || '';

  const handleNav = (target, needsLogin = false) => {
    if (target === 'Main' || target === 'CommunityView') {
      navigation.navigate(target);
      return;
    }
    if (needsLogin && !userData) {
      Alert.alert('Login Required', 'Please log in to access this section.');
      return;
    }
    navigation.navigate(target);
  };

  const isActive = (name) => route.name === name;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* PAGE CONTENT */}
      <View style={styles.content}>{children}</View>

      {/* FOOTER */}
      <View style={styles.footer}>
        {/* MAIN */}
        <TouchableOpacity onPress={() => handleNav('Main')}>
          <Ionicons
            name="home-outline"
            size={24}
            color={isActive('Main') ? '#fff' : '#ffffffb0'}
          />
        </TouchableOpacity>

        {/* EXPLORE */}
        <TouchableOpacity onPress={() => handleNav('ExploreView', true)}>
          <Ionicons
            name="compass-outline"
            size={24}
            color={isActive('ExploreView') ? '#fff' : '#ffffffb0'}
          />
        </TouchableOpacity>
        {/* Request */}
        <TouchableOpacity onPress={() => handleNav('RequestVisa', true)}>
          <Ionicons
            name="mail-outline"
            size={24}
            color={isActive('RequestVisa') ? '#fff' : '#ffffffb0'}
          />
        </TouchableOpacity>

        {/* ROLE-BASED ICON */}
        {/* BOOKMARK or SETTINGS ICON */}
{role === 'admin' ? (
  // Admin sees Settings icon
  <TouchableOpacity onPress={() => handleNav('AdminView', true)}>
    <Ionicons
      name="settings-outline"
      size={24}
      color={isActive('AdminView') ? '#fff' : '#ffffffb0'}
    />
  </TouchableOpacity>
) : (
  // Everyone else (guest or user) sees Bookmark icon
  <TouchableOpacity
    onPress={() => {
      if (!userData) {
        Alert.alert('Login Required', 'Please log in to view your saved bookmarks.');
        return;
      }
      handleNav('Bookmarks', true);
    }}
  >
    <Ionicons
      name="bookmark"
      size={24}
      color={isActive('Bookmarks') ? '#fff' : '#ffffffb0'}
    />
  </TouchableOpacity>
)}


        {/* COMMUNITY */}
        <TouchableOpacity onPress={() => handleNav('CommunityView')}>
          <Ionicons
            name="people-outline"
            size={24}
            color={isActive('CommunityView') ? '#fff' : '#ffffffb0'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
