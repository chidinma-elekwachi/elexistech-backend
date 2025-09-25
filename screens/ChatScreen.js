// screens/ChatScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { pickMedia, uploadMedia } from "../services/mediaService";
import { Video } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";

const CHAT_ID = "demo_chat_1"; // for demo: single chat id (you can make dynamic with members array)

export default function ChatScreen() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(
      collection(db, "chats", CHAT_ID, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(arr);
    });
    return unsub;
  }, []);

  const sendText = async () => {
    if (!user) return alert("No user signed in");
    if (!text.trim()) return;
    await addDoc(collection(db, "chats", CHAT_ID, "messages"), {
      text: text.trim(),
      senderId: user.uid,
      createdAt: serverTimestamp(),
      status: "sent",
    });
    setText("");
  };

  const attachAndSend = async () => {
    if (!user) return alert("No user signed in");
    const picked = await pickMedia();
    if (!picked) return;
    try {
      const mime = picked.mediaType === "video" ? "video/mp4" : "image/jpeg";
      const url = await uploadMedia(picked.uri, picked.name, mime);
      await addDoc(collection(db, "chats", CHAT_ID, "messages"), {
        senderId: user.uid,
        createdAt: serverTimestamp(),
        mediaUrl: url,
        mediaType: picked.mediaType,
        status: "sent",
      });
    } catch (e) {
      alert("Upload failed: " + e.message);
    }
  };

  const renderItem = ({ item }) => {
    const isMe = user && item.senderId === user.uid;
    return (
      <View
        style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}
      >
        {item.mediaUrl ? (
          item.mediaType === "image" ? (
            <Image
              source={{ uri: item.mediaUrl }}
              style={{ width: 200, height: 200, borderRadius: 8 }}
            />
          ) : (
            <Video
              source={{ uri: item.mediaUrl }}
              style={{ width: 300, height: 200 }}
              useNativeControls
            />
          )
        ) : (
          <Text>{item.text}</Text>
        )}
        <Text style={{ fontSize: 10, color: "#666", marginTop: 6 }}>
          {isMe ? "You" : item.senderId}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={{ flex: 1, padding: 1, backgroundColor: "#fff" }}>
        <View style={{ flex: 1 }}>
          <FlatList
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 12 }}
          />
          <View style={styles.composer}>
            <TouchableOpacity onPress={attachAndSend} style={styles.attachBtn}>
              <Text>Attach</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Message"
            />
            <Button title="Send" onPress={sendText} />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  composer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 8,
  },
  attachBtn: { padding: 8, backgroundColor: "#efefef", borderRadius: 6 },
  bubble: { padding: 10, borderRadius: 10, maxWidth: "80%", marginVertical: 6 },
  bubbleLeft: { alignSelf: "flex-start", backgroundColor: "#f1f1f1" },
  bubbleRight: { alignSelf: "flex-end", backgroundColor: "#d1f7c4" },
});
