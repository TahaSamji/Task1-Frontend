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
import { VideoRenditionDto } from '../../../../core/models/video-renditions.model';

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
  renditions: VideoRenditionDto[] = [];
  dropdownOpen = false;
  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;

  private hls: Hls | null = null;
  private dashPlayer: dashjs.MediaPlayerClass | null = null;

  constructor(
    private renditionService: RenditionService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.renditionService.getthumbnailUrlObservable().subscribe(url => {
      this.thumbnailUrl = url;
      this.cdRef.detectChanges();
      console.log('📸 Thumbnail received in component:', url);
    });
    this.renditionService.getRenditionsObservable().subscribe(renditions => {
      this.renditions = [...renditions].sort((a, b) => {
        const aHeight = parseInt(a.resolution.split('x')[1], 10);
        const bHeight = parseInt(b.resolution.split('x')[1], 10);
        return bHeight - aHeight; // descending order
      });
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
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onQualitySelect(rendition: VideoRenditionDto) {
    console.log('🎯 Selected Rendition URL:', rendition.videoUrl);
    this.renditionService.setVideoPlayBackUrl(rendition.videoUrl, rendition.type);
    this.dropdownOpen = false;
  }

  mapResolutionToLabel(res: string): string {
    const height = res.split('x')[1];
    return height ? `${height}p` : res;
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
  this.dashPlayer.initialize(video, this.videoPlayBackUrl, true);
  
  // Fixed segment interceptor with proper error handling
  const segmentInterceptor = (request: any): Promise<any> => {
    try {
      // Check if this is a video segment request
      if (request.cmcd?.ot === 'v') {
        const separator = request.url.includes('?') ? '&' : '?';
        request.url += `${separator}request-interceptor=true`;
        console.log('🎯 Intercepted Segment URL:', request.url);
      }
      
      // Add SAS token to all requests if available
      if (sasToken) {
        const separator = request.url.includes('?') ? '&' : '?';
        request.url += `${separator}${sasToken}`;
        console.log('🔐 Added SAS token to request:', request.url);
      }
      
      return Promise.resolve(request);
    } catch (error) {
      console.error('❌ Error in segment interceptor:', error);
      // Return the original request if interceptor fails
      return Promise.resolve(request);
    }
  };

  // Add the interceptor
  this.dashPlayer.addRequestInterceptor(segmentInterceptor);

  // Enhanced error handling with request details
  this.dashPlayer.on(dashjs.MediaPlayer.events.ERROR, (e: any) => {
    console.error('❌ DASH Player Error:', e);
    if (e.error && e.error.request) {
      console.error('🔍 Failed Request URL:', e.error.request.url);
      console.error('🔍 Request Status:', e.error.request.status);
      console.error('🔍 Request Headers:', e.error.request.headers);
    }
  });

  // Optional: Add success logging for debugging
  this.dashPlayer.on(dashjs.MediaPlayer.events.FRAGMENT_LOADING_COMPLETED, (e: any) => {
    console.log('✅ Fragment loaded successfully:', e.request?.url);
  });

  // Optional: Add manifest loading events
  this.dashPlayer.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, (e: any) => {
    console.log('📋 Manifest loaded successfully');
  });
} else if (this.format === 'hls') {
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
//  // Log successful requests
//       this.dashPlayer.on(dashjs.MediaPlayer.events.FRAGMENT_LOADING_COMPLETED, (e: any) => {
//         console.log('✅ Fragment loaded successfully:', e.request.url);
//       });

//       // Log when segments start loading
//       this.dashPlayer.on(dashjs.MediaPlayer.events.FRAGMENT_LOADING_STARTED, (e: any) => {
//         console.log('🔄 Started loading fragment:', e.request.url);
//       });

//       // Stream initialization logging
//       this.dashPlayer.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
//         console.log('✅ DASH Stream initialized successfully');
//       });

//       // Manifest loading events
//       this.dashPlayer.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, (e: any) => {
//         console.log('📄 Manifest loaded from:', e.data.url);
//       });

//       // Initialize with manifest
//       console.log('🎬 Initializing DASH player with manifest URL:', this.videoPlayBackUrl);
//       this.dashPlayer.initialize(video, this.videoPlayBackUrl, true);