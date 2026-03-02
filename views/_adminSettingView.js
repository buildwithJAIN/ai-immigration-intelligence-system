import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/_adminSettingStyle';
import { db } from '../config/firebaseConfig';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

export default function AdminSettingsView() {
  const [activeSetting, setActiveSetting] = useState(null);

  // Max languages (existing)
  const [maxLangValue, setMaxLangValue] = useState('');
  const [savedMaxLang, setSavedMaxLang] = useState(null);

  // Visa Prompt Template (ENGLISH)
  const [promptValue, setPromptValue] = useState('');
  const [savedPrompt, setSavedPrompt] = useState(null);

  // Visa Prompt Template (MULTILINGUAL) — newly added
  const [multiPromptValue, setMultiPromptValue] = useState('');
  const [savedMultiPrompt, setSavedMultiPrompt] = useState(null);

  // Visa Advisory Prompt Template (existing)
  const [advisoryPromptValue, setAdvisoryPromptValue] = useState('');
  const [savedAdvisoryPrompt, setSavedAdvisoryPrompt] = useState(null);

  // -----------------------------------
  // ✅ NEW: Agent Batch Configuration
  // -----------------------------------
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [countryBatch, setCountryBatch] = useState('1');
  const [languageBatch, setLanguageBatch] = useState('1');
  const [categoryBatch, setCategoryBatch] = useState('1');
  const [languageTranslationBatch, setlanguageTranslationBatch] = useState('1');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const snap = await getDocs(collection(db, 'settings'));
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        if (id === 'maxLang' || data.type === 1) {
          setMaxLangValue(String(data.value ?? ''));
          setSavedMaxLang(String(data.value ?? ''));
        } else if (id === 'visaPrompt' || data.type === 2) {
          setPromptValue(data.value ?? '');
          setSavedPrompt(data.value ?? '');
        } else if (id === 'visaPromptMultilingual' || data.type === 4) {
          setMultiPromptValue(data.value ?? '');
          setSavedMultiPrompt(data.value ?? '');
        } else if (id === 'visaAdvisoryPrompt' || data.type === 3) {
          setAdvisoryPromptValue(data.value ?? '');
          setSavedAdvisoryPrompt(data.value ?? '');
        }
        // ✅ NEW: Batch Config (settings/agentBatchConfig)
        else if (id === 'agentBatchConfig' || data.type === 5) {
          setCountryBatch(String(data.countryBatchSize ?? 1));
          setLanguageBatch(String(data.languageBatchSize ?? 1));
          setCategoryBatch(String(data.categoryBatchSize ?? 1));
          setlanguageTranslationBatch(String(data.languageTranslationBatchSize ?? 1));
        }
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const toggleSetting = (key) => {
    setActiveSetting(activeSetting === key ? null : key);
  };

  const saveMaxLang = async () => {
    try {
      await setDoc(doc(db, 'settings', 'maxLang'), {
        type: 1,
        value: maxLangValue,
        updatedAt: new Date().toISOString(),
      });
      setSavedMaxLang(maxLangValue);
      setActiveSetting(null);
      Alert.alert('Saved', 'Maximum language selection updated.');
    } catch (err) {
      console.error('Error saving maxLang:', err);
    }
  };

  const savePrompt = async () => {
    try {
      await setDoc(doc(db, 'settings', 'visaPrompt'), {
        type: 2,
        value: promptValue,
        updatedAt: new Date().toISOString(),
      });
      setSavedPrompt(promptValue);
      setActiveSetting(null);
      Alert.alert('Saved', 'Visa prompt (English) template updated.');
    } catch (err) {
      console.error('Error saving prompt:', err);
    }
  };

  const saveMultiPrompt = async () => {
    try {
      await setDoc(doc(db, 'settings', 'visaPromptMultilingual'), {
        type: 4,
        value: multiPromptValue,
        updatedAt: new Date().toISOString(),
      });
      setSavedMultiPrompt(multiPromptValue);
      setActiveSetting(null);
      Alert.alert('Saved', 'Visa prompt (Multilingual) template updated.');
    } catch (err) {
      console.error('Error saving multilingual prompt:', err);
    }
  };

  const saveAdvisoryPrompt = async () => {
    try {
      await setDoc(doc(db, 'settings', 'visaAdvisoryPrompt'), {
        type: 3,
        value: advisoryPromptValue,
        updatedAt: new Date().toISOString(),
      });
      setSavedAdvisoryPrompt(advisoryPromptValue);
      setActiveSetting(null);
      Alert.alert('Saved', 'Visa advisory prompt template updated.');
    } catch (err) {
      console.error('Error saving advisory prompt:', err);
    }
  };

  // -----------------------------------
  // ✅ NEW: Save Batch Config
  // -----------------------------------
  const saveBatchConfig = async () => {
    try {
      const c = Math.max(1, parseInt(countryBatch) || 1);
      const l = Math.max(1, parseInt(languageBatch) || 1);
      const cat = Math.max(1, parseInt(categoryBatch) || 1);
      const l_tran = Math.max(1, parseInt(languageTranslationBatch) || 1);

      await setDoc(doc(db, 'settings', 'agentBatchConfig'), {
        type: 5,
        countryBatchSize: c,
        languageBatchSize: l,
        categoryBatchSize: cat,
        languageTranslationBatchSize: l_tran,
        updatedAt: new Date().toISOString(),
      });

      setCountryBatch(String(c));
      setLanguageBatch(String(l));
      setCategoryBatch(String(cat));
      setlanguageTranslationBatch(String(l_tran))
      setBatchModalVisible(false);
      Alert.alert('Saved', 'Agent batch configuration updated.');
    } catch (err) {
      console.error('Error saving batch config:', err);
    }
  };

  const adjustValue = (setter, value, delta) => {
    const num = parseInt(value) || 0;
    const updated = Math.max(1, num + delta);
    setter(String(updated));
  };

  return (
    <>
      <ScrollView style={styles.container}>

        {/* Maximum Language Selection (existing) */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => toggleSetting('maxLang')}
        >
          <Ionicons name="globe-outline" size={22} color="#1E40AF" />
          <Text
            style={[
              styles.settingName
            ]}
          >
            Maximum Language Selection
          </Text>
        </TouchableOpacity>
        {activeSetting === 'maxLang' && (
          <View style={styles.inlineEditor}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={maxLangValue}
              onChangeText={setMaxLangValue}
              placeholder="Enter max languages..."
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={saveMaxLang}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Visa Prompt Template (ENGLISH VERSION) */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => toggleSetting('prompt')}
        >
          <Ionicons name="document-text-outline" size={22} color="#1E40AF" />
          <Text
            style={[
              styles.settingName
            ]}
          >
            Visa Prompt Template (English Version)
          </Text>
        </TouchableOpacity>
        {activeSetting === 'prompt' && (
          <View style={styles.promptEditor}>
            <TextInput
              style={styles.textArea}
              multiline
              placeholder="Paste English visa generation prompt here."
              placeholderTextColor="#666"
              value={promptValue}
              onChangeText={setPromptValue}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={savePrompt}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Visa Prompt Template (MULTILINGUAL VERSION) — newly added */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => toggleSetting('multiPrompt')}
        >
          <Ionicons name="language-outline" size={22} color="#1E40AF" />
          <Text
            style={[
              styles.settingName
            ]}
          >
            Visa Prompt Template (Multilingual Version)
          </Text>
        </TouchableOpacity>
        {activeSetting === 'multiPrompt' && (
          <View style={styles.promptEditor}>
            <TextInput
              style={styles.textArea}
              multiline
              placeholder="Paste multilingual translation prompt here."
              placeholderTextColor="#666"
              value={multiPromptValue}
              onChangeText={setMultiPromptValue}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={saveMultiPrompt}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Visa Advisory Prompt Template (existing) */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => toggleSetting('advisoryPrompt')}
        >
          <Ionicons name="clipboard-outline" size={22} color="#1E40AF" />
          <Text
            style={[
              styles.settingName
            ]}
          >
            Visa Advisory Prompt Template
          </Text>
        </TouchableOpacity>
        {activeSetting === 'advisoryPrompt' && (
          <View style={styles.promptEditor}>
            <TextInput
              style={styles.textArea}
              multiline
              placeholder="Paste Visa Advisory Prompt here. Use {{purpose}}, {{source}}, {{destination}}."
              placeholderTextColor="#666"
              value={advisoryPromptValue}
              onChangeText={setAdvisoryPromptValue}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={saveAdvisoryPrompt}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* -----------------------------------
            ✅ NEW Setting Row (Modal)
        ----------------------------------- */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setBatchModalVisible(true)}
        >
          <Ionicons name="options-outline" size={22} color="#1E40AF" />
          <Text style={styles.settingName}>
            Agent Batch Configuration
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* -----------------------------------
          ✅ NEW Modal UI
      ----------------------------------- */}
      <Modal visible={batchModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <Text style={styles.modalTitle}>Agent Batch Configuration</Text>

            {[
              { label: 'Countries', value: countryBatch, setter: setCountryBatch },
              { label: 'Languages', value: languageBatch, setter: setLanguageBatch },
              { label: 'Categories', value: categoryBatch, setter: setCategoryBatch },
              { label: 'Language Trasnlations', value: languageTranslationBatch, setter: setlanguageTranslationBatch },
            ].map((item, index) => (
              <View key={index} style={styles.counterRow}>
                <Text style={styles.counterLabel}>{item.label}</Text>

                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => adjustValue(item.setter, item.value, -1)}
                  >
                    <Text style={styles.counterBtnText}>−</Text>
                  </TouchableOpacity>

                  <TextInput editable={false}
                    style={styles.counterInput}
                    keyboardType="numeric"
                    value={item.value}
                    onChangeText={item.setter}
                  />

                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => adjustValue(item.setter, item.value, 1)}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setBatchModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={saveBatchConfig}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </>
  );
}
