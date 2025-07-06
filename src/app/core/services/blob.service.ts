import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BlobService {
  private readonly sasApiUrl = 'http://localhost:5206/api/azure/sas-url';
  private readonly mergeApiUrl = 'http://localhost:5206/api/video/mergeChunks';
  private readonly CHUNK_SIZE = 4 * 1024 * 1024;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getSasUrl(blobName: string): Promise<string> {
    const url = `${this.sasApiUrl}?fileName=${encodeURIComponent(blobName)}`;
    const headers = this.getAuthHeaders();

    return firstValueFrom(this.http.get(url, {
      responseType: 'text',
      headers
    }));
  }

  async uploadChunk(sasUrl: string, chunk: Blob): Promise<void> {
    // Don't attach auth headers here — SAS URLs are already authenticated!
    const result = await fetch(sasUrl, {
      method: 'PUT',
      headers: { 'x-ms-blob-type': 'BlockBlob' },
      body: chunk
    });

    if (!result.ok) {
      throw new Error(`❌ Upload failed: ${result.statusText}`);
    }
  }

  async requestMerge(fileId: string, totalChunks: number, outputFileName: string,fileSize: number,  EncodingId : number): Promise<void> {
    const headers = this.getAuthHeaders();

    await firstValueFrom(this.http.post(this.mergeApiUrl, {
      fileId,
      totalChunks,
      outputFileName,
      fileSize,
      EncodingId
    }, { headers }));
  }

  getChunkSize(): number {
    return this.CHUNK_SIZE;
  }
}
