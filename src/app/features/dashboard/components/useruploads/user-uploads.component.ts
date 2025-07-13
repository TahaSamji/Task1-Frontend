import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { UserService, VideoMetaData } from '../../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { RenditionService } from '../../services/renditions-state.service';
import { ThumbnailModalStateService } from '../../services/thumbnail-modal-state.service';
import { ThumbnailModalComponent } from "./videothumbnails/thumbnail-modal.component";

@Component({
    selector: 'app-user-uploads',
    templateUrl: './user-uploads.component.html',
    standalone: true,
    styleUrls: ['./user-uploads.component.css'],
    imports: [CommonModule, ThumbnailModalComponent]
})
export class UserUploadsComponent implements OnInit {
    uploads: VideoMetaData[] = [];
    loading: boolean = true;
    error: string | null = null;
    currentPage = 1;
    pageSize = 6;
    isModalOpen = false;
    selectedVideoId: number = 0;
    selectedThumbnailId: number | null = null;
    constructor(private userService: UserService,private thumbnailModalStateService:ThumbnailModalStateService, private cdRef: ChangeDetectorRef, private renditionService: RenditionService) { }

    ngOnInit(): void {
        this.loadUserUploads(this.currentPage);
    }

    loadUserUploads(page: number): void {
        this.loading = true;
        this.userService.getUserUploads(page, this.pageSize).subscribe({
            next: (data) => {
                this.uploads = data;
                this.loading = false;
                this.cdRef.detectChanges();
            },
            error: (err) => {
                this.error = 'Failed to load uploads';
                this.loading = false;
                console.error('Error loading uploads:', err);
            }
        });
    }
    nextPage(): void {
        this.currentPage++;
        this.loadUserUploads(this.currentPage);
    }

    prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadUserUploads(this.currentPage);
        }
    }
    onCardClick(upload: VideoMetaData): void {
        console.log('Video clicked:', upload);

        this.userService.getVideoVariants(upload.id).subscribe({
            next: (renditions) => {
                console.log('Renditions:', renditions);
                this.renditionService.setRenditions(renditions, upload.defaultThumbnailUrl);
                const target = document.getElementById('video-container');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

            },
            error: (err) => {
                console.error('Failed to load renditions:', err);
                this.renditionService.setRenditions([], "");
            }
        });
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    onImageError(event: any): void {
        event.target.style.display = 'none';
        event.target.nextElementSibling.style.display = 'flex';
    }


    openThumbnailModal(videoId: number, event: Event): void {
        event.stopPropagation();
        this.isModalOpen = true;
        this.selectedVideoId = videoId;
      
        console.log("clicked",videoId) // Prevent card click event
        this.thumbnailModalStateService.setModalState(this.selectedVideoId);
    }

    onModalClose(): void {
        this.isModalOpen = false;
        this.selectedVideoId = 0;
    }

    onThumbnailSelected(thumbnailId: number): void {
        this.selectedThumbnailId = thumbnailId;
        console.log('Thumbnail selected:', thumbnailId, 'for video:', this.selectedVideoId);

        // Here you can add logic to update the video's thumbnail
        // For example, call an API to set the selected thumbnail as default
        // this.userService.setDefaultThumbnail(this.selectedVideoId, thumbnailId).subscribe(...)

        // Optional: Show feedback message for a few seconds
        setTimeout(() => {
            this.selectedThumbnailId = null;
        }, 3000);
    }

}