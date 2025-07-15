// upload.service.ts
import { Injectable } from '@angular/core';
import { AzureStorageService } from '../../../core/storage/cloud/azure-storage.service';
import { StorageService } from '../../../core/storage/local/storage.service';
import { Subject } from 'rxjs';
import { EncodingStateService } from './encoding-state.service';
import { UploadProgressStateService } from './progress-state.service';
import { CompletedStorageService } from '../../../core/storage/local/complete.storage.service';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(
    private cloudStorageService: AzureStorageService,
    private storageService: StorageService,
    private encodingState: EncodingStateService,
    private uploadProgressState:UploadProgressStateService,
     private completedStorageService: CompletedStorageService 
  ) { }

  private thumbnailSubject = new Subject<string>();
  thumbnail$ = this.thumbnailSubject.asObservable();


  async onResumeUpload(file: File, encodingProfileId: number) {

    if (encodingProfileId == null) {
      alert('Please select an encoding profile first.');
      return;
    }
    await this.upload(file, encodingProfileId);
  }

  async onFileSelected(file: File) {
    const profileId = this.encodingState.getSelectedProfileId();
    if (profileId == null) {
      alert('Please select an encoding profile first.');
      return;
    }
    await this.upload(file, profileId);
  }

  async upload(file: File, EncodingProfileID: number): Promise<void> {
    const chunkSize = this.cloudStorageService.getChunkSize();
    const totalChunks = Math.ceil(file.size / chunkSize);
    const fileId = `${file.name}-${file.size}`;
    const uploaded = new Set(this.storageService.load(fileId));
    const blockIds: string[] = [];
    const sasUrl = await this.cloudStorageService.getSasUrl(file.name);

    for (let i = 0; i < totalChunks; i++) {
      const blockId = btoa(`block-${String(i).padStart(6, '0')}`);
      blockIds.push(blockId);

      if (uploaded.has(i)) {
        console.log(`⏭️ Skipping chunk ${i + 1}`);
        continue;
      }

      const chunk = file.slice(i * chunkSize, Math.min(file.size, (i + 1) * chunkSize));
      await this.cloudStorageService.uploadBlock(sasUrl, blockId, chunk);
      uploaded.add(i);

      this.storageService.save(fileId, Array.from(uploaded), EncodingProfileID);
      console.log(`✅ Uploaded chunk ${i + 1}/${totalChunks}`);
      
      const progressPercent = Math.floor((uploaded.size / totalChunks) * 100);
      this.uploadProgressState.setProgressState( fileId, progressPercent );
    }

    if (uploaded.size === totalChunks) {
      await this.cloudStorageService.commitBlockList(sasUrl, blockIds);
      console.log('🎉 File uploaded & committed via block list! :');
      console.log("profileID:", EncodingProfileID);
      this.storageService.clear(fileId);
      this.completedStorageService.updateCompletionStatus(file.name,true);

      
      const thumbnailUrl = await this.cloudStorageService.mergeCompleteAndRequestThumbnail(totalChunks, file.name, file.size, EncodingProfileID);
      

      this.thumbnailSubject.next(thumbnailUrl);
      console.log('🎉 File uploaded & committed via block list! :', { thumbnailUrl });
    } else {
      console.log('⏸️ Partial upload completed, resuming later.');
    }
  }
}
