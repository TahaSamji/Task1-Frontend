import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class EncodingStateService {
  private selectedProfileIdSubject = new BehaviorSubject<number | null>(null);
  selectedProfileId$ = this.selectedProfileIdSubject.asObservable();

  setSelectedProfileId(id: number) {
    this.selectedProfileIdSubject.next(id);
  }

  getSelectedProfileId(): number | null {
    return this.selectedProfileIdSubject.getValue();
  }
}
