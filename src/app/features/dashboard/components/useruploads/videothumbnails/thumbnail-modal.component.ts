import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Thumbnail, UserService } from '../../../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { ThumbnailModalStateService } from '../../../services/thumbnail-modal-state.service';

@Component({
  selector: 'app-thumbnail-modal',
  templateUrl: './thumbnail-modal.component.html',
  styleUrls: ['./thumbnail-modal.component.css'],
  standalone: true,
  imports :[CommonModule]
})
export class ThumbnailModalComponent implements OnInit, OnDestroy {
   isModalOpen = false;
  videoId: number = 0;


  thumbnails: Thumbnail[] = [];
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(private userService: UserService,private thumbnailModalStateService:ThumbnailModalStateService, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Load thumbnails when modal opens
   this.thumbnailModalStateService.getModalStateObservable().subscribe(videoId => {
     if(videoId != -1){
      this.isModalOpen = true;
      this.cdRef.detectChanges();
      this.videoId = videoId;
      this.loadThumbnails();
      
      console.log('📸 Modal  in component:', videoId);
     }
    });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(): void {
    // Load thumbnails when modal opens or videoId changes
    if (this.isModalOpen && this.videoId) {
      this.loadThumbnails();
    }
  }

  loadThumbnails(): void {
    if (!this.videoId) {
      this.errorMessage = 'No video ID provided';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getAllThumbnails(this.videoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (thumbnails) => {
          this.thumbnails = thumbnails.slice(0, 6); // Limit to 5 thumbnails as requested
          this.isLoading = false;
            this.cdRef.detectChanges();
        },
        error: (error) => {
          console.error('Error loading thumbnails:', error);
          this.errorMessage = 'Failed to load thumbnails. Please try again.';
          this.isLoading = false;
        }
      });
  }

   onThumbnailClick(thumbnailId: number): void {
    console.log('Thumbnail clicked:', thumbnailId);
    console.log('Video :', this.videoId);

    this.userService.setDefaultThumbnail(thumbnailId, this.videoId).subscribe({
      next: (res) => {
        console.log('Default thumbnail set successfully:', res);
          this.cdRef.detectChanges();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error setting default thumbnail:', err);
      }
    });
     this.closeModal();
  }

  closeModal(): void {
    this.isModalOpen = false;
    
  }

  // Method to open modal (can be called from parent component)
  openModal(videoId: number): void {
    this.videoId = videoId;
    this.isModalOpen = true;
    this.loadThumbnails();
  }
}