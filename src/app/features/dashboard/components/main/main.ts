import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UploadProgressComponent } from './progressbar/upload-progress.component';
import { RouterModule } from '@angular/router';
import { AppbarComponent } from '../../../../shared/components/appbar/appbar.component';
import { CommonModule } from '@angular/common';
import { VideoPlayerComponent } from '../videoplayer/video-player.component';
import { UserUploadsComponent } from '../useruploads/user-uploads.component';
import { ResumableUploadsComponent } from './resumableuploads/resumable-uploads.component';
import { UploadHandlerService } from '../../services/upload-handler.service';
import { EncodingTableComponent } from "../encoding/encoding.component";

@Component({
  selector: 'app-upload',
  standalone: true,
  templateUrl: './main_component.html',
  styleUrls: ['./main_component.css'],
  imports: [
    RouterModule, AppbarComponent, CommonModule, VideoPlayerComponent, UserUploadsComponent, ResumableUploadsComponent, UploadProgressComponent,
    EncodingTableComponent
]
})
export class UploadComponent implements OnInit {
  selectedFile: File | null = null;
  profileId: number = 0;
  videoDuration : number = 0;
  resolution : string = "";

  ngOnInit(): void {
    
  }
  constructor(
    private uploadHandler: UploadHandlerService
  ) { }

 @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

async onFileSelected(event: Event): Promise<void> {
    await this.uploadHandler.handleFileSelection(event, this.fileInput);
}

async onUpload(): Promise<void> {
  await this.uploadHandler.handleUpload();
}
}
