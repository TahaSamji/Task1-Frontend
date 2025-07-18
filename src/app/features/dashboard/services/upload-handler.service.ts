// core/upload/upload-handler.service.ts
import { Injectable, ElementRef } from '@angular/core';
import { UploadService } from './upload.service';
import { CompletedStorageService } from '../../../core/storage/local/complete.storage.service';
import { StorageService } from '../../../core/storage/local/storage.service';

@Injectable({ providedIn: 'root' })
export class UploadHandlerService {
    selectedFile: File | null = null;
    videoDuration = 0;
    width = 0;
    height = 0;
    resolution = '';

    constructor(
        private uploadService: UploadService,
        private storageService: CompletedStorageService,

    ) { }

    async handleFileSelection(event: Event, fileInput: ElementRef<HTMLInputElement>): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            // ✅ Only allow video types
            if (!file.type.startsWith('video/')) {
                alert('Only video files are allowed.');
                fileInput.nativeElement.value = '';
            }
            this.selectedFile = file;
        }
    }

    async handleUpload(): Promise<void> {
        if (!this.selectedFile) {
            alert('Please select a video first.');
            return;
        }

        // ✅ Prevent re-upload
        const exists = this.storageService.loadUpload(this.selectedFile.name);
        if (exists) {
            if (exists.isCompleted && !exists.isUploading) {
                alert('Video already uploaded.');
                return;
            }  if (this.storageService.shouldResume(exists)) {
                this.uploadService.upload(this.selectedFile, this.videoDuration, this.resolution, this.width, this.height);
                alert('📤 Video sent for upload.');
                return;
            }


        }

        const video = document.createElement('video');
        video.preload = 'metadata';

        const objectUrl = URL.createObjectURL(this.selectedFile);

        await new Promise<void>((resolve, reject) => {
            video.onloadedmetadata = () => {
                this.width = video.videoWidth;
                this.height = video.videoHeight;
                this.videoDuration = Math.round(video.duration);
                this.resolution = `${this.width}x${this.height}`;
                URL.revokeObjectURL(objectUrl);
                resolve();
            };

            video.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Failed to load video metadata.'));
            };

            video.src = objectUrl;
        });

        // Save to local store
        this.storageService.saveUpload(this.selectedFile.name, this.selectedFile.size, this.selectedFile.size, false, []);
        // this.storageService.save()

        // Trigger upload
        this.uploadService.upload(this.selectedFile, this.videoDuration, this.resolution, this.width, this.height);
        alert('📤 Video sent for upload.');
    }
}
