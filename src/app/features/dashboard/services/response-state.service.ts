import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ResponseStateService {

  // Use BehaviorSubject to keep the latest progress for each fileId
  private responseSubject = new BehaviorSubject<string | null>("");

  // Emit progress update
  setResponseState(message: string): void {
    this.responseSubject.next(message);
  }

  // Expose observable to subscribe in components
  getResponseStateObservable(): Observable<string | null> {
    return this.responseSubject.asObservable();
  }
}
