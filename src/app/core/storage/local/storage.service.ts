import { Injectable } from '@angular/core';


export interface UploadProgress {
  fileId: string;
  uploadedChunks: number[];
}

@Injectable({ providedIn: 'root' })
export class ResumeStorageService {
  private getKey(fileId: string): string {
    return `uploadProgress_${fileId}`;
  }

  loadUploadedChunks(fileId: string): number[] {
    const raw = localStorage.getItem(this.getKey(fileId));
    try {
      return raw ? JSON.parse(raw)?.uploadedChunks ?? [] : [];
    } catch {
      return [];
    }
  }

  loadUploadChunks(fileId: string): number[] {
    const raw = localStorage.getItem(this.getKey(fileId));
    try {
      return raw ? JSON.parse(raw)?.uploadedChunks ?? [] : [];
    } catch {
      return [];
    }
  }
    saveUpload(fileName: string, uploadedChunks: number[]): void {
    const data: UploadProgress = {
      fileId:fileName,
      uploadedChunks,
    
    };
    console.log("Upload Saved :",data);
    localStorage.setItem(this.getKey(fileName), JSON.stringify(data));
  }

   loadUpload(fileName: string): UploadProgress | null {
    const raw = localStorage.getItem(this.getKey(fileName));
    console.log("Upload Loaded:",raw);
    try {
      return raw ? JSON.parse(raw) as UploadProgress : null;
    } catch {
      return null;
    }
  }
  saveChunks(fileId: string, uploadedChunks: number[]): void {
    localStorage.setItem(this.getKey(fileId), JSON.stringify({
      uploadedChunks,
      timestamp: new Date().toISOString()
    }));
  }
  

  clear(fileId: string): void {
    localStorage.removeItem(this.getKey(fileId));
  }

   getAllUploadProgresses(): { fileId: string }[] {
  const progresses: { fileId: string }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('uploadProgress_')) {
      const fileId = key.replace('uploadProgress_', '');
      try {
        const data = JSON.parse(localStorage.getItem(key)!);
        if (Array.isArray(data?.uploadedChunks) ) {
          progresses.push({ fileId });
        }
      } catch (e) {
        console.warn(`⚠️ Failed to parse localStorage item for key: ${key}`, e);
      }
    }
  }

  return progresses;
}
  



}
