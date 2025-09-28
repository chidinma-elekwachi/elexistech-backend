"use client"

import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from "react-native"
import { useState } from "react"
import { mediaService, type MediaUploadResult } from "../services/mediaService"

interface MediaPickerProps {
  visible: boolean
  onClose: () => void
  onMediaSelected: (media: MediaUploadResult) => void
}

export default function MediaPicker({ visible, onClose, onMediaSelected }: MediaPickerProps) {
  const [uploading, setUploading] = useState(false)

  const handleMediaSelection = async (action: () => Promise<MediaUploadResult | null>) => {
    setUploading(true)
    try {
      const result = await action()
      if (result) {
        onMediaSelected(result)
        onClose()
      }
    } catch (error: any) {
      Alert.alert("Upload Failed", error.message || "Failed to upload media")
    } finally {
      setUploading(false)
    }
  }

  const options = [
    {
      title: "Take Photo",
      onPress: () => handleMediaSelection(() => mediaService.takePhoto()),
    },
    {
      title: "Take Video",
      onPress: () => handleMediaSelection(() => mediaService.takeVideo()),
    },
    {
      title: "Choose Photo",
      onPress: () => handleMediaSelection(() => mediaService.pickImageFromLibrary()),
    },
    {
      title: "Choose Video",
      onPress: () => handleMediaSelection(() => mediaService.pickVideoFromLibrary()),
    },
  ]

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select Media</Text>

          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.option, uploading && styles.optionDisabled]}
              onPress={option.onPress}
              disabled={uploading}
            >
              <Text style={styles.optionText}>{option.title}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.cancelButton, uploading && styles.optionDisabled]}
            onPress={onClose}
            disabled={uploading}
          >
            <Text style={styles.cancelText}>{uploading ? "Uploading..." : "Cancel"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  option: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  cancelButton: {
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    color: "#666",
  },
})
