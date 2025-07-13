// rendition-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ThumbnailModalStateService {

    private _selectedVideoId$ = new BehaviorSubject<number>(-1);


    setModalState(videoId: number) {
        this._selectedVideoId$.next(videoId);


    }


    getModalStateObservable() {
        return this._selectedVideoId$.asObservable();
    }



}
