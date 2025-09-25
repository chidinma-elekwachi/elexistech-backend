// screens/AuthScreen.js
import React, { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import {
  loginAndAddAccount,
  registerAndAddAccount,
} from "../services/authService";

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginAdd = async () => {
    try {
      await loginAndAddAccount(email.trim(), password);
      alert("Account added & signed in. Check Settings to switch.");
      setEmail("");
      setPassword("");
      navigation.navigate("Settings");
    } catch (e) {
      alert("Login failed: " + e.message);
    }
  };

  const handleRegister = async () => {
    try {
      await registerAndAddAccount(email.trim(), password);
      alert("Registered and added.");
      navigation.navigate("Settings");
    } catch (e) {
      alert("Register failed: " + e.message);
    }
  };

  return (
    <SafeAreaView  style={styles.container}>
      <View>
        <Text style={styles.h}>Add / Login Account</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={{ marginTop: 10 }}>
          <Button title="Login & Add Account" onPress={handleLoginAdd} />
        </View>
        <View style={{ marginTop: 10 }}>
          <Button title="Register & Add" onPress={handleRegister} />
        </View>
        <View style={{ marginTop: 20 }}>
          <Button
            title="Open Settings"
            onPress={() => navigation.navigate("Settings")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  h: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
});
