import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "../config/firebase"
import * as ImagePicker from "expo-image-picker"
import * as ImageManipulator from "expo-image-manipulator"

export interface MediaUploadResult {
  url: string
  type: "image" | "video"
  size: number
  name: string
}

class MediaService {
  private readonly MAX_IMAGE_SIZE = 1024 * 1024 * 5 // 5MB
  private readonly MAX_VIDEO_SIZE = 1024 * 1024 * 50 // 50MB
  private readonly IMAGE_QUALITY = 0.8
  private readonly IMAGE_MAX_WIDTH = 1920
  private readonly IMAGE_MAX_HEIGHT = 1920

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      return cameraStatus === "granted" && libraryStatus === "granted"
    } catch (error) {
      console.error("Permission request error:", error)
      return false
    }
  }

  async pickImageFromLibrary(): Promise<MediaUploadResult | null> {
    try {
      const hasPermission = await this.requestPermissions()
      if (!hasPermission) {
        throw new Error("Camera and media library permissions are required")
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: this.IMAGE_QUALITY,
      })

      if (result.canceled || !result.assets[0]) {
        return null
      }

      const asset = result.assets[0]
      return await this.uploadImage(asset.uri, asset.fileName || "image.jpg")
    } catch (error) {
      console.error("Image picker error:", error)
      throw error
    }
  }

  async pickVideoFromLibrary(): Promise<MediaUploadResult | null> {
    try {
      const hasPermission = await this.requestPermissions()
      if (!hasPermission) {
        throw new Error("Camera and media library permissions are required")
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: 60, // 60 seconds max
        quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      })

      if (result.canceled || !result.assets[0]) {
        return null
      }

      const asset = result.assets[0]
      return await this.uploadVideo(asset.uri, asset.fileName || "video.mp4")
    } catch (error) {
      console.error("Video picker error:", error)
      throw error
    }
  }

  async takePhoto(): Promise<MediaUploadResult | null> {
    try {
      const hasPermission = await this.requestPermissions()
      if (!hasPermission) {
        throw new Error("Camera permission is required")
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: this.IMAGE_QUALITY,
      })

      if (result.canceled || !result.assets[0]) {
        return null
      }

      const asset = result.assets[0]
      return await this.uploadImage(asset.uri, `photo_${Date.now()}.jpg`)
    } catch (error) {
      console.error("Camera error:", error)
      throw error
    }
  }

  async takeVideo(): Promise<MediaUploadResult | null> {
    try {
      const hasPermission = await this.requestPermissions()
      if (!hasPermission) {
        throw new Error("Camera permission is required")
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: 60, // 60 seconds max
        quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      })

      if (result.canceled || !result.assets[0]) {
        return null
      }

      const asset = result.assets[0]
      return await this.uploadVideo(asset.uri, `video_${Date.now()}.mp4`)
    } catch (error) {
      console.error("Video camera error:", error)
      throw error
    }
  }

  private async uploadImage(uri: string, fileName: string): Promise<MediaUploadResult> {
    try {
      // Compress and resize image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: this.IMAGE_MAX_WIDTH,
              height: this.IMAGE_MAX_HEIGHT,
            },
          },
        ],
        {
          compress: this.IMAGE_QUALITY,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      )

      // Convert to blob
      const response = await fetch(manipulatedImage.uri)
      const blob = await response.blob()

      if (blob.size > this.MAX_IMAGE_SIZE) {
        throw new Error("Image is too large. Please choose a smaller image.")
      }

      // Upload to Firebase Storage
      const timestamp = Date.now()
      const storageRef = ref(storage, `images/${timestamp}_${fileName}`)

      await uploadBytes(storageRef, blob)
      const downloadURL = await getDownloadURL(storageRef)

      return {
        url: downloadURL,
        type: "image",
        size: blob.size,
        name: fileName,
      }
    } catch (error) {
      console.error("Image upload error:", error)
      throw error
    }
  }

  private async uploadVideo(uri: string, fileName: string): Promise<MediaUploadResult> {
    try {
      // Convert to blob
      const response = await fetch(uri)
      const blob = await response.blob()

      if (blob.size > this.MAX_VIDEO_SIZE) {
        throw new Error("Video is too large. Please choose a smaller video.")
      }

      // Upload to Firebase Storage
      const timestamp = Date.now()
      const storageRef = ref(storage, `videos/${timestamp}_${fileName}`)

      await uploadBytes(storageRef, blob)
      const downloadURL = await getDownloadURL(storageRef)

      return {
        url: downloadURL,
        type: "video",
        size: blob.size,
        name: fileName,
      }
    } catch (error) {
      console.error("Video upload error:", error)
      throw error
    }
  }

  async deleteMedia(url: string): Promise<void> {
    try {
      const storageRef = ref(storage, url)
      await deleteObject(storageRef)
    } catch (error) {
      console.error("Media deletion error:", error)
      throw error
    }
  }

  getMediaType(url: string): "image" | "video" | "unknown" {
    const extension = url.split(".").pop()?.toLowerCase()

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return "image"
    } else if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension || "")) {
      return "video"
    }

    return "unknown"
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
}

export const mediaService = new MediaService()
