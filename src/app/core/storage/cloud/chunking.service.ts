// upload.service.ts
import { Injectable } from '@angular/core';
import { AzureStorageService } from './azure-storage.service';
import { EncodingStateService } from '../../../features/dashboard/services/encoding-state.service';
import { UploadProgressStateService } from '../../../features/dashboard/services/progress-state.service';
import { CompletedStorageService } from '../local/complete.storage.service';
import { ResponseStateService } from '../../../features/dashboard/services/response-state.service';
import { UserService } from '../../services/user.service';
import { BrowserStateService } from '../../../features/dashboard/services/browser-state.service';
import { ResumeStorageService } from '../local/storage.service';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(
    private cloudStorageService: AzureStorageService,
    private storageService: CompletedStorageService,
    private resumeStorageService: ResumeStorageService,
    private browserState: BrowserStateService,
    private uploadProgressState: UploadProgressStateService,
    // private completedStorageService: CompletedStorageService,
    private responseStateService: ResponseStateService,
    private userService: UserService
  ) { }


  async upload(file: File, duration: number, resolution: string, width: number, height: number): Promise<void> {
    const chunkSize = this.cloudStorageService.getChunkSize();
    const totalChunks = Math.ceil(file.size / chunkSize);
    const fileId = `${file.name}`;
    const uploaded = new Set(this.resumeStorageService.loadUploadedChunks(fileId));
    const blockIds: string[] = [];
    const sasUrl = await this.cloudStorageService.getSasUrl(file.name);
    // var upload = this.storageService.loadUpload(fileId);
    // this.storageService.updateIsUploadingStatus(fileId, true);
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

      this.resumeStorageService.saveChunks(fileId, Array.from(uploaded));
      console.log(`✅ Uploaded chunk ${i + 1}/${totalChunks}`);

      const progressPercent = Math.floor((uploaded.size / totalChunks) * 100);
      this.uploadProgressState.setProgressState(fileId, progressPercent);
    }

    if (uploaded.size === totalChunks) {
      await this.cloudStorageService.commitBlockList(sasUrl, blockIds);
      console.log('🎉 File uploaded & committed via block list! :');
      this.storageService.updateCompletionStatus(file.name, true);
      // this.storageService.updateIsUploadingStatus(fileId, false);
      this.resumeStorageService.clear(fileId);
      // const browserState = this.browserState.getBrowserType();
      const message = await this.userService.mergeCompleteAndRequestThumbnail(totalChunks, file.name, file.size, duration, resolution, file.type, width, height);

      alert(message);
      this.responseStateService.setResponseState(message);
      console.log('🎉 File uploaded & committed via block list! :', { message });
    } else {
      console.log('⏸️ Partial upload completed, resuming later.');
    }
  }
}
