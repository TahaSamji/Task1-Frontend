// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { firstValueFrom, Observable } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class BlobService {
//   private readonly apiUrl = 'http://localhost:5206/api/azure/sas-url';

//   constructor(private http: HttpClient) {}

//   getSasUrl(fileName: string): Observable<string> {
//     const url = `${this.apiUrl}?fileName=${encodeURIComponent(fileName)}`;
//     return this.http.get(url, { responseType: 'text' });
//   }

//   async uploadFileToBlob(file: File): Promise<void> {
//     try {
//       const sasUrl = await firstValueFrom(this.getSasUrl(file.name));
//       console.log('🔐 SAS URL:', sasUrl);

//       const result = await fetch(sasUrl, {
//         method: 'PUT',
//         headers: {
//           'x-ms-blob-type': 'BlockBlob'
//         },
//         body: file
//       });

//       if (!result.ok) {
//         throw new Error(`Failed to upload to blob: ${result.statusText}`);
//       }

//       console.log(`✅ Uploaded "${file.name}" successfully to Azure Blob.`);
//     } catch (err) {
//       console.error('❌ Error uploading to Azure Blob:', err);
//     }
//   }
// }

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BlobService {
  private readonly apiUrl = 'http://localhost:5206/api/azure/sas-url';
  private readonly mergeApiUrl = 'http://localhost:5206/api/azure/merge';
  private readonly CHUNK_SIZE = 4 * 1024 * 1024; // 4MB

  constructor(private http: HttpClient) {}

  getSasUrl(fileName: string): Observable<string> {
    const url = `${this.apiUrl}?fileName=${encodeURIComponent(fileName)}`;
    return this.http.get(url, { responseType: 'text' });
  }

 async uploadFileInChunks(file: File): Promise<void> {
    const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
    const fileId = `${file.name}`; // unique ID per file

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.CHUNK_SIZE;
      const end = Math.min(file.size, start + this.CHUNK_SIZE);
      const chunk = file.slice(start, end);
      const chunkBlobName = `${fileId}_part${i}`;

      const sasUrl = await firstValueFrom(this.getSasUrl(chunkBlobName));
      const result = await fetch(sasUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob'
        },
        body: chunk
      });

      if (!result.ok) {
        throw new Error(`❌ Failed to upload chunk ${i + 1}: ${result.statusText}`);
      }

      console.log(`✅ Uploaded chunk ${i + 1}/${totalChunks}`);
    }

    // 🔄 Tell backend to merge chunks
    await firstValueFrom(this.http.post(this.mergeApiUrl, {
      fileId,
      totalChunks,
      outputFileName: file.name
    }));

    console.log('🎉 All chunks uploaded and merge request sent to server.');
  }
}

