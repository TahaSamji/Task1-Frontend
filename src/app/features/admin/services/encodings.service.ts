// encoding.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface EncodingProfile {
  id?: number;
  name: string;
  ffmpeg_args: string;
  resolution: string;
  bitrate: string;
  format_type: string;
  created_at?: string;
}

export interface PaginatedResponse {
  items: EncodingProfile[];
  total: number;
  page: number;
  pageSize: number;
}


@Injectable({ providedIn: 'root' })
export class EncodingService {
  private readonly baseUrl = 'http://localhost:5206/api';
  constructor(private http: HttpClient) { }
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }


  addEncodingProfile(profile: EncodingProfile): Observable<EncodingProfile> {
    const headers = this.getAuthHeaders();
    console.log(profile);
    return this.http.post<EncodingProfile>(`${this.baseUrl}/encodingprofile/create-encoding-profiles`, profile, { headers });
  }

  getAllEncodingProfiles(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<PaginatedResponse>(
      `${this.baseUrl}/video/getallEncodings?page=${page}&pageSize=${pageSize}`,
      { headers }
    );
  }
  updateEncodingProfile(id: number, profile: EncodingProfile): Observable<EncodingProfile> {
    const headers = this.getAuthHeaders();
    return this.http.put<EncodingProfile>(
      `${this.baseUrl}/encodingprofile/update-encoding-profile/${id}`,
      profile,
      { headers }
    );
  }
 deleteEncodingProfile(id: number): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.delete(`${this.baseUrl}/encodingprofile/delete-encoding-profile/${id}`, {
    headers,
    responseType: 'text' as 'json' // tell Angular to treat text as JSON
  });
}

}
