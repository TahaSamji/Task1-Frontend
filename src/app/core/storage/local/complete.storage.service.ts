import { Injectable } from '@angular/core';

interface UploadedFileInfo {
  fileName: string;
  size: number,
  isComplete : boolean
}

@Injectable({ providedIn: 'root' })
export class CompletedStorageService {
  private readonly prefix = 'useruploads_';

  private getKey(fileId: string): string {
    return `${this.prefix}${fileId}`;
  }

//  updateIsResumedStatus(fileName : string,status : boolean){
//      const existing = this.loadUpload(fileName);
//       if (existing) {
//       existing.isResumed = status;
//       localStorage.setItem(this.getKey(fileName), JSON.stringify(existing));
//       console.log("Status Updated:",existing);
//     }
//   }
  // updateIsUploadingStatus(fileName : string,status : boolean){
  //    const existing = this.loadUpload(fileName);
  //     if (existing) {
  //     existing.isUploading = status;
  //     localStorage.setItem(this.getKey(fileName), JSON.stringify(existing));
  //     console.log("Status Updated:",existing);
  //   }
  // }
  // Save upload progress
  saveUpload(fileName: string, size: number,isComplete:boolean): void {
    const data: UploadedFileInfo = {
      fileName,
      size,
      isComplete
  
    };
    console.log("Upload Saved :",data);
    localStorage.setItem(this.getKey(fileName), JSON.stringify(data));
  }

  updateCompletionStatus(fileName: string, isComplete: boolean): void {
    const existing = this.loadUpload(fileName);
    if (existing) {
      existing.isComplete = isComplete;
      localStorage.setItem(this.getKey(fileName), JSON.stringify(existing));
      console.log("Completion status Update :", existing);
    }
  }

  // Load a specific upload
  loadUpload(fileName: string): UploadedFileInfo | null {
    const raw = localStorage.getItem(this.getKey(fileName));
    console.log("Upload Loaded:",raw);
    try {
      return raw ? JSON.parse(raw) as UploadedFileInfo : null;
    } catch {
      return null;
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

   getAllUploadProgresses(): { fileId: string }[] {
  const progresses: { fileId: string }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('useruploads_')) {
      const fileId = key.replace('useruploads_', '');
      try {
        const data = JSON.parse(localStorage.getItem(key)!);
        if (Array.isArray(data?.uploadedChunks) && !data.isCompleted && data.isUploading && !data.isResumed) {
          progresses.push({ fileId });
        }
      } catch (e) {
        console.warn(`⚠️ Failed to parse localStorage item for key: ${key}`, e);
      }
    }
  }

  return progresses;
}


  // saveChunk(fileId: string, uploadedChunks: number[]): void {
  //   const key = this.getKey(fileId);
  //   const raw = localStorage.getItem(key);

  //   let fileInfo: UploadedFileInfo;

  //   if (raw) {
  //     // Parse existing data
  //     fileInfo = JSON.parse(raw) as UploadedFileInfo;
  //     // Merge and deduplicate chunks
  //     fileInfo.uploadedChunks =uploadedChunks;
  //     // Optionally update completion status
  //     // fileInfo.isCompleted = fileInfo.uploadedChunks.length >= fileInfo.totalChunks;
  //   } else {
  //     console.warn(`⚠️ No existing upload info found for fileId: ${fileId}`);
  //     return;
  //   }

  //   // Save back to localStorage
  //   localStorage.setItem(key, JSON.stringify(fileInfo));
  //   // console.log(`✅ Updated chunk info saved for fileId: ${fileId}`, fileInfo);
  // }



  // List all completed uploads
  listAllUploads(): UploadedFileInfo[] {
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
