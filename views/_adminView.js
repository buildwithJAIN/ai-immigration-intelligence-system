import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import styles from "../styles/_adminStyle";

export default function AdminView({ navigation }) {
  const tabs = [
    { label: "Country Master", icon: "globe", route: "CountryMasterView", disabled: false },
    { label: "Visa Master", icon: "passport", route: "VisaMasterView", disabled: false },
    { label: "Category Master", icon: "layer-group", route: "CategoryMasterView", disabled: false },
    // { label: "Abbreviation Master", icon: "spell-check", route: "AbbreviationMasterView", disabled: true },
    { label: "Language Master", icon: "language", route: "LanguageMasterView", disabled: false },
    { label: "Settings", icon: "cog", route: "Settings", disabled: false },
    { label: "Agent Mode", icon: "robot", route: "AgentControlView", disabled: false },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Admin</Text>

        <View style={styles.grid}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, tab.disabled && styles.disabledCard]}
              disabled={tab.disabled}
              activeOpacity={0.85}
              onPress={() => !tab.disabled && navigation.navigate(tab.route)}
            >
              <View style={styles.iconWrapper}>
                <Icon
                  name={tab.icon}
                  size={36}
                  color={tab.disabled ? "#BFC8D8" : "#0B3C74"}
                />
              </View>

              <Text style={[styles.label, tab.disabled && styles.disabledLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
