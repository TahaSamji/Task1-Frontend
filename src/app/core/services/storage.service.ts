import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private getKey(fileId: string): string {
    return `uploadProgress_${fileId}`;
  }

  load(fileId: string): number[] {
    const raw = localStorage.getItem(this.getKey(fileId));
    try {
      return raw ? JSON.parse(raw)?.uploadedChunks ?? [] : [];
    } catch {
      return [];
    }
  }

  save(fileId: string, uploadedChunks: number[],encodingProfileId:number): void {
    localStorage.setItem(this.getKey(fileId), JSON.stringify({
      uploadedChunks,
      encodingProfileId,
      timestamp: new Date().toISOString()
    }));
  }
  

  clear(fileId: string): void {
    localStorage.removeItem(this.getKey(fileId));
  }

  getAllUploadProgresses(): { fileId: string; encodingProfileId: number }[] {
  const progresses: { fileId: string; encodingProfileId: number }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('uploadProgress_')) {
      const fileId = key.replace('uploadProgress_', '');
      try {
        const data = JSON.parse(localStorage.getItem(key)!);
        if (data?.encodingProfileId != null) {
          progresses.push({
            fileId,
            encodingProfileId: data.encodingProfileId
          });
        }
      } catch (e) {
        console.warn(`⚠️ Failed to parse localStorage item for key: ${key}`, e);
      }
    }
  }

  return progresses;
}
}
