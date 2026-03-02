import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/_signinStyle';
import { db } from '../config/firebaseConfig';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';

const isUsernameValid = (name) => {
  const hasCapital = /[A-Z]/.test(name);
  const hasNumber = /[0-9]/.test(name);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(name);
  const hasLength = name.length >= 5;
  return hasCapital && hasNumber && hasSpecial && hasLength;
};

export default function SignInView({ navigation }) {
  const [username, setUsername] = useState('');
  const [countryName, setCountryName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [countries, setCountries] = useState([]);

  // ✅ Auto redirect if already signed in
  useEffect(() => {
    
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const q = query(collection(db, 'countries'), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCountries(list);
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  const handleSignIn = async () => {
    const trimmedName = username.trim();

    if (!trimmedName) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }
    if (!isUsernameValid(trimmedName)) {
      Alert.alert(
        'Invalid Username',
        'Username must be at least 5 characters and contain:\n• 1 capital letter\n• 1 number\n• 1 special character'
      );
      return;
    }
    if (!countryName || !countryCode) {
      Alert.alert('Error', 'Please select your country');
      return;
    }

    try {
      const q = query(collection(db, 'users'), where('username', '==', trimmedName));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        Alert.alert('Warning', 'This username already exists. Please choose another.');
        return;
      }

      await addDoc(collection(db, 'users'), {
        username: trimmedName,
        countryName,
        countryCode,
        createdAt: new Date(),
      });

      // 🔐 Store lock flag
      await AsyncStorage.setItem('userSignedIn', 'true');

      Alert.alert('Success', `Welcome, ${trimmedName} from ${countryName}!`);
      navigation.replace('Main');
    } catch (err) {
      console.error('Error saving user:', err);
      Alert.alert('Error', 'Could not save user.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Select your country</Text>
      <TouchableOpacity
        style={styles.countrySelector}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.countryText, !countryName && styles.placeholderText]}>
          {countryName || 'Select Country'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        This sign-in is optional and used only to show how many users are from each country.
        No personal information is collected. Feel free to explore the app without signing in.
      </Text>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <FlatList
            data={countries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => {
                  setCountryName(item.name);
                  setCountryCode(item.code);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.countryText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
