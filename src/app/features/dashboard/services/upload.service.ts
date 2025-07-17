// upload.service.ts
import { Injectable } from '@angular/core';
import { AzureStorageService } from '../../../core/storage/cloud/azure-storage.service';
import { StorageService } from '../../../core/storage/local/storage.service';
import { EncodingStateService } from './encoding-state.service';
import { UploadProgressStateService } from './progress-state.service';
import { CompletedStorageService } from '../../../core/storage/local/complete.storage.service';
import { ResponseStateService } from './response-state.service';
import { UserService } from '../../../core/services/user.service';
import { BrowserStateService } from './browser-state.service';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(
    private cloudStorageService: AzureStorageService,
    private storageService: StorageService,
    private browserState: BrowserStateService,
    private uploadProgressState: UploadProgressStateService,
    private completedStorageService: CompletedStorageService,
    private responseStateService: ResponseStateService,
    private userService : UserService
  ) { }


  async upload(file: File,duration:number,resolution:string,width:number,height:number): Promise<void> {
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

      this.storageService.save(fileId, Array.from(uploaded));
      console.log(`✅ Uploaded chunk ${i + 1}/${totalChunks}`);

      const progressPercent = Math.floor((uploaded.size / totalChunks) * 100);
      this.uploadProgressState.setProgressState(fileId, progressPercent);
    }

    if (uploaded.size === totalChunks) {
      await this.cloudStorageService.commitBlockList(sasUrl, blockIds);
      console.log('🎉 File uploaded & committed via block list! :');
      this.storageService.clear(fileId);
      this.completedStorageService.updateCompletionStatus(file.name, true);

     const browserState =  this.browserState.getBrowserType();
      const message = await this.userService.mergeCompleteAndRequestThumbnail(totalChunks, file.name, file.size,duration,resolution,file.type,width,height,browserState!);

      alert(message);
      this.responseStateService.setResponseState(message);
      console.log('🎉 File uploaded & committed via block list! :', { message });
    } else {
      console.log('⏸️ Partial upload completed, resuming later.');
    }
  }
}
