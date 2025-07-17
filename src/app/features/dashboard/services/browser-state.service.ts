import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class BrowserStateService {
  private browserStateSubject = new BehaviorSubject<string | null>("");
  browserState$ = this.browserStateSubject.asObservable();

  setBrowserType(browser_type: string) {
    this.browserStateSubject.next(browser_type);
  }

  getBrowserType(): string | null {
    return this.browserStateSubject.getValue();
  }
}
