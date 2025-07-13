// rendition-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VideoRenditionDto } from '../components/videovariantselector/video-rendition-selector.component';

@Injectable({
    providedIn: 'root',
})
export class RenditionService {
    private _renditions$ = new BehaviorSubject<VideoRenditionDto[]>([]);
    private _thumbnailUrl$ = new BehaviorSubject<string>("");
    private _videoPlaybackUrl$ = new BehaviorSubject<string>("");
    private _videoFormatType$ = new BehaviorSubject<string>("");

    setRenditions(renditions: VideoRenditionDto[], thumbnail: string) {
        this._renditions$.next(renditions);
        this._thumbnailUrl$.next(thumbnail);

    }
    setVideoPlayBackUrl(url: string,type:string) {
        this._videoPlaybackUrl$.next(url);
        console.log("Service:",type)
        this._videoFormatType$.next(type);
    }

    getRenditionsObservable() {
        return this._renditions$.asObservable();
    }
    getthumbnailUrlObservable() {
        return this._thumbnailUrl$.asObservable();
    }
    getVideoPlayBackUrlObservable() {
        return this._videoPlaybackUrl$.asObservable();
    }
    getVideoFormatTypeObservable() {
  return this._videoFormatType$.asObservable();
}

}
