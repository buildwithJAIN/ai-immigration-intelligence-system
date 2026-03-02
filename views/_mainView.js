import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
  Keyboard,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import styles from '../styles/_mainStyle';
import { Ionicons } from '@expo/vector-icons';

export default function MainView({ navigation }) {
  const [mode, setMode] = useState('login');
  const [checking, setChecking] = useState(false);

  const [email, setEmail] = useState('');
  const [userExists, setUserExists] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const [signedIn, setSignedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  /* ---------------- AUTH LISTENER ---------------- */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && user.emailVerified) {
        const snap = await getDocs(
          query(collection(db, 'users'), where('email', '==', user.email))
        );

        if (!snap.empty) {
          const data = snap.docs[0].data();
          const fullData = { id: user.uid, ...data };
          setUserData(fullData);
          setSignedIn(true);
          await AsyncStorage.setItem('loggedUser', JSON.stringify(fullData));
        }
      } else {
        setSignedIn(false);
        setUserData(null);
      }
    });

    return unsubscribe;
  }, []);

  /* ---------------- LOAD SIGNUP DATA ---------------- */
  useEffect(() => {
    if (mode === 'signup') {
      fetchCountries();
      fetchLanguages();
    }
  }, [mode]);

  const fetchCountries = async () => {
    const q = query(
      collection(db, 'countries'),
      where('validStatus', '==', true)
    );
    const snapshot = await getDocs(q);

    const list = snapshot.docs.map((d) => ({
      id: d.id,
      countryCode: d.data().countryCode,
      countryName: d.data().countryName,
    }));

    list.sort((a, b) => a.countryName.localeCompare(b.countryName));
    setCountries(list);
  };

  const fetchLanguages = async () => {
    const q = query(collection(db, 'languages'), where('active', '==', true));
    const snapshot = await getDocs(q);

    const list = snapshot.docs.map((d) => ({
      id: d.id,
      code: d.data().code,
      name: d.data().name,
      nativeName: d.data().nativeName,
    }));

    list.sort((a, b) => a.name.localeCompare(b.name));
    setLanguages(list);
  };

  const resetAll = () => {
    setChecking(false);
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setSelectedCountry(null);
    setSelectedLanguage(null);
    setUserExists(null);
  };

  const switchToSignup = () => {
    setMode('signup');
    resetAll();
  };

  /* ---------------- EMAIL CHECK ---------------- */
  const handleEmailCheck = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter an email address.');
      return;
    }

    setChecking(true);
    Keyboard.dismiss();

    try {
      const q = query(
        collection(db, 'users'),
        where('email', '==', email.trim().toLowerCase())
      );
      const snap = await getDocs(q);
      setUserExists(!snap.empty);
    } catch {
      Alert.alert('Error', 'Could not verify email.');
    } finally {
      setChecking(false);
    }
  };

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async () => {
    if (!password) {
      Alert.alert('Missing Password', 'Please enter your password.');
      return;
    }

    setChecking(true);
    Keyboard.dismiss();

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      if (!userCred.user.emailVerified) {
        Alert.alert('Email Not Verified', 'Please verify your email.');
        await sendEmailVerification(userCred.user);
        await signOut(auth);
      }
    } catch {
      Alert.alert('Login Failed', 'Invalid credentials.');
    } finally {
      setChecking(false);
    }
  };

  /* ---------------- SIGNUP ---------------- */
  const handleCreateAccount = async () => {
    if (
      !fullName.trim() ||
      !selectedCountry ||
      !selectedLanguage ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setChecking(true);
    Keyboard.dismiss();

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await sendEmailVerification(userCred.user);

      const uid = userCred.user.uid;
      const userRef = doc(db, 'users', uid);

      const userObj = {
        id: uid,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        countryCode: selectedCountry.countryCode,
        preferredLanguage: selectedLanguage.code,
        role: 'user',
        bookmarks: [],
        createdAt: serverTimestamp(),
      };

      await setDoc(userRef, userObj);
      await AsyncStorage.setItem('loggedUser', JSON.stringify(userObj));

      Alert.alert(
        'Verify Email',
        'Verification link sent. Please verify before login.'
      );

      setMode('login');
      resetAll();
    } catch (err) {
      Alert.alert('Signup Failed', err.message);
    } finally {
      setChecking(false);
    }
  };

  /* ================= UI ================= */

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>

        {/* Profile Icon */}
        {signedIn && (
          <View style={styles.topRightIcon}>
            <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
              <Ionicons name="person-circle-outline" size={34} color="#333" />
            </TouchableOpacity>
          </View>
        )}

        {/* SYSTEM INTRO */}
        <View style={styles.welcomeCard}>
          <Text style={styles.systemTitle}>
            Immigration Intelligence Guide System
          </Text>

          <Text style={styles.systemSubtitle}>
            An AI-powered platform designed to simplify visa exploration and immigration pathways worldwide.
          </Text>

          <Text style={styles.systemDescription}>
            This system helps users understand visa categories, receive intelligent guidance, prepare for interviews, and manage saved visa information in a structured and reliable way.
          </Text>

          {signedIn && (
            <View style={{ marginTop: 18 }}>
              <Text style={styles.loggedInTitle}>
                Welcome, {userData?.fullName || 'User'}
              </Text>

              <Text style={styles.loggedInDescription}>
                You are now signed in. You can explore visa programs, use the Visa Advisor, and manage your saved information securely.
              </Text>

              <Text style={styles.disclaimerTitle}>Disclaimer</Text>

              <Text style={styles.disclaimerText}>
                This platform provides AI-generated informational guidance. Always verify details with official immigration authorities before making decisions.
              </Text>
            </View>
          )}
        </View>

        {/* AUTH SECTION */}
        {!signedIn && (
          <View style={styles.loginCard}>
            {mode === 'login' ? (
              <>
                <Text style={styles.authTitle}>Access Your Account</Text>
                <Text style={styles.authSubtitle}>
                  Enter your email to continue.
                </Text>

                <TextInput
                  style={styles.inputField}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                />

                {userExists === null && (
                  <TouchableOpacity style={styles.button} onPress={handleEmailCheck}>
                    <Text style={styles.buttonText}>Continue</Text>
                  </TouchableOpacity>
                )}

                {userExists === true && (
                  <>
                    <TextInput
                      style={styles.inputField}
                      placeholder="Password"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                      <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                  </>
                )}

                {userExists === false && (
                  <TouchableOpacity onPress={switchToSignup}>
                    <Text style={styles.createAccountLink}>
                      Create new account
                    </Text>
                  </TouchableOpacity>
                )}

                {checking && <ActivityIndicator style={{ marginTop: 12 }} />}
              </>
            ) : (
              <>
                <Text style={styles.authTitle}>Create Your Profile</Text>
                <Text style={styles.authSubtitle}>
                  Set up your account to start exploring visa programs and advisory tools.
                </Text>

                <TextInput
                  style={styles.inputField}
                  placeholder="Full name"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <TextInput
                  style={styles.inputField}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                />

                <TouchableOpacity
                  style={styles.inputField}
                  onPress={() => setCountryModalVisible(true)}
                >
                  <Text>
                    {selectedCountry
                      ? selectedCountry.countryName
                      : 'Select Country'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inputField}
                  onPress={() => setLanguageModalVisible(true)}
                >
                  <Text>
                    {selectedLanguage
                      ? `${selectedLanguage.name} (${selectedLanguage.nativeName})`
                      : 'Preferred Language'}
                  </Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.inputField}
                  placeholder="Password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <TextInput
                  style={styles.inputField}
                  placeholder="Confirm password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleCreateAccount}
                >
                  <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  setMode('login');
                  resetAll();
                }}>
                  <Text style={styles.switchAuthLink}>
                    Already have an account? Login
                  </Text>
                </TouchableOpacity>

                {checking && <ActivityIndicator style={{ marginTop: 12 }} />}
              </>
            )}
          </View>
        )}

      </View>
    </ScrollView>
  );
}