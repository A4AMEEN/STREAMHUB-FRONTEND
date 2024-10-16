// playlist-videos.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-playlist-videos',
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#2f2f2f] rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <h2 class="text-2xl font-bold text-white mb-4">{{ playlist.name }} Videos</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div *ngFor="let video of playlist.videos" class="bg-[#1f1f1f] rounded-lg overflow-hidden">
            <div class="relative">
              <video [src]="video.url" class="w-full aspect-video object-cover"></video>
              <div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs font-semibold px-2 py-1 rounded">
                {{ video.duration }}
              </div>
            </div>
            <div class="p-3">
              <h3 class="text-lg font-bold text-gray-300">{{ video.title }}</h3>
              <p class="text-gray-400 text-sm mt-1">{{ video.views }} views • {{ video.timeAgo }}</p>
            </div>
          </div>
        </div>
        <button (click)="close()" class="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Close</button>
      </div>
    </div>
  `
})
export class PlaylistVideosComponent {
  @Input() playlist: any;
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }
}