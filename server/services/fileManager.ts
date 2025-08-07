import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

interface FileUploadResult {
  success: boolean;
  filename?: string;
  url?: string;
  size?: number;
  error?: string;
}

interface FileMetadata {
  originalName: string;
  storedName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  userId: string;
  category: 'task_proof' | 'profile_picture' | 'document' | 'general';
}

class FileManagerService {
  private readonly UPLOAD_DIR = 'uploads';
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'application/msword'];
  
  constructor() {
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.UPLOAD_DIR);
    } catch {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
      await fs.mkdir(path.join(this.UPLOAD_DIR, 'task_proofs'), { recursive: true });
      await fs.mkdir(path.join(this.UPLOAD_DIR, 'profile_pictures'), { recursive: true });
      await fs.mkdir(path.join(this.UPLOAD_DIR, 'documents'), { recursive: true });
    }
  }

  async saveFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    userId: string,
    category: FileMetadata['category'] = 'general'
  ): Promise<FileUploadResult> {
    try {
      // Validate file size
      if (fileBuffer.length > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: `File too large. Maximum size is ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
        };
      }

      // Validate file type
      if (!this.isAllowedFileType(mimeType, category)) {
        return {
          success: false,
          error: `File type ${mimeType} not allowed for category ${category}`
        };
      }

      // Generate unique filename
      const fileExtension = path.extname(originalName);
      const uniqueFilename = `${nanoid()}_${Date.now()}${fileExtension}`;
      
      // Determine subdirectory based on category
      const subDir = this.getSubDirectory(category);
      const fullPath = path.join(this.UPLOAD_DIR, subDir, uniqueFilename);

      // Save file
      await fs.writeFile(fullPath, fileBuffer);

      // Generate URL
      const fileUrl = `/uploads/${subDir}/${uniqueFilename}`;

      // Store metadata (in production, would save to database)
      const metadata: FileMetadata = {
        originalName,
        storedName: uniqueFilename,
        size: fileBuffer.length,
        mimeType,
        uploadedAt: new Date(),
        userId,
        category
      };

      console.log(`📁 File saved: ${uniqueFilename} (${metadata.size} bytes) for user ${userId}`);

      return {
        success: true,
        filename: uniqueFilename,
        url: fileUrl,
        size: fileBuffer.length
      };

    } catch (error) {
      console.error('File save error:', error);
      return {
        success: false,
        error: 'Failed to save file'
      };
    }
  }

  async deleteFile(filename: string, category: FileMetadata['category']): Promise<boolean> {
    try {
      const subDir = this.getSubDirectory(category);
      const fullPath = path.join(this.UPLOAD_DIR, subDir, filename);
      
      await fs.unlink(fullPath);
      console.log(`🗑️  File deleted: ${filename}`);
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  async getFileInfo(filename: string, category: FileMetadata['category']): Promise<FileMetadata | null> {
    try {
      const subDir = this.getSubDirectory(category);
      const fullPath = path.join(this.UPLOAD_DIR, subDir, filename);
      
      const stats = await fs.stat(fullPath);
      
      // In production, would fetch from database
      return {
        originalName: filename,
        storedName: filename,
        size: stats.size,
        mimeType: this.guessMimeType(filename),
        uploadedAt: stats.birthtime,
        userId: 'unknown',
        category
      };
    } catch (error) {
      console.error('File info error:', error);
      return null;
    }
  }

  async optimizeImage(
    fileBuffer: Buffer,
    maxWidth: number = 800,
    quality: number = 80
  ): Promise<Buffer> {
    // In production, would use sharp or similar library for image optimization
    // For now, return original buffer
    console.log(`🖼️  Image optimization requested: ${maxWidth}px, ${quality}% quality`);
    return fileBuffer;
  }

  async generateThumbnail(
    imageBuffer: Buffer,
    width: number = 200,
    height: number = 200
  ): Promise<Buffer> {
    // In production, would generate actual thumbnails
    console.log(`📷 Thumbnail generation requested: ${width}x${height}px`);
    return imageBuffer;
  }

  async cleanupOldFiles(days: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      let deletedCount = 0;
      const categories = ['task_proofs', 'profile_pictures', 'documents', '.'];
      
      for (const category of categories) {
        const dirPath = path.join(this.UPLOAD_DIR, category === '.' ? '' : category);
        
        try {
          const files = await fs.readdir(dirPath);
          
          for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = await fs.stat(filePath);
            
            if (stats.birthtime < cutoffDate) {
              await fs.unlink(filePath);
              deletedCount++;
            }
          }
        } catch (error) {
          console.error(`Error cleaning up ${category}:`, error);
        }
      }

      console.log(`🧹 Cleaned up ${deletedCount} old files older than ${days} days`);
      return deletedCount;
    } catch (error) {
      console.error('File cleanup error:', error);
      return 0;
    }
  }

  private isAllowedFileType(mimeType: string, category: FileMetadata['category']): boolean {
    switch (category) {
      case 'task_proof':
      case 'profile_picture':
        return this.ALLOWED_IMAGE_TYPES.includes(mimeType);
      case 'document':
        return [...this.ALLOWED_IMAGE_TYPES, ...this.ALLOWED_DOCUMENT_TYPES].includes(mimeType);
      case 'general':
        return [...this.ALLOWED_IMAGE_TYPES, ...this.ALLOWED_DOCUMENT_TYPES].includes(mimeType);
      default:
        return false;
    }
  }

  private getSubDirectory(category: FileMetadata['category']): string {
    switch (category) {
      case 'task_proof':
        return 'task_proofs';
      case 'profile_picture':
        return 'profile_pictures';
      case 'document':
        return 'documents';
      default:
        return '.';
    }
  }

  private guessMimeType(filename: string): string {
    const extension = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    byCategory: Record<string, { files: number; size: number }>;
  }> {
    try {
      const categories = ['task_proofs', 'profile_pictures', 'documents'];
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        byCategory: {} as Record<string, { files: number; size: number }>
      };

      for (const category of categories) {
        const dirPath = path.join(this.UPLOAD_DIR, category);
        let categoryFiles = 0;
        let categorySize = 0;

        try {
          const files = await fs.readdir(dirPath);
          
          for (const file of files) {
            const filePath = path.join(dirPath, file);
            const fileStat = await fs.stat(filePath);
            categoryFiles++;
            categorySize += fileStat.size;
          }
        } catch (error) {
          // Directory doesn't exist or other error
        }

        stats.byCategory[category] = {
          files: categoryFiles,
          size: categorySize
        };

        stats.totalFiles += categoryFiles;
        stats.totalSize += categorySize;
      }

      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        byCategory: {}
      };
    }
  }
}

export const fileManager = new FileManagerService();