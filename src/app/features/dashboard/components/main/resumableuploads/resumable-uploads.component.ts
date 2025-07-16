import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StorageService } from '../../../../../core/storage/local/storage.service';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../../services/upload.service';
import { UploadHandlerService } from '../../../services/upload-handler.service';

interface UploadProgress {
  fileId: string;
  encodingProfileId: number;
  uploadedChunks: number[];
}

@Component({
  selector: 'app-resumable-uploads',
  templateUrl: './resumable-uploads.component.html',
  standalone: true,
  styleUrls: ['./resumable-uploads.component.css'],
  imports: [CommonModule]
})
export class ResumableUploadsComponent implements OnInit {
  uploads: UploadProgress[] = [];
  selectedFile: File | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private storageService: StorageService, private uploadService: UploadService, private cdRef: ChangeDetectorRef, private uploadHandler: UploadHandlerService) { }

  ngOnInit(): void {
    this.loadAllProgresses();
  }

  loadAllProgresses(): void {
    const entries: { fileId: string; encodingProfileId: number }[] = this.storageService.getAllUploadProgresses();
    this.uploads = entries.map(entry => ({
      fileId: entry.fileId,
      encodingProfileId: entry.encodingProfileId,
      uploadedChunks: this.storageService.load(entry.fileId)
    }));
  }

  async onFileSelected(event: Event): Promise<void> {
    await this.uploadHandler.handleFileSelection(event, this.fileInput);
  }

  async resumeUpload(): Promise<void> {
    await this.uploadHandler.handleUpload();
  }

  clearProgress(fileId: string): void {
    this.storageService.clear(fileId);
    this.loadAllProgresses(); // Refresh list
  }
}
