// core/upload/upload-handler.service.ts
import { Injectable, ElementRef } from '@angular/core';
import { UploadService } from '../../../core/storage/cloud/chunking.service';
import { CompletedStorageService } from '../../../core/storage/local/complete.storage.service';
import { ResumeStorageService } from '../../../core/storage/local/storage.service';

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
        private resumeStorageService:ResumeStorageService

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
        console.log("Handle Upload Service:", exists)
        if (exists) {
            if (exists.isComplete) {
                console.log("Handle Upload Service:", exists)
                alert('Video already uploaded.');
                return;
            } 
            
            else {
                alert('Video already uploading.');
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
        this.storageService.saveUpload(this.selectedFile.name, this.selectedFile.size,false);
        this.resumeStorageService.saveUpload(this.selectedFile.name, []);

        // this.storageService.save()

        // Trigger upload
        this.uploadService.upload(this.selectedFile, this.videoDuration, this.resolution, this.width, this.height);
        alert('📤 Video sent for upload.');
    }

    async handleResumeUpload(): Promise<void> {
        if (!this.selectedFile) {
            alert('Please select a video first.');
            return;
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
        const exists = this.resumeStorageService.loadUpload(this.selectedFile.name)!;
        if (exists) {
            console.log("Resume Upload Service:", exists)
            this.uploadService.upload(this.selectedFile, this.videoDuration, this.resolution, this.width, this.height);
            alert('📤 Video sent for upload.');
            return;
        }
    }
}
