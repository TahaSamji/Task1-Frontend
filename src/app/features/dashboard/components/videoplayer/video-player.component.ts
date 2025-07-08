import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;
  
  private hls: Hls | null = null;
  hlsUrl = 'https://task1storageaccount.blob.core.windows.net/uploads/hls/file.m3u8';
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  volume = 1;
  isMuted = false;
  isFullscreen = false;

  ngOnInit(): void {
    this.initializePlayer();
  }

  ngOnDestroy(): void {
    if (this.hls) {
      this.hls.destroy();
    }
  }

  private initializePlayer(): void {
    const videoElement = this.video.nativeElement;

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(this.hlsUrl);
      this.hls.attachMedia(videoElement);
      
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed');
      });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoElement.src = this.hlsUrl;
    } else {
      console.error('HLS not supported');
    }

    // Video event listeners
    videoElement.addEventListener('play', () => this.isPlaying = true);
    videoElement.addEventListener('pause', () => this.isPlaying = false);
    videoElement.addEventListener('timeupdate', () => this.currentTime = videoElement.currentTime);
    videoElement.addEventListener('loadedmetadata', () => this.duration = videoElement.duration);
    videoElement.addEventListener('volumechange', () => {
      this.volume = videoElement.volume;
      this.isMuted = videoElement.muted;
    });
  }

  togglePlay(): void {
    const videoElement = this.video.nativeElement;
    if (this.isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  }

  seek(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.video.nativeElement.currentTime = parseFloat(target.value);
  }

  setVolume(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.video.nativeElement.volume = parseFloat(target.value);
  }

  toggleMute(): void {
    this.video.nativeElement.muted = !this.video.nativeElement.muted;
  }

  toggleFullscreen(): void {
    if (!this.isFullscreen) {
      this.video.nativeElement.requestFullscreen();
      this.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isFullscreen = false;
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}