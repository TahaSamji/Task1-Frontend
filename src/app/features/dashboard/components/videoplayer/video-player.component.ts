import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';
import * as dashjs from 'dashjs'; // 👈 import DASH player
import { UploadService } from '../../services/upload.service';
import { RenditionService } from '../../services/renditions-state.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  thumbnailUrl: string | null = null;
  videoPlayBackUrl: string | null = null;
  format: string | null = null;
  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;
  private hls: Hls | null = null;
  private dashPlayer: dashjs.MediaPlayerClass | null = null;


  constructor(private uploadService: UploadService, private renditionService: RenditionService, private cdRef: ChangeDetectorRef) { }


  ngOnInit(): void {

    this.renditionService.getthumbnailUrlObservable().subscribe(url => {
      this.thumbnailUrl = url;
      this.cdRef.detectChanges();
      console.log('📸 Thumbnail received in component:', url);
    });

    // Wait until BOTH URL and format are available
    combineLatest([
      this.renditionService.getVideoPlayBackUrlObservable(),
      this.renditionService.getVideoFormatTypeObservable()
    ]).subscribe(([url, format]) => {
      if (url && format) {
        this.videoPlayBackUrl = url;
        this.format = format;
        console.log('🎬 Ready to initialize player with format:', format, 'and URL:', url);
        this.tryInitializePlayer();
      }
    });


  }
  //   ngOnInit(): void {
  //   const video = this.video.nativeElement;

  //   this.renditionService.getthumbnailUrlObservable().subscribe(url => {
  //     this.thumbnailUrl = url;
  //     this.cdRef.detectChanges();
  //     console.log('📸 Thumbnail received in component:', url);
  //   });

  //   // Subscribe to both URL and format type
  //   this.renditionService.getVideoPlayBackUrlObservable().subscribe(url => {
  //     this.videoPlayBackUrl = url;
  //     this.tryInitializePlayer(); // Try initializing player after URL update
  //   });

  //   this.renditionService.getVideoFormatTypeObservable().subscribe(type => {
  //     if (type) {
  //       this.format = type;
  //       // Try again after format is known
  //     }
  //   });
  //    this.tryInitializePlayer();
  // }
  tryInitializePlayer(): void {
    const video = this.video.nativeElement;

    if (!this.videoPlayBackUrl) return;

    // Clean up previous players
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    if (this.dashPlayer) {
      this.dashPlayer.reset();
      this.dashPlayer = null;
    }

    // Get format type from service
    console.log("player:", this.format); // 👈 or store locally via subscription

    if (this.format === 'dash') {
      this.dashPlayer = dashjs.MediaPlayer().create();
      this.dashPlayer.initialize(video, this.videoPlayBackUrl, true);
    } else if (this.format === 'hls') {
      if (Hls.isSupported()) {
        this.hls = new Hls();
        this.hls.loadSource(this.videoPlayBackUrl);
        this.hls.attachMedia(video);
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = this.videoPlayBackUrl;
        video.addEventListener('loadedmetadata', () => video.play());
      } else {
        console.error('❌ HLS is not supported in this browser.');
      }
    } else {
      console.error('❌ Unknown format type:', this.format);
    }
  }


  ngOnDestroy(): void {
    if (this.hls) {
      this.hls.destroy();
    }
    if (this.dashPlayer) {
      this.dashPlayer.reset();
    }
  }
}
