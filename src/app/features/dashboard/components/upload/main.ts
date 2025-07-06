import { Component } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import { RouterModule } from '@angular/router';
import { AppbarComponent } from '../../../../shared/appbar/appbar.component';
import { EncodingComponent } from "../encoding/encoding.component";

@Component({
  selector: 'app-upload',
   standalone: true,
  templateUrl: './main_component.html',
  styleUrls: ['./main_component.css'],
  imports: [RouterModule, AppbarComponent, EncodingComponent]
})
export class UploadComponent {
  selectedFile: File | null = null;

  constructor(private uploadService: UploadService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('File selected:', this.selectedFile.name);
    }
  }

  async onUpload(): Promise<void> {
    if (this.selectedFile) {
      this.uploadService.upload(this.selectedFile);
      
    } else {
      alert('Please select a file first.');
    }
  }


}
