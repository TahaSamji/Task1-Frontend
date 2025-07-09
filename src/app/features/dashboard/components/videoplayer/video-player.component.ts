import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  thumbnailUrl: string | null = null;
  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;
  constructor(private uploadService: UploadService) { }
  private hls: Hls | null = null;
 

  ngOnInit(): void {
    this.uploadService.thumbnail$.subscribe(url => {
      this.thumbnailUrl = url;
      console.log('📸 Thumbnail received in component:', url);
    });
  }
  ngOnDestroy(): void {
    if (this.hls) {
      this.hls.destroy();
    }
  }



}