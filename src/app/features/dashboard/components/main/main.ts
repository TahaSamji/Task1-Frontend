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
import { BrowserStateService } from '../../services/browser-state.service';

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

  constructor(
    private uploadHandler: UploadHandlerService,
    private browserState: BrowserStateService
  ) { }

 @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

 getBrowserName(): string {
  const userAgent = navigator.userAgent;

  if (userAgent.includes('Firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('Edg')) {
    return 'Edge';
  } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return 'Chrome';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'Safari';
  } else if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
    return 'Opera';
  } else {
    return 'Unknown';
  }
}

  ngOnInit(): void {
    const browserName = this.getBrowserName();
    this.browserState.setBrowserType(browserName);
    console.log(`Detected Browser: ${browserName}`);
  }

async onFileSelected(event: Event): Promise<void> {
    await this.uploadHandler.handleFileSelection(event, this.fileInput);
}

async onUpload(): Promise<void> {
  await this.uploadHandler.handleUpload();
}
}
