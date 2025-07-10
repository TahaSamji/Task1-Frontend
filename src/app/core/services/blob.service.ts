import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BlobService {
  private readonly baseUrl = 'http://localhost:5206/api';
  private readonly CHUNK_SIZE = 5 * 1024 * 1024;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getSasUrl(blobName: string): Promise<string> {
    const url = `${this.baseUrl}/cloudstorage/sas-url?fileName=${encodeURIComponent(blobName)}`;
    const headers = this.getAuthHeaders();

    return firstValueFrom(this.http.get(url, {
      responseType: 'text',
      headers
    }));
  }
// blob.service.ts
async uploadBlock(sasUrl: string, blockId: string, chunk: Blob): Promise<void> {
  const url = `${sasUrl}&comp=block&blockid=${encodeURIComponent(blockId)}`;
  const result = await fetch(url, {
    method: 'PUT',
    headers: { 'x-ms-blob-type': 'BlockBlob' },
    body: chunk
  });

  if (!result.ok) {
    throw new Error(`❌ Block upload failed: ${result.statusText}`);
  }
}
// <BlockList>
//    <Latest>YmxvY2stMDAx</Latest>
//    <Latest>YmxvY2stMDAy</Latest>
//    <Latest>YmxvY2stMDAz</Latest>
// </BlockList>
async commitBlockList(sasUrl: string, blockIds: string[]): Promise<void> {
  const url = `${sasUrl}&comp=blocklist`;
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?><BlockList>${blockIds
    .map(id => `<Latest>${id}</Latest>`)
    .join('')}</BlockList>`;

  const result = await fetch(url, {
    method: 'PUT',
    headers: {
      'x-ms-blob-content-type': 'video/mp4',
      'Content-Type': 'application/xml'
    },
    body: xmlBody
  });

  if (!result.ok) {
    throw new Error(`❌ Commit block list failed: ${result.statusText}`);
  }
}
  // async uploadChunk(sasUrl: string, chunk: Blob): Promise<void> {
  //   // Don't attach auth headers here — SAS URLs are already authenticated!
  //   const result = await fetch(sasUrl, {
  //     method: 'PUT',
  //     headers: { 'x-ms-blob-type': 'BlockBlob' },
  //     body: chunk
  //   });

  //   if (!result.ok) {
  //     throw new Error(`❌ Upload failed: ${result.statusText}`);
  //   }
  // }

  async mergeCompleteAndRequestThumbnail(
  totalChunks: number,
  outputFileName: string,
  fileSize: number,
  EncodingId: number
): Promise<string> {
  const headers = this.getAuthHeaders();

  const response = await firstValueFrom(
    this.http.post<{ thumbnailUrl: string }>(`${this.baseUrl}/video/mergeComplete`, {
      totalChunks,
      outputFileName,
      fileSize,
      EncodingId
    }, { headers })
  );

  return response.thumbnailUrl;
}
  getChunkSize(): number {
    return this.CHUNK_SIZE;
  }
}
