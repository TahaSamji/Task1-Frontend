import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadProgressStateService } from '../../../services/progress-state.service';

interface UploadProgress {
  fileId: string;
  progress: number;
}

@Component({
  selector: 'app-upload-progress',
  templateUrl: './upload-progress.component.html',
  styleUrls: ['./upload-progress.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class UploadProgressComponent implements OnInit {
  uploads: UploadProgress[] = [];

  constructor(
    private progressService: UploadProgressStateService,
    private cdRef: ChangeDetectorRef // ✅ Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.progressService.getProgressStateObservable().subscribe(update => {
      if (!update || !update.fileId) return;

      const index = this.uploads.findIndex(u => u.fileId === update.fileId);
      if (index >= 0) {
        this.uploads[index].progress = update.progress;
      } else {
        this.uploads.push(update);
      }

      this.cdRef.detectChanges(); // ✅ Ensure the UI reflects the latest update
    });
  }
}
