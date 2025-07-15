import { Injectable } from '@angular/core';

interface UploadedFileInfo {
  fileName: string;
  totalChunks : number,
  size : number,
  isCompleted : boolean
}

@Injectable({ providedIn: 'root' })
export class CompletedStorageService {
  private readonly prefix = 'Completed_Upload_';

  private getKey(fileId: string): string {
    return `${this.prefix}${fileId}`;
  }

  // Save upload progress
  saveCompletedUpload(fileName: string,totalChunks : number,size : number,isCompleted:boolean): void {
    const data: UploadedFileInfo = {
      fileName,
      totalChunks,
      size,
      isCompleted
    };
    localStorage.setItem(this.getKey(fileName), JSON.stringify(data));
  }

  updateCompletionStatus(fileName: string, isCompleted: boolean): void {
  const existing = this.loadCompletedUpload(fileName);
  if (existing) {
    existing.isCompleted = isCompleted;
    localStorage.setItem(this.getKey(fileName), JSON.stringify(existing));
  }
}

  // Load a specific upload
  loadCompletedUpload(fileName: string): UploadedFileInfo | null {
    const raw = localStorage.getItem(this.getKey(fileName));
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
  clear(fileName: string): void {
    localStorage.removeItem(this.getKey(fileName));
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
