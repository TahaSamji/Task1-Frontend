import { Component } from '@angular/core';

interface VideoItem {
  id: number;
  title: string;
  duration: string;
  size: string;
}

@Component({
  selector: 'app-encodings-list',
  templateUrl: './encoding.component.html',
  styleUrls: ['./encoding.component.css']
})
export class EncodingComponent {
  selectedVideoId: number | null = null;

  videos: VideoItem[] = [
    { id: 1, title: 'Introduction.mp4', duration: '3:45', size: '25 MB' },
    { id: 2, title: 'Tutorial_Part1.mp4', duration: '10:12', size: '70 MB' },
    { id: 3, title: 'Outro.mp4', duration: '1:58', size: '15 MB' },
  ];

  selectVideo(id: number): void {
    this.selectedVideoId = id;
    console.log('Selected video ID:', id);
  }
}
