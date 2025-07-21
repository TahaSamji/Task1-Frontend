import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import {  JwtAuthService } from '../../features/auth/jwt-auth.service';
import { VideoMetaData } from '../models/video-metadata.model';


export interface VideoRendition {
  variantId: number;
  type: string;
  resolution: string;
  bitrateKbps: string;
  size: number;
  durationSeconds: number;
  videoUrl: string;
  createdAt: string;
}

export interface Thumbnail {
  id: number;
  blobUrl: string;
  timeOffset: string;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:5206/api/video';

  constructor(private http: HttpClient, private authService: JwtAuthService) {}

  getUserUploads(page: number = 1, pageSize: number = 6): Observable<VideoMetaData[]> {
    const headers = this.authService.getAuthHeaders();
    const params = {
      page: page.toString(),
      pageSize: pageSize.toString()
    };
    return this.http.get<VideoMetaData[]>(`${this.apiUrl}/my-uploads`, { headers, params });
  }

  getVideoVariants(videoId: number): Observable<VideoRendition[]> {
    const headers = this.authService.getAuthHeaders();
    const params = { fileId: videoId.toString() };
    return this.http.get<VideoRendition[]>(`${this.apiUrl}/get-video-renditions`, {
      headers,
      params
    });
    
  }

  getAllThumbnails(fileId: number): Observable<Thumbnail[]> {
  const headers = this.authService.getAuthHeaders();
  const params = { fileId: fileId.toString() };

  return this.http.get<Thumbnail[]>(`${this.apiUrl}/get-all-video-thumbnails`, {
    headers,
    params
  });
}

setDefaultThumbnail(thumbnailId: number, fileId: number): Observable<any> {
  const headers = this.authService.getAuthHeaders();
  const params = {
    thumbnailId: thumbnailId.toString(),
    fileId: fileId.toString()
  };

  // Assuming the controller is at /api/thumbnail
  return this.http.post<any>(`${this.apiUrl}/set-default-thumbnail`, null, {
    headers,
    params
  });
}

async mergeCompleteAndRequestThumbnail(
  totalChunks: number,
  outputFileName: string,
  fileSize: number,
  duration : number,
  resolution : string,
  mimeType: string,
  width:number,
  height:number,

): Promise<string> {
  const headers = this.authService.getAuthHeaders();

  const response = await firstValueFrom(
    this.http.post<{ message: string }>(`${this.apiUrl}/mergeComplete`, {
      totalChunks,
      outputFileName,
      fileSize,
      resolution,
      mimeType,
      duration,
      width,height

    }, { headers })
  );

  return response.message;
}

}
