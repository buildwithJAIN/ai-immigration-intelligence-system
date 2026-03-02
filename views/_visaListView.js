import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Linking,
  Animated,
  Dimensions,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import styles from '../styles/_visaListStyle';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
} from 'firebase/firestore';

export default function VisaListView({ route }) {
  const { country, countryCode, defaultLanguage = 'en' } = route.params || {};
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  const [visaList, setVisaList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterVisible, setFilterVisible] = useState(false);
  const [languageFilterVisible, setLanguageFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const [languages, setLanguages] = useState([]);

  // ✅ Default to English so visas show immediately on open
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  // name → code mapping
  const [languageMap, setLanguageMap] = useState({ English: 'en' });

  const [labels, setLabels] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [user, setUser] = useState(null);

  // ✅ Full-screen translate spinner
  const [isTranslating, setIsTranslating] = useState(false);

  const [cardAnims, setCardAnims] = useState([]);

  // Fade animation
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [route.key]);

  // Load initial data
  useEffect(() => {
    fetchLanguages();
    loadUser();
    loadBookmarks();
  }, []);

  // ✅ Always load English visas on entry (base language)
  useEffect(() => {
    if (!countryCode) return;
    (async () => {
      await fetchVisaLabels('en');
      await fetchVisas('en');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  // Animate cards on list load
  useEffect(() => {
    const anims = visaList.map(() => new Animated.Value(0));
    setCardAnims(anims);

    anims.forEach((av, i) => {
      Animated.timing(av, {
        toValue: 1,
        duration: 450,
        delay: 80 * i,
        useNativeDriver: true,
      }).start();
    });
  }, [visaList]);

  // ---------------------------------------------
  // 🔥 1. Fetch Languages — FIXED field names
  // ---------------------------------------------
  const fetchLanguages = async () => {
    try {
      const snap = await getDocs(collection(db, 'languages'));

      const langs = [];
      const map = { English: 'en' }; // keep English safe

      snap.forEach((docSnap) => {
        const data = docSnap.data();

        if (data.active) {
          langs.push(data);
          map[data.name] = data.code;
        }
      });

      setLanguages(langs);
      setLanguageMap(map);

      // ✅ Keep selectedLanguage as English by default (don’t auto-switch)
      // If you want to highlight user's default language visually ONLY, you can do it later.
      setSelectedLanguage('English');
    } catch (err) {
      console.error('Error fetching languages:', err);
    }
  };

  // ---------------------------------------------
  // 🔥 2. Fetch Visas
  // ---------------------------------------------
  const fetchVisas = async (langCode) => {
    try {
      setLoading(true);

      const snap = await getDocs(
        collection(db, 'visas', countryCode, 'list')
      );

      const normalize = (x) => String(x || '').trim().toLowerCase();
      const requested = normalize(langCode);

      const list = snap.docs
        .map((docSnap) => {
          const data = docSnap.data();

          let translation = null;

          // ✅ English selected → allow fallback
          if (requested === 'en') {
            translation =
              data.translations?.['en'] ||
              data.translations?.[normalize(data.baseLanguage)];
          } else {
            // ❌ Non-English selected → ONLY show that language
            translation = data.translations?.[requested];
          }

          if (!translation) return null;

          return {
            id: docSnap.id,
            visaName: translation.visaName || '',
            description: translation.description || '',
            duration: translation.duration || '',
            workRights: translation.workRights || '',
            category: data.category || '',
            type: data.type || '',
            baseLanguage: data.baseLanguage || 'en',
            helpfulLink: data.helpfulLink || '',
          };
        })
        .filter(Boolean);

      setVisaList(list);
    } catch (err) {
      console.error('Error fetching visas:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Check if ANY visa translation exists for a language
  const hasAnyVisaTranslation = async (langCode) => {
    try {
      const snap = await getDocs(
        collection(db, 'visas', countryCode, 'list')
      );

      const target = String(langCode || '').trim().toLowerCase();
      if (target === 'en') return true;

      let found = false;
      snap.forEach((d) => {
        const data = d.data();
        if (data?.translations?.[target]) found = true;
      });

      return found;
    } catch (err) {
      console.log('Translation availability check error:', err);
      return false;
    }
  };

  const translateMissingVisas = async (langCode) => {
    try {
      setIsTranslating(true);

      const snap = await getDocs(
        collection(db, 'visas', countryCode, 'list')
      );

      for (const docSnap of snap.docs) {
        const data = docSnap.data();

        // Skip if translation already exists
        if (data.translations?.[langCode]) continue;

        const englishBlock = data.translations?.['en'];
        if (!englishBlock) continue;

        try {
          console.log('🔵 Translating visa:', docSnap.id);

          const response = await fetch(
            'https://us-central1-immigrationguideapp.cloudfunctions.net/translateVisa',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                visa: englishBlock,
                langCode: langCode,
              }),
            }
          );

          console.log('Status:', response.status);

          const result = await response.json();
          console.log('Result:', result);

          if (!result?.visaName) continue;

          const visaRef = doc(
            db,
            'visas',
            countryCode,
            'list',
            docSnap.id
          );

          await updateDoc(visaRef, {
            [`translations.${langCode}`]: {
              visaName: result.visaName,
              description: result.description,
              duration: result.duration,
              workRights: result.workRights,
            },
          });
        } catch (err) {
          console.log('Single visa translation failed:', err);
        }
      }
    } catch (err) {
      console.log('Translation process error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // ---------------------------------------------
  // 🔥 3. Fetch Translation Labels
  // ---------------------------------------------
  const fetchVisaLabels = async (langCode) => {
    try {
      const cache = await AsyncStorage.getItem(`visaLabels_${langCode}`);

      if (cache) {
        setLabels(JSON.parse(cache));
        return;
      }

      const ref = doc(db, 'languageTranslations', langCode);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setLabels(snap.data());
        await AsyncStorage.setItem(
          `visaLabels_${langCode}`,
          JSON.stringify(snap.data())
        );
      } else {
        const fallback = await getDoc(
          doc(db, 'languageTranslations', 'en')
        );

        if (fallback.exists()) {
          setLabels(fallback.data());
          await AsyncStorage.setItem(
            `visaLabels_en`,
            JSON.stringify(fallback.data())
          );
        }
      }
    } catch (err) {
      console.error('label error:', err);
    }
  };

  // ---------------------------------------------
  // 🔥 4. Bookmark Logic (unchanged)
  // ---------------------------------------------
  const toggleBookmark = async (visa) => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to save bookmarks.');
      return;
    }

    const langCode = (languageMap[selectedLanguage] || 'en').toLowerCase();

    const bookmarkData = {
      countryCode,
      visaId: visa.id,
      visaName: visa.visaName,
      language: langCode,
      savedAt: new Date().toISOString(),
    };

    const existing = Array.isArray(bookmarks) ? bookmarks : [];
    const isBookmarked = existing.some(
      (b) => b.visaId === visa.id && b.countryCode === countryCode
    );

    try {
      const userRef = doc(db, 'users', user.id);
      const snap = await getDocs(collection(db, 'users'));

      let serverBookmarks = [];
      snap.forEach((d) => {
        if (d.id === user.id && d.data().bookmarks) {
          serverBookmarks = d.data().bookmarks;
        }
      });

      let updated;

      if (isBookmarked) {
        updated = serverBookmarks.filter(
          (b) => !(b.visaId === visa.id && b.countryCode === countryCode)
        );
      } else {
        updated = [...serverBookmarks, bookmarkData];
      }

      await updateDoc(userRef, { bookmarks: updated });
      setBookmarks(updated);
      AsyncStorage.setItem('bookmarks', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const isBookmarkedVisa = (visa) =>
    bookmarks.some(
      (b) => b.visaId === visa.id && b.countryCode === countryCode
    );

  // ---------------------------------------------
  // 🔥 5. Load User & Bookmarks (unchanged)
  // ---------------------------------------------
  const loadUser = async () => {
    const stored = await AsyncStorage.getItem('loggedUser');
    if (stored) setUser(JSON.parse(stored));
  };

  const loadBookmarks = async () => {
    const stored = await AsyncStorage.getItem('bookmarks');
    if (stored) setBookmarks(JSON.parse(stored));
  };

  // ---------------------------------------------
  // 🔥 6. Filters (unchanged)
  // ---------------------------------------------
  const filteredVisas = visaList.filter((visa) => {
    const typeMatch = selectedCategory
      ? visa.type === selectedCategory
      : true;

    const customTypeMatch = selectedType
      ? visa.category === selectedType
      : true;

    return typeMatch && customTypeMatch;
  });

  const getLabel = (key) => labels?.[key] || key;

  // ---------------------------------------------
  // 🔥 7. Language Modal Select — UPDATED BEHAVIOR
  // ---------------------------------------------
  const onLanguageSelect = async (langName) => {
    const langCode = (languageMap[langName] || 'en').toLowerCase();

    const selected = languages.find((l) => l.name === langName);
    if (selected?.disabled || isTranslating) return;

    try {
      setLanguageFilterVisible(false);

      // ✅ Always allow English instantly
      if (langCode === 'en') {
        setSelectedLanguage('English');
        await fetchVisaLabels('en');
        await fetchVisas('en');
        return;
      }

      // ✅ If translations don't exist at all -> ask user
      const available = await hasAnyVisaTranslation(langCode);

      if (!available) {
        Alert.alert(
          'Translation not available',
          `Visas are not generated in ${selected?.nativeName || langName}.\n\nDo you want to translate now?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: async () => {
                // ✅ Keep English only
                setSelectedLanguage('English');
                await fetchVisaLabels('en');
                await fetchVisas('en');
              },
            },
            {
              text: 'Yes',
              onPress: async () => {
                // ✅ Translate with full-screen spinner
                try {
                  setIsTranslating(true);

                  await translateMissingVisas(langCode);

                  // After translation complete, switch language and reload
                  setSelectedLanguage(langName);
                  await fetchVisaLabels(langCode);
                  await fetchVisas(langCode);
                } catch (e) {
                  console.log('Translate now error:', e);
                  Alert.alert(
                    'Translation failed',
                    'Could not translate right now. Showing English.'
                  );
                  setSelectedLanguage('English');
                  await fetchVisaLabels('en');
                  await fetchVisas('en');
                } finally {
                  setIsTranslating(false);
                }
              },
            },
          ]
        );

        return;
      }

      // ✅ Translation exists -> switch normally (no auto-translate)
      setSelectedLanguage(langName);
      await fetchVisaLabels(langCode);
      await fetchVisas(langCode);
    } catch (err) {
      console.error('Language switch error:', err);
      // fallback to English
      setSelectedLanguage('English');
      await fetchVisaLabels('en');
      await fetchVisas('en');
    }
  };

  // ---------------------------------------------
  // 🔥 8. UI Rendering
  // ---------------------------------------------
  return (
    <View style={styles.wrap}>
      <View style={styles.blobTL} />
      <View style={styles.blobBR} />

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.title}>{country}</Text>

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.filterButton, { top: screenHeight / 3 }]}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#f4f7fb" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.languageButton, { top: screenHeight / 3 }]}
          onPress={() => setLanguageFilterVisible(true)}
        >
          <Ionicons name="language" size={20} color="#f4f7fb" />
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#0b316b" />
            <Text style={styles.loadingText}>{getLabel('loading')}</Text>
          </View>
        ) : filteredVisas.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons
              name="document-text-outline"
              size={28}
              color="#64748b"
            />
            <Text style={styles.emptyText}>{getLabel('noVisasFound')}</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredVisas.map((visa, index) => {
              const av = cardAnims[index] || new Animated.Value(1);

              return (
                <Animated.View
                  key={visa.id || index}
                  style={[
                    styles.card,
                    {
                      opacity: av,
                      transform: [
                        {
                          translateY: av.interpolate({
                            inputRange: [0, 1],
                            outputRange: [14, 0],
                          }),
                        },
                        {
                          scale: av.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.98, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.cardTitle}>{visa.visaName}</Text>

                  <Text style={styles.cardField}>
                    {getLabel('category')}:{' '}
                    <Text style={styles.bold}>{visa.category}</Text>
                  </Text>

                  <Text style={styles.cardField}>
                    {getLabel('type')}:{' '}
                    <Text style={styles.bold}>{visa.type}</Text>
                  </Text>

                  <Text style={styles.cardField}>
                    {getLabel('duration')}:{' '}
                    <Text style={styles.bold}>{visa.duration}</Text>
                  </Text>

                  <Text style={styles.cardField}>
                    {getLabel('workRights')}:{' '}
                    <Text style={styles.bold}>{visa.workRights}</Text>
                  </Text>

                  <View style={styles.descBox}>
                    <Text style={styles.description}>{visa.description}</Text>
                  </View>

                  <View style={styles.bottomRow}>
                    {visa.helpfulLink && (
                      <Text
                        style={styles.link}
                        onPress={() => Linking.openURL(visa.helpfulLink)}
                      >
                        🔗 {getLabel('moreInfo')}
                      </Text>
                    )}

                    <TouchableOpacity
                      onPress={() => toggleBookmark(visa)}
                      style={styles.bookmarkButton}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={
                          isBookmarkedVisa(visa)
                            ? 'bookmark'
                            : 'bookmark-outline'
                        }
                        size={22}
                        color={
                          isBookmarkedVisa(visa) ? '#0b316b' : '#64748b'
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>
        )}
      </Animated.View>

      {/* ✅ FULL SCREEN TRANSLATION OVERLAY */}
      {isTranslating && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ marginTop: 12, color: '#fff', fontSize: 16 }}>
            Translating visas...
          </Text>
        </View>
      )}

      {/* FILTER MODAL */}
      <Modal
        visible={filterVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{getLabel('filterOptions')}</Text>

            <Text style={styles.sectionTitle}>{getLabel('category')}</Text>

            <View style={styles.filterRow}>
              {['Immigrant', 'Non-Immigrant'].map((cat) => {
                const isSelected = selectedCategory === cat;

                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                    ]}
                    onPress={() =>
                      setSelectedCategory(isSelected ? null : cat)
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>{getLabel('type')}</Text>
            <View style={styles.filterRow}>
              {['Student', 'Work', 'Family'].map((type) => {
                const isSelected = selectedType === type;

                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                    ]}
                    onPress={() =>
                      setSelectedType(isSelected ? null : type)
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory(null);
                  setSelectedType(null);
                }}
                style={styles.clearBtn}
              >
                <Text style={styles.clearText}>{getLabel('clear')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilterVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeModal}>{getLabel('close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* LANGUAGE MODAL */}
      <Modal
        visible={languageFilterVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setLanguageFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{getLabel('languages')}</Text>

            {/* 🔥 SCROLLABLE LANGUAGE LIST */}
            <View style={{ maxHeight: 420 }}>
              <ScrollView
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                  paddingBottom: 20,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {languages.map((lang) => {
                  const isSelected = selectedLanguage === lang.name;

                  return (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                        lang.disabled && { opacity: 0.4 },
                      ]}
                      onPress={() => onLanguageSelect(lang.name)}
                      disabled={lang.disabled || isTranslating}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                          lang.disabled && {
                            textDecorationLine: 'line-through',
                          },
                        ]}
                      >
                        {lang.nativeName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setLanguageFilterVisible(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeModal}>{getLabel('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}