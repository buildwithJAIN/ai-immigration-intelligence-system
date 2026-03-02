import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/_exploreStyle';

export default function ExploreView({ navigation }) {
  const scale1 = useRef(new Animated.Value(0)).current;
  const scale2 = useRef(new Animated.Value(0)).current;
  const scale3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale1, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    Animated.spring(scale2, { toValue: 1, delay: 200, useNativeDriver: true, friction: 5 }).start();
    Animated.spring(scale3, { toValue: 1, delay: 400, useNativeDriver: true, friction: 5 }).start();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <LottieView
          source={require('../assets/lottie/orbs.json')}
          autoPlay
          loop
          style={styles.backgroundLottie}
        />
        <Text style={styles.subtitle}>Choose what you want to do</Text>

        {/* Country Visas */}
        <Animated.View style={{ transform: [{ scale: scale1 }] }}>
          <TouchableOpacity
            style={[styles.card, styles.cardPrimary]}
            onPress={() => navigation.navigate('CountryExplorerView')}
            activeOpacity={0.85}
          >
            <MaterialIcons name="public" size={48} color="#fff" />
            <Text style={styles.cardTitle}>Country Visas</Text>
            <Text style={styles.cardDescription}>
              Find visa types, rules, and requirements for each country.
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Visa Advisor */}
        <Animated.View style={{ transform: [{ scale: scale2 }] }}>
          <TouchableOpacity
            style={[styles.card, styles.cardSecondary]}
            onPress={() => navigation.navigate('VisaAdvisorView')}
            activeOpacity={0.85}
          >
            <MaterialIcons name="explore" size={48} color="#fff" />
            <Text style={styles.cardTitle}>Visa Advisor</Text>
            <Text style={styles.cardDescription}>
              Get AI-powered suggestions on which visa best fits your profile.
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Interview Practice */}
        <Animated.View style={{ transform: [{ scale: scale3 }] }}>
          <TouchableOpacity
            style={[styles.card, styles.cardTertiary]}
            onPress={() => navigation.navigate('Interview Setup')}
            activeOpacity={0.85}
          >
            <MaterialIcons name="mic" size={48} color="#fff" />
            <Text style={styles.cardTitle}>Interview Practice</Text>
            <Text style={styles.cardDescription}>
              Prepare for your visa interview with our interactive AI assistant.
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
