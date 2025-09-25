import * as ImagePicker from "expo-image-picker";
import { supabase } from "../supabase";
import { decode } from "base64-arraybuffer";


export async function pickMedia() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "videos"], 
    quality: 0.8,
    base64: true, 
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  const uri = asset.uri;
  const mediaType = asset.type === "video" ? "video" : "image";
  const base64 = asset.base64; 

  let name = asset.fileName || uri.split("/").pop();
  if (!name) {
    const ext = mediaType === "video" ? "mp4" : "jpg";
    name = `media_${Date.now()}.${ext}`;
  }

  console.log("Picked:", { uri, mediaType, name, hasBase64: !!base64 });
  return { uri, mediaType, name, base64 };
}

export async function uploadMedia(file) {
  try {
    if (!file || !file.base64) throw new Error("No base64 file provided");

    console.log("Uploading file:", file.name);

    const arrayBuffer = decode(file.base64); 
    const filePath = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("chat-media")
      .upload(filePath, arrayBuffer, {
        contentType: file.mediaType === "video" ? "video/mp4" : "image/jpeg",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("chat-media").getPublicUrl(filePath);
    console.log("Uploaded URL:", data.publicUrl);

    return data.publicUrl;
  } catch (err) {
    console.error("Upload failed:", err.message);
    throw err;
  }
}
