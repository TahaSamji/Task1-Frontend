import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import { RouterModule } from '@angular/router';
import { AppbarComponent } from '../../../../shared/appbar/appbar.component';
import { VideoPlayerComponent } from "../videoplayer/video-player.component";
import { EncodingTableComponent } from "../encoding/encoding.component";
import { UserService, VideoMetaData } from '../../../../core/services/user.service';
import { UserUploadsComponent } from "../useruploads/user-uploads.component";
import { CommonModule } from '@angular/common';
import { VideoRenditionSelectorComponent } from "../videovariantselector/video-rendition-selector.component";
import { ResumableUploadsComponent } from "./resumableuploads/resumable-uploads.component";
import { UploadProgressComponent } from "./progressbar/upload-progress.component";

@Component({
  selector: 'app-upload',
  standalone: true,
  templateUrl: './main_component.html',
  styleUrls: ['./main_component.css'],
  imports: [RouterModule, AppbarComponent, CommonModule, VideoPlayerComponent, EncodingTableComponent, UserUploadsComponent, VideoRenditionSelectorComponent, ResumableUploadsComponent, UploadProgressComponent]
})
export class UploadComponent implements OnInit {
  selectedFile: File | null = null;

  constructor(
    private uploadService: UploadService,
  ) { }

  ngOnInit(): void {
    console.log("Main component started");
    // Load user uploads immediately when component initializes
    
  
  }

  // ✅ Separate method for loading uploads
 

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('File selected:', this.selectedFile.name);
    }
  }

  async onUpload(): Promise<void> {
    if (this.selectedFile) {
      this.uploadService.onFileSelected(this.selectedFile);
    } else {
      alert('Please select a file first.');
    }
  }
}
