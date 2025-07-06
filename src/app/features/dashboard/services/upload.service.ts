import { Injectable } from '@angular/core';
import { BlobService } from '../../../core/services/blob.service';
import { StorageService } from '../../../core/services/storage.service';


@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(
    private blobUpload: BlobService,
    private storageService: StorageService
  ) {}

  async upload(file: File): Promise<void> {
    const chunkSize = this.blobUpload.getChunkSize();
    const totalChunks = Math.ceil(file.size / chunkSize);
    const fileId = `${file.name}-${file.size}`;
    const uploaded = new Set(this.storageService.load(fileId));

    for (let i = 0; i < totalChunks; i++) {
      if (uploaded.has(i)) {
        console.log(`⏭️ Skipping chunk ${i + 1}`);
        continue;
      }

      const chunk = file.slice(i * chunkSize, Math.min(file.size, (i + 1) * chunkSize));
      const chunkName = `${fileId}_part${i}`;
      const sasUrl = await this.blobUpload.getSasUrl(chunkName);

      await this.blobUpload.uploadChunk(sasUrl, chunk);
      uploaded.add(i);
      this.storageService.save(fileId, Array.from(uploaded));
      console.log(`✅ Uploaded chunk ${i + 1}/${totalChunks}`);
    }

    if (uploaded.size === totalChunks) {
      await this.blobUpload.requestMerge(fileId, totalChunks, file.name,file.size,1);
      this.storageService.clear(fileId);
      console.log('🎉 File uploaded & merged!');
    } else {
      console.log('⏸️ Partial upload completed, resuming later.');
    }
  }
}
