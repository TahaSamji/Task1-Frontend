// upload.service.ts
import { Injectable } from '@angular/core';
import { BlobService } from '../../../core/services/blob.service';
import { StorageService } from '../../../core/services/storage.service';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(
    private blobService: BlobService,
    private storageService: StorageService
  ) {}

    private thumbnailSubject = new Subject<string>();
  thumbnail$ = this.thumbnailSubject.asObservable(); // ⬅️ Component can subscribe to this


  async upload(file: File): Promise<void> {
    const chunkSize = this.blobService.getChunkSize();
    const totalChunks = Math.ceil(file.size / chunkSize);
    const fileId = `${file.name }-${file.size}`;
    const uploaded = new Set(this.storageService.load(fileId));
    const blockIds: string[] = [];

    const sasUrl = await this.blobService.getSasUrl(file.name);

    for (let i = 0; i < totalChunks; i++) {
      const blockId = btoa(`block-${String(i).padStart(6, '0')}`);
      blockIds.push(blockId);

      if (uploaded.has(i)) {
        console.log(`⏭️ Skipping chunk ${i + 1}`);
        continue;
      }

      const chunk = file.slice(i * chunkSize, Math.min(file.size, (i + 1) * chunkSize));
      await this.blobService.uploadBlock(sasUrl, blockId, chunk);
      uploaded.add(i);
      this.storageService.save(fileId, Array.from(uploaded));
      console.log(`✅ Uploaded chunk ${i + 1}/${totalChunks}`);
    }

    if (uploaded.size === totalChunks) {
      await this.blobService.commitBlockList(sasUrl, blockIds);
      console.log('🎉 File uploaded & committed via block list! :');
      const thumbnailUrl = await this.blobService.mergeCompleteAndRequestThumbnail(totalChunks,file.name,file.size,1,);
      this.storageService.clear(fileId);
      
       this.thumbnailSubject.next(thumbnailUrl);
      console.log('🎉 File uploaded & committed via block list! :',{thumbnailUrl});
    } else {
      console.log('⏸️ Partial upload completed, resuming later.');
    }
  }
}
