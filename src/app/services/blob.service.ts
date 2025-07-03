import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BlobService {
   private readonly apiUrl = 'http://localhost:5206/api/azure/get-sasURL';

  constructor(private http: HttpClient) {}

  async uploadFileInChunks(file: File, fileId: string): Promise<void> {
    const chunkSize = 5 * 1024 * 1024; // 5 MB
    const totalChunks = Math.ceil(file.size / chunkSize);

    // Step 1: Get the SAS URL
    const sasUrl = await this.getSasUrl(file.name);

    if (!sasUrl) {
      throw new Error('SAS URL not received');
    }
    console.log(sasUrl);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      try {
 
        
        
       
        console.log(chunk);
      } catch (err) {
        console.error(`❌ Failed to upload chunk ${i + 1}`, err);
        throw err;
      }
    }

    console.log('🎉 All chunks uploaded successfully.');
  }

  private getSasUrl(fileName: string): Promise<string> {
    const params = new HttpParams()
      .set('fileName', fileName)
      .set('contentType', 'video/mp4');

    return firstValueFrom(
      this.http.get(this.apiUrl, { params, responseType: 'text' })
    );
  }

  
}
