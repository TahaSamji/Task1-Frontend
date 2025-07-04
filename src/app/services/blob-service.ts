

// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { firstValueFrom, Observable } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class BlobService {
//   private readonly apiUrl = 'http://localhost:5206/api/azure/sas-url';
//   private readonly mergeApiUrl = 'http://localhost:5206/api/azure/merge';
//   private readonly CHUNK_SIZE = 4 * 1024 * 1024; // 4MB

//   constructor(private http: HttpClient) {}

//   getSasUrl(fileName: string): Observable<string> {
//     const url = `${this.apiUrl}?fileName=${encodeURIComponent(fileName)}`;
//     return this.http.get(url, { responseType: 'text' });
//   }

//  async uploadFileInChunks(file: File): Promise<void> {
//     const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
//     const fileId = `${file.name}`; // unique ID per file

//     for (let i = 0; i < totalChunks; i++) {
//       const start = i * this.CHUNK_SIZE;
//       const end = Math.min(file.size, start + this.CHUNK_SIZE);
//       const chunk = file.slice(start, end);
//       const chunkBlobName = `${fileId}_part${i}`;

//       const sasUrl = await firstValueFrom(this.getSasUrl(chunkBlobName));
//       const result = await fetch(sasUrl, {
//         method: 'PUT',
//         headers: {
//           'x-ms-blob-type': 'BlockBlob'
//         },
//         body: chunk
//       });

//       if (!result.ok) {
//         throw new Error(`❌ Failed to upload chunk ${i + 1}: ${result.statusText}`);
//       }

//       console.log(`✅ Uploaded chunk ${i + 1}/${totalChunks}`);
//     }

//     // 🔄 Tell backend to merge chunks
//     await firstValueFrom(this.http.post(this.mergeApiUrl, {
//       fileId,
//       totalChunks,
//       outputFileName: file.name
//     }));

//     console.log('🎉 All chunks uploaded and merge request sent to server.');
//   }
// }

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BlobService {
  private readonly sasApiUrl = 'http://localhost:5206/api/azure/sas-url';
  private readonly mergeApiUrl = 'http://localhost:5206/api/azure/merge';
  private readonly CHUNK_SIZE = 4 * 1024 * 1024;

  constructor(private http: HttpClient) {}

  getSasUrl(blobName: string): Promise<string> {
    const url = `${this.sasApiUrl}?fileName=${encodeURIComponent(blobName)}`;
    return firstValueFrom(this.http.get(url, { responseType: 'text' }));
  }

  async uploadChunk(sasUrl: string, chunk: Blob): Promise<void> {
    const result = await fetch(sasUrl, {
      method: 'PUT',
      headers: { 'x-ms-blob-type': 'BlockBlob' },
      body: chunk
    });
    if (!result.ok) {
      throw new Error(`❌ Upload failed: ${result.statusText}`);
    }
  }

  async requestMerge(fileId: string, totalChunks: number, outputFileName: string): Promise<void> {
    await firstValueFrom(this.http.post(this.mergeApiUrl, {
      fileId,
      totalChunks,
      outputFileName
    }));
  }

  getChunkSize(): number {
    return this.CHUNK_SIZE;
  }
}
