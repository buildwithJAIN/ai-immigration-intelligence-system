import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,TouchableOpacity,FlatList,Modal,Alert,ScrollView,} from 'react-native';
import styles from '../styles/_abbreviationMasterStyle'
import { db } from '../config/firebaseConfig';
import {collection,addDoc,getDocs,orderBy,query,} from 'firebase/firestore';

export default function AbbreviationMasterView({ navigation }) {
  const [shortForm, setShortForm] = useState('');
  const [fullForm, setFullForm] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('');
  const [countries, setCountries] = useState([]);
  const [abbreviations, setAbbreviations] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchCountries();
    fetchAbbreviations();
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

  const fetchAbbreviations = async () => {
    try {
      const q = query(collection(db, 'abbreviations'), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAbbreviations(list);
    } catch (err) {
      console.error('Error fetching abbreviations:', err);
    }
  };

  const addAbbreviation = async () => {
    if (!shortForm.trim() || !fullForm.trim() || !description.trim() || !country) {
      Alert.alert('Error', 'Please fill all fields and select a country');
      return;
    }
    try {
      await addDoc(collection(db, 'abbreviations'), {
        shortForm: shortForm.trim(),
        fullForm: fullForm.trim(),
        description: description.trim(),
        country,
        createdAt: new Date(),
      });
      Alert.alert('Success', `${shortForm} added for ${country}!`);
      setShortForm('');
      setFullForm('');
      setDescription('');
      setCountry('');
      fetchAbbreviations();
    } catch (err) {
      console.error('Error adding abbreviation:', err);
      Alert.alert('Error', 'Failed to add abbreviation');
    }
  };

  return (
    <View style={styles.container}>

      <ScrollView keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.input}
          placeholder="Short Form (e.g., OPT)"
          value={shortForm}
          onChangeText={setShortForm}
        />
        <TextInput
          style={styles.input}
          placeholder="Full Form"
          value={fullForm}
          onChangeText={setFullForm}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Country Picker */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.countryText, !country && styles.placeholderText]}>
            {country || 'Select Country'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={addAbbreviation}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>

        <FlatList
            data={abbreviations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.item}>
                <Text style={styles.shortForm}>
                    {item.shortForm} – ({item.country})
                </Text>
                </View>
            )}
        />


        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for countries */}
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
                  setCountry(item.name);
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
