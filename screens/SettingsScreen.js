// screens/SettingsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Button,
} from "react-native";
import { loadSavedAccounts, switchAccount } from "../services/authService";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen({ navigation }) {
  const [accounts, setAccounts] = useState([]);
  const [currentUid, setCurrentUid] = useState(null);

  useEffect(() => {
    (async () => {
      const a = await loadSavedAccounts();
      setAccounts(a);
    })();
    const unsub = onAuthStateChanged(auth, (user) =>
      setCurrentUid(user ? user.uid : null)
    );
    return unsub;
  }, []);

  const handleSwitch = async (entry) => {
    try {
      // optimistic UI update could be done here; we call switchAccount to perform silent re-login
      await switchAccount(entry);
      alert("Switched to " + (entry.username || entry.email));
      // refresh accounts list
      const a = await loadSavedAccounts();
      setAccounts(a);
    } catch (e) {
      alert("Switch failed: " + e.message);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleSwitch(item)}>
      <Image
        source={
          item.avatar ? { uri: item.avatar } : require("../assets/avatar.png")
        }
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.username || item.email}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      {currentUid === item.id && <Text style={{ color: "green" }}>Active</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, padding: 0, paddingTop: 0, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={accounts}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ padding: 20 }}>
              No saved accounts. Add one in Auth screen.
            </Text>
          }
        />
        <View style={{ padding: 16 }}>
          <Button
            title="Open Chat (demo)"
            onPress={() => navigation.navigate("Chat")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#ddd",
  },
  name: { fontWeight: "600" },
  email: { color: "#666", fontSize: 12 },
});
