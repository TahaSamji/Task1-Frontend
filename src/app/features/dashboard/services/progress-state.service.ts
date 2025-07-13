import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface UploadProgress {
  fileId: string;
  progress: number;
}

@Injectable({
  providedIn: 'root',
})
export class UploadProgressStateService {

  // Use BehaviorSubject to keep the latest progress for each fileId
  private progressSubject = new BehaviorSubject<UploadProgress | null>(null);

  // Emit progress update
  setProgressState(fileId: string, progress: number): void {
    this.progressSubject.next({ fileId, progress });
  }

  // Expose observable to subscribe in components
  getProgressStateObservable(): Observable<UploadProgress | null> {
    return this.progressSubject.asObservable();
  }
}
