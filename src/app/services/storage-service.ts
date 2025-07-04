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

  save(fileId: string, uploadedChunks: number[]): void {
    localStorage.setItem(this.getKey(fileId), JSON.stringify({
      uploadedChunks,
      timestamp: new Date().toISOString()
    }));
  }

  clear(fileId: string): void {
    localStorage.removeItem(this.getKey(fileId));
  }
}
