import { Component, OnInit } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import { CompletedStorageService } from '../../../../core/storage/local/complete.storage.service';
import { UploadProgressComponent } from './progressbar/upload-progress.component';
import { RouterModule } from '@angular/router';
import { AppbarComponent } from '../../../../shared/components/appbar/appbar.component';
import { CommonModule } from '@angular/common';
import { VideoPlayerComponent } from '../videoplayer/video-player.component';
import { EncodingTableComponent } from '../encoding/encoding.component';
import { UserUploadsComponent } from '../useruploads/user-uploads.component';
import { VideoRenditionSelectorComponent } from '../videovariantselector/video-rendition-selector.component';
import { ResumableUploadsComponent } from './resumableuploads/resumable-uploads.component';
import { AzureStorageService } from '../../../../core/storage/cloud/azure-storage.service';
import { EncodingStateService } from '../../services/encoding-state.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  templateUrl: './main_component.html',
  styleUrls: ['./main_component.css'],
  imports: [
    RouterModule, AppbarComponent, CommonModule, VideoPlayerComponent, EncodingTableComponent, UserUploadsComponent, VideoRenditionSelectorComponent, ResumableUploadsComponent, UploadProgressComponent
  ]
})
export class UploadComponent implements OnInit {
  selectedFile: File | null = null;
  profileId: number = 0;


  constructor(
    private uploadService: UploadService,
    private encodingState: EncodingStateService,
    private completedStorageService: CompletedStorageService,
    private cloudStorageService: AzureStorageService // ✅ Inject the service
  ) { }

  ngOnInit(): void {
    console.log("Main component started");
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      console.log('File selected:', this.selectedFile.name);
      console.log('File selected:', this.selectedFile);
      const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const duration = video.duration;

      console.log('Resolution:', `${width}x${height}`);
      console.log('Duration (seconds):', duration.toFixed(2));

      // Cleanup
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      console.error('Failed to load video metadata.');
    };

    video.src = URL.createObjectURL(file);
  

    }
  }

  async onUpload(): Promise<void> {
    if (this.selectedFile) {
      // ✅ Save to local storage before upload
      const exists = this.completedStorageService.loadCompletedUpload(this.selectedFile.name);
      console.log(exists);
      if (exists) {
        if (exists.isCompleted == true) {
          const selectedProfileId = this.encodingState.getSelectedProfileId();
          if (selectedProfileId === null) {
            alert('Please select an encoding profile first.');
            return;
          }
          this.profileId = selectedProfileId;
          this.cloudStorageService.mergeCompleteAndRequestThumbnail(exists.totalChunks, exists.fileName, exists.size, this.profileId);
          alert("merge Request Send");
          return;
        }
        alert("Please Wait");
        return;
      }
      this.completedStorageService.saveCompletedUpload(this.selectedFile.name, 0, this.selectedFile.size, false);

      this.uploadService.onFileSelected(this.selectedFile);
      alert("FileSent");

    } else {
      alert('Please select a file first.');
    }
  }
}
