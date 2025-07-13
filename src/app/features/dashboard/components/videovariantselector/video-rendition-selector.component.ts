import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/services/user.service';
import { RenditionService } from '../../services/renditions-state.service';

export interface VideoRenditionDto {
  variantId: number;
  type: string;
  resolution: string;
  bitrateKbps: string;
  size: number;
  durationSeconds: number;
  videoUrl: string;
  createdAt: string;
}

@Component({
  selector: 'app-video-rendition-selector',
  templateUrl: './video-rendition-selector.component.html',
  standalone: true,
  styleUrls: ['./video-rendition-selector.component.css'],
  imports: [CommonModule],
})
export class VideoRenditionSelectorComponent implements OnInit {
  
renditions: VideoRenditionDto[] = [];

  videoVariants: VideoRenditionDto[] = [];
  selectedVariantId: number | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(private renditionService: RenditionService, private cdRef: ChangeDetectorRef) {}

ngOnInit(): void {
  this.renditionService.getRenditionsObservable().subscribe((renditions) => {
    this.videoVariants = renditions;
    console.log('💡 Video renditions updated:', renditions);
      this.cdRef.detectChanges();

  });
}

  // loadVideoVariants(): void {
  //   if (!this.videoId) return;

  //   this.loading = true;
  //   this.error = null;

  //   this.userService.getVideoVariants(this.videoId).subscribe({
  //     next: (variants: VideoRenditionDto[]) => {
  //       this.videoVariants = variants;
  //       this.loading = false;
  //       console.log('Video Renditions:', variants); // ✅ Debug
  //     },
  //     error: (err) => {
  //       this.error = err.error || 'Failed to load video variants';
  //       this.loading = false;
  //       console.error('Error loading variants:', err);
  //     },
  //   });
  // }

  onVariantSelect(variantId: number): void {
    this.selectedVariantId = variantId;
  }

  onConfirm(): void {
    if (!this.selectedVariantId) {
      alert('Please select a video quality first');
      return;
    }

    const selected = this.videoVariants.find(
      (v) => v.variantId === this.selectedVariantId
    );

    if (selected) {
      console.log('✅ Selected Variant:', selected);
      // You can emit event or navigate to the video player here
       this.renditionService.setVideoPlayBackUrl(selected.videoUrl,selected.type);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
