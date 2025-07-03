import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BlobService {
  constructor() {}

  async uploadFileInChunks(file: File, fileId: string): Promise<void> {
    const chunkSize = 5 * 1024 * 1024; // 5 MB
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      try {
 
        // const sasUrl = await this.http
        //   .get<string>(`/api/sas-url?fileId=${fileId}&chunkIndex=${i}`)
        //   .toPromise();

        
        // await fetch(sasUrl!, {
        //   method: 'PUT',
        //   headers: {
        //     'x-ms-blob-type': 'BlockBlob'
        //   },
        //   body: chunk
        // });

        // console.log(`✅ Uploaded chunk ${i + 1} / ${totalChunks}`);
        console.log(chunk);
      } catch (err) {
        console.error(`❌ Failed to upload chunk ${i + 1}`, err);
        throw err;
      }
    }

    console.log('🎉 All chunks uploaded successfully.');
  }
}
