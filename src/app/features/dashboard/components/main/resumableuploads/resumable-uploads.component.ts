import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StorageService } from '../../../../../core/services/storage.service';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../../services/upload.service';

interface UploadProgress {
  fileId: string;
  encodingProfileId: number;
  uploadedChunks: number[];
}

@Component({
  selector: 'app-resumable-uploads',
  templateUrl: './resumable-uploads.component.html',
  standalone :true,
  styleUrls: ['./resumable-uploads.component.css'],
  imports :[CommonModule]
})
export class ResumableUploadsComponent implements OnInit {
  uploads: UploadProgress[] = [];
  selectedFile: File | null = null;

  constructor(private storageService: StorageService,private uploadService:UploadService, private cdRef: ChangeDetectorRef) {}

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

   onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('File selected:', this.selectedFile.name);
    }
  }

  async onUpload(): Promise<void> {
   
  }

  resumeUpload(fileId: string, encodingProfileId: number): void {
    console.log(`🔁 Resuming upload for File ID: ${fileId}, Profile: ${encodingProfileId}`);
     if (this.selectedFile) {
      this.uploadService.onResumeUpload(this.selectedFile,encodingProfileId);
      this.cdRef.detectChanges();
    } else {
      alert('Please select a file first.');
    }


    // TODO: Trigger your upload logic here
  }

  clearProgress(fileId: string): void {
    this.storageService.clear(fileId);
    this.loadAllProgresses(); // Refresh list
  }
}
