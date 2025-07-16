import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';
import * as dashjs from 'dashjs';
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

  constructor(
    private uploadService: UploadService,
    private renditionService: RenditionService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.renditionService.getthumbnailUrlObservable().subscribe(url => {
      this.thumbnailUrl = url;
      this.cdRef.detectChanges();
      console.log('📸 Thumbnail received in component:', url);
    });

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

  private extractSasToken(url: string): string {
    try {
      const urlObj = new URL(url);
      const searchParams = urlObj.searchParams;

      const sasParams = ['sv', 'ss', 'srt', 'sp', 'se', 'st', 'spr', 'sig', "sr"];
      const tokenParams = new URLSearchParams();

      sasParams.forEach(param => {
        const value = searchParams.get(param);
        if (value) {
          tokenParams.append(param, value);
        }
      });

      return tokenParams.toString();
    } catch (error) {
      console.error('Error extracting SAS token:', error);
      return '';
    }
  }

  tryInitializePlayer(): void {
    const video = this.video.nativeElement;

    if (!this.videoPlayBackUrl) return;

    // Cleanup existing players
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    if (this.dashPlayer) {
      this.dashPlayer.reset();
      this.dashPlayer = null;
    }

    const sasToken = this.extractSasToken(this.videoPlayBackUrl);
  console.log('🔑 Extracted SAS token:', sasToken);
  console.log('🎥 Player format:', this.format);

 if (this.format === 'dash') {
    this.dashPlayer = dashjs.MediaPlayer().create();

    if (sasToken) {
      // Create the RequestModifier with proper closure
      const requestModifier = {
        modifyRequestHeader: (xhr: any) => {
          return xhr;
        },
        modifyRequestURL: (url: string) => {
          console.log('🔗 Original URL:', url);
          
          // Skip token for manifest files (.mpd)
          if (url.includes('.mpd')) {
            console.log('⛔ Skipping token for manifest:', url);
            return url;
          }

          // Append token to segment URLs
          const modifiedUrl = url.includes('?') ? `${url}&${sasToken}` : `${url}?${sasToken}`;
          console.log('✅ Modified URL:', modifiedUrl);
          return modifiedUrl;
        }
      };

      this.dashPlayer.extend('RequestModifier', () => requestModifier, true);
    }

    // Set up error handling
    this.dashPlayer.on(dashjs.MediaPlayer.events.ERROR, (e: any) => {
      console.error('❌ DASH Player Error:', e);
    });

    this.dashPlayer.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
      console.log('✅ DASH Stream initialized');
    });

    this.dashPlayer.initialize(video, this.videoPlayBackUrl, true);
    }else if (this.format === 'hls') {
      if (Hls.isSupported()) {
        this.hls = new Hls(
          
          {
          xhrSetup: (xhr, url) => {
            // ⛔️ Skip token for .m3u8 files (playlist)
            if (url.includes('.m3u8')) {
              xhr.open('GET', url, true);
            } else {
              // ✅ Append token to chunks (e.g., .ts or .m4s)
              const urlWithToken = url.includes('?') ? `${url}&${sasToken}` : `${url}?${sasToken}`;
              xhr.open('GET', urlWithToken, true);
            }
          }
        }
      
      );

        this.hls.loadSource(this.videoPlayBackUrl);
        this.hls.attachMedia(video);
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play();
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        const urlWithToken = this.videoPlayBackUrl.includes('?')
          ? `${this.videoPlayBackUrl}&${sasToken}`
          : `${this.videoPlayBackUrl}?${sasToken}`;

        video.src = urlWithToken;
        video.addEventListener('loadedmetadata', () => {
          video.play();
        });
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
