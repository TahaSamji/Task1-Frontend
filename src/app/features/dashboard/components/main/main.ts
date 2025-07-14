import { Component, OnInit } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import { CompletedStorageService } from '../../../../core/services/complete.storage.service';
import { UploadProgressComponent } from './progressbar/upload-progress.component';
import { RouterModule } from '@angular/router';
import { AppbarComponent } from '../../../../shared/appbar/appbar.component';
import { CommonModule } from '@angular/common';
import { VideoPlayerComponent } from '../videoplayer/video-player.component';
import { EncodingTableComponent } from '../encoding/encoding.component';
import { UserUploadsComponent } from '../useruploads/user-uploads.component';
import { VideoRenditionSelectorComponent } from '../videovariantselector/video-rendition-selector.component';
import { ResumableUploadsComponent } from './resumableuploads/resumable-uploads.component';

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

  constructor(
    private uploadService: UploadService,
    private completedStorageService: CompletedStorageService // ✅ Inject the service
  ) {}

  ngOnInit(): void {
    console.log("Main component started");
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // ✅ Check if already uploaded
      const exists = this.completedStorageService.loadCompletedUpload(file.name);
      console.log(exists);
      if (exists) {
        alert(`✅ File "${file.name}" is already uploaded.`);
        this.selectedFile = null;
       input.value = '';
        return;
      }

      this.selectedFile = file;
      console.log('File selected:', this.selectedFile.name);
    }
  }

  async onUpload(): Promise<void> {
    if (this.selectedFile) {
      // ✅ Save to local storage before upload
      this.completedStorageService.saveCompletedUpload(this.selectedFile.name);
      this.uploadService.onFileSelected(this.selectedFile);
      
    } else {
      alert('Please select a file first.');
    }
  }
}
