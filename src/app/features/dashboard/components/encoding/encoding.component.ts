import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

declare var Hls: any;

interface VideoItem {
  id: number;
  title: string;
  duration: string;
  size: string;
}

@Component({
  selector: 'app-encodings-list',
  templateUrl: './encoding.component.html',
  styleUrls: ['./encoding.component.css']
})
export class EncodingComponent implements AfterViewInit {
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>;

  selectedVideoId: number | null = null;
  selectedVideoUrl: string | null = null;

  videos: VideoItem[] = [
    { id: 1, title: 'Introduction.mp4', duration: '3:45', size: '25 MB' },
    { id: 2, title: 'Tutorial_Part1.mp4', duration: '10:12', size: '70 MB' },
    { id: 3, title: 'Outro.mp4', duration: '1:58', size: '15 MB' },
  ];

  selectVideo(id: number): void {
    this.selectedVideoId = id;

    // This should be dynamically built per video id in real use case
    this.selectedVideoUrl = 'https://task1storageaccount.blob.core.windows.net/uploads/hls/file.m3u8';

    this.playVideo();
  }

  ngAfterViewInit(): void {
    if (this.selectedVideoUrl) {
      this.playVideo();
    }
  }

  private playVideo(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video || !this.selectedVideoUrl) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(this.selectedVideoUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = this.selectedVideoUrl;
    }
  }
}
