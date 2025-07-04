import { Component } from '@angular/core';
import { BlobService } from '../services/blob.service';

@Component({
  selector: 'app-upload',
  templateUrl: './main_component.html',
  styleUrls: ['./main_component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;

  constructor(private blobService: BlobService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('File selected:', this.selectedFile.name);
    }
  }

  async onUpload(): Promise<void> {
    if (this.selectedFile) {
      console.log('Uploading:', await this.selectedFile.arrayBuffer());
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`Starting upload with fileId: ${fileId}`);


      this.blobService.uploadFileInChunks(this.selectedFile);
      
    } else {
      alert('Please select a file first.');
    }
  }


}
