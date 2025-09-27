const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const mime = require('mime-types');
const supabase = require('../../config/supabase');

class MediaService {
  constructor() {
    this.bucketName = 'media';
  }

  // Upload media file to Supabase Storage
  async uploadMedia(file, userId) {
    try {
      const fileId = uuidv4();
      const fileExtension = mime.extension(file.mimetype) || 'bin';
      const fileName = `${fileId}.${fileExtension}`;
      const filePath = `${userId}/${fileName}`;

      // Validate file type
      if (!this.isValidMediaType(file.mimetype)) {
        throw new Error('Invalid file type. Only images and videos are allowed.');
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum 10MB allowed.');
      }

      // Process image if it's an image
      let processedBuffer = file.buffer;
      if (file.mimetype.startsWith('image/')) {
        processedBuffer = await this.processImage(file.buffer);
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, processedBuffer, {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString()
          }
        });

      if (error) {
        throw new Error(`Supabase upload error: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        success: true,
        fileId,
        fileName,
        filePath: data.path,
        publicUrl: urlData.publicUrl,
        mediaType: file.mimetype.startsWith('image/') ? 'image' : 'video',
        size: file.size,
        originalName: file.originalname
      };
    } catch (error) {
      console.error('Media upload error:', error);
      throw new Error(error.message || 'Failed to upload media');
    }
  }

  // Process image (compress and resize)
  async processImage(buffer) {
    try {
      return await sharp(buffer)
        .resize(1920, 1080, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (error) {
      console.error('Image processing error:', error);
      return buffer; // Return original if processing fails
    }
  }

  // Validate media type
  isValidMediaType(mimetype) {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm'
    ];
    return allowedTypes.includes(mimetype);
  }

  // Delete media file
  async deleteMedia(filePath) {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Supabase delete error: ${error.message}`);
      }

      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('Delete media error:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Get file info
  async getFileInfo(filePath) {
    try {
      // Get the public URL to verify file exists
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      // Try to get file metadata by listing the folder
      const folderPath = filePath.split('/')[0];
      const fileName = filePath.split('/')[1];
      
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(folderPath);

      if (error) {
        throw new Error(`Supabase list error: ${error.message}`);
      }

      // Find the specific file
      const file = data?.find(f => f.name === fileName);
      
      if (file) {
        return {
          success: true,
          metadata: {
            name: file.name,
            size: file.metadata?.size || 0,
            contentType: file.metadata?.mimetype || 'application/octet-stream',
            timeCreated: file.created_at,
            updated: file.updated_at,
            publicUrl: urlData.publicUrl
          }
        };
      } else {
        throw new Error('File not found');
      }
    } catch (error) {
      console.error('Get file info error:', error);
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }
}

module.exports = new MediaService();
