import { Injectable } from '@angular/core';

interface UploadedFileInfo {
  fileId: string;
}

@Injectable({ providedIn: 'root' })
export class CompletedStorageService {
  private readonly prefix = 'Completed_Upload_';

  private getKey(fileId: string): string {
    return `${this.prefix}${fileId}`;
  }

  // Save upload progress
  saveCompletedUpload(fileId: string): void {
    const data: UploadedFileInfo = {
      fileId,
    };
    localStorage.setItem(this.getKey(fileId), JSON.stringify(data));
  }

  // Load a specific upload
  loadCompletedUpload(fileId: string): UploadedFileInfo | null {
    const raw = localStorage.getItem(this.getKey(fileId));
    try {
      return raw ? JSON.parse(raw) as UploadedFileInfo : null;
    } catch {
      return null;
    }
  }

  // List all completed uploads
  listCompletedUploads(): UploadedFileInfo[] {
    const uploads: UploadedFileInfo[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const raw = localStorage.getItem(key);
        try {
          if (raw) uploads.push(JSON.parse(raw));
        } catch {
          // Ignore corrupted entries
        }
      }
    }
    return uploads;
  }

  // Clear a specific upload
  clear(fileId: string): void {
    localStorage.removeItem(this.getKey(fileId));
  }

  // Clear all uploads (optional)
  clearAll(): void {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }
}
