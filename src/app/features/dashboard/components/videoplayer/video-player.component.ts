import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';
import * as dashjs from 'dashjs'; // 👈 import DASH player
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
  private hls: Hls | null = null;
  private dashPlayer: dashjs.MediaPlayerClass | null = null;

  constructor(private uploadService: UploadService) {}

  ngOnInit(): void {
    this.uploadService.thumbnail$.subscribe(url => {
      this.thumbnailUrl = url;
      console.log('📸 Thumbnail received in component:', url);
    });

    const video = this.video.nativeElement;

    // 👉 Choose HLS or DASH here
    const hlsUrl = 'https://task1storageaccount.blob.core.windows.net/uploads/1/ocean.mp4_1_3/hls/playlist.m3u8';
    const dashUrl = 'https://task1storageaccount.blob.core.windows.net/uploads/1/myvid.mp4_2_2/dash/manifest.mpd';

    const useDash = false; // 👈 toggle this based on your logic (e.g., based on profile or file extension)

    if (useDash) {
      // MPEG-DASH playback
      this.dashPlayer = dashjs.MediaPlayer().create();
      this.dashPlayer.initialize(video, dashUrl, true);
    } else if (Hls.isSupported()) {
      // HLS playback using Hls.js
      this.hls = new Hls();
      this.hls.loadSource(hlsUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = hlsUrl;
    
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
    } else {
      console.error('❌ Neither HLS nor DASH is supported in this browser.');
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
