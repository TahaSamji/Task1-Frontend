// src/app/core/storage/blob-storage.interface.ts
export interface CloudStorage {
  getSasUrl(blobName: string): Promise<string>;
  uploadBlock(sasUrl: string, blockId: string, chunk: Blob): Promise<void>;
  commitBlockList(sasUrl: string, blockIds: string[]): Promise<void>;
  mergeCompleteAndRequestThumbnail(
    totalChunks: number,
    outputFileName: string,
    fileSize: number,
    EncodingId: number
  ): Promise<string>;
  getChunkSize(): number;
}
