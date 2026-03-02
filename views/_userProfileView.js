import { CommonActions } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebaseConfig';
import {
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, updateDoc, getDocs, collection, where, query } from 'firebase/firestore';
import styles from '../styles/_userProfileStyle';

export default function ProfileView({ navigation }) {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [countries, setCountries] = useState([]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  // password change fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVerified, setPasswordVerified] = useState(false); // ✅ new

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const stored = await AsyncStorage.getItem('loggedUser');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setFullName(parsed.fullName || '');
      // store code for now; name will be fetched
      setSelectedCountry({ countryCode: parsed.countryCode });
      fetchCountryName(parsed.countryCode);
    }
  };

  const fetchCountryName = async (code) => {
    try {
      const q = query(collection(db, 'countries'), where('validStatus', '==', true));
      const snapshot = await getDocs(q);
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          data.countryCode?.toUpperCase() === code?.toUpperCase() ||
          data.code?.toUpperCase() === code?.toUpperCase()
        ) {
          setSelectedCountry({
            countryCode: code,
            countryName: data.countryName || data.name,
          });
        }
      });
    } catch (err) {
      console.log('Error fetching country name:', err);
    }
  };

  const fetchCountries = async () => {
    try {
      const q = query(collection(db, 'countries'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        countryCode: doc.data().countryCode || doc.data().code,
        countryName: doc.data().countryName || doc.data().name,
      }));
      list.sort((a, b) => a.countryName.localeCompare(b.countryName));
      setCountries(list);
    } catch (err) {
      console.log('Error fetching countries:', err);
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!user) return;
      if (!fullName.trim() || !selectedCountry) {
        Alert.alert('Missing Fields', 'Please fill in all details.');
        return;
      }

      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        fullName: fullName.trim(),
        countryCode: selectedCountry.countryCode,
      });

      const updated = { ...user, fullName, countryCode: selectedCountry.countryCode };
      await AsyncStorage.setItem('loggedUser', JSON.stringify(updated));

      Alert.alert('Profile Updated', 'Your profile has been successfully updated.');
    } catch (err) {
      console.log('Update error:', err);
      Alert.alert('Error', 'Could not update profile.');
    }
  };

  const handleVerifyOldPassword = async () => {
    if (!oldPassword) {
      Alert.alert('Missing Field', 'Please enter your old password.');
      return;
    }
    try {
      const userAuth = auth.currentUser;
      const credential = EmailAuthProvider.credential(userAuth.email, oldPassword);
      await reauthenticateWithCredential(userAuth, credential);
      setPasswordVerified(true);
      Alert.alert('Verified', 'Old password verified. You can now set a new password.');
    } catch (err) {
      console.log('Verify error:', err);
      Alert.alert('Incorrect Password', 'Your current password is incorrect.');
      setPasswordVerified(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordVerified) {
      Alert.alert('Verification Required', 'Please verify your old password first.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill new password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirm password must match.');
      return;
    }

    try {
      const userAuth = auth.currentUser;
      await updatePassword(userAuth, newPassword);
      Alert.alert('Success', 'Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordVerified(false);
    } catch (err) {
      console.log('Password update error:', err);
      Alert.alert('Error', 'Failed to update password. Try again.');
    }
  };

  const handleLogout = async () => {
  try {
    await signOut(auth);
    await AsyncStorage.removeItem('loggedUser');

    // 🔥 Reset navigation history and go to Main page
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }], // make sure this matches your MainView screen name
      })
    );
  } catch (err) {
    console.log('Logout error:', err);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile Management</Text>
          <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#6b7280"
            value={fullName}
            onChangeText={setFullName}
          />

          <TouchableOpacity
            style={styles.input}
            activeOpacity={0.8}
            onPress={() => {
              setCountryModalVisible(true);
              fetchCountries();
            }}
          >
            <Text
              style={{
                color: selectedCountry ? '#0b316b' : '#6b7280',
                fontSize: 15,
              }}
            >
              {selectedCountry?.countryName
                ? selectedCountry.countryName
                : 'Select Country'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        {/* Change Password Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Change Password</Text>

          {/* Verify Old Password */}
          <TextInput
            style={styles.input}
            placeholder="Old Password"
            placeholderTextColor="#6b7280"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <TouchableOpacity
            style={[styles.saveButton, { marginBottom: 8 }]}
            onPress={handleVerifyOldPassword}
          >
            <Text style={styles.saveButtonText}>Verify Old Password</Text>
          </TouchableOpacity>

          {/* New Passwords (only visible after verification) */}
          {passwordVerified && (
            <>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#6b7280"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                placeholderTextColor="#6b7280"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                <Text style={styles.saveButtonText}>Update Password</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Country Modal */}
        <Modal visible={countryModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Country</Text>
              {countries.length === 0 ? (
                <ActivityIndicator color="#0b316b" style={{ marginVertical: 20 }} />
              ) : (
                <FlatList
                  data={countries}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => {
                    let flag = '';
                    try {
                      flag = String.fromCodePoint(
                        ...[...item.countryCode.toUpperCase()].map((c) => 127397 + c.charCodeAt())
                      );
                    } catch (e) {}
                    return (
                      <TouchableOpacity
                        style={styles.countryItem}
                        onPress={() => {
                          setSelectedCountry(item);
                          setCountryModalVisible(false);
                        }}
                      >
                        <Text style={styles.countryText}>
                          {flag ? `${flag}  ` : ''}{item.countryName}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setCountryModalVisible(false)}
              >
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}
