
import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { channelService } from '../../services/channel.service';
import { CategoryService } from '../../services/category.service';
import { VideoService } from '../../services/video.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Channel, ChannelData, editShorts, navVid } from '../Types/channelTypes';
import {  Shorts,  video } from '../Types/videoTypes';

@Component({
  selector: 'app-shorts',
  templateUrl: './shorts.component.html',
  styleUrl: './shorts.component.css'
})
export class ShortsComponent implements OnInit, OnDestroy {
searchPlaylists() {
throw new Error('Method not implemented.');
}
  constructor(
    private _authService: AuthService,
    private _channelService: channelService,
    private _categoryService: CategoryService,
    private _videoService: VideoService,
    private _router: Router,
    private _dialog: MatDialog,
    
  ) { }

  showCreatePlaylistModal = false;
  newPlaylist = {
    name: '',
    description: '',
    category:'',
    isPublic: true,
    thumbnail: null as File | null
  };
  thumbnailPreview: string | null = null;

  channel!: ChannelData;
  isEditingName = false;
  newChannelName = '';
  categories: { name: string, _id: string }[] = [];
  showUploadModal = false;
  newVideo!: navVid
  showShortsUploadModal = false;
  newShort = {
    name: '',
    description: '',
    category: '',
    file: null,
  };
  editingShort!: editShorts
showEditShortModal: boolean = false;
shortTitleError: string = '';
shortCategoryError: string = '';
  isUploading = false;
  showEditModal = false;
  titleError: string = '';
descriptionError: string = '';
categoryError: string = '';
showVideos = true;
showAddVideoModal = false;
newThumbnail: File | null = null;
shorts: Shorts[]=[];
activeContentType: 'videos' | 'playlists' | 'shorts' = 'videos';
private destroy$ = new Subject<void>();
  selectedShort: Shorts | null = null;
  currentShortIndex: number = -1;
  @ViewChild('modalVideoPlayer') modalVideoPlayer!: ElementRef<HTMLVideoElement>;



  ngOnInit(): void {
    this._categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories: { name: string; _id: string }[]) => {
          this.categories = categories;
          //console.log("Fetched categories:", this.categories);
        },
        error: (error) => {
          console.error('Error fetching categories:', error);
        }
      });

    this.loadChannelData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChannelData(): void {
    this._channelService.getChannelData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channelData: Channel) => {
          //console.log("Fetched channel data", channelData);
          if (channelData && channelData.channel) {
            this.channel = {
              _id: channelData.channel._id,
              name: channelData.channel.channelName || 'Channel Name',
              profilePic: channelData.channel.profilePic || '/assets/images/Screenshot (204).png',
              bannerImage: channelData.channel.banner || '/assets/images/Screenshot (204).png',
              subscribers: channelData.channel.subscribers?.length || 0,
              isRestricted: channelData.channel.isRestricted || false
            };
            this.loadAllShorts();
          } else {
            console.error('Channel data not found');
          }
        },
        error: (error) => {
          console.error('Error fetching channel data:', error);
        }
      });
  }

  loadAllShorts(): void {
    this._videoService.getShortsVideos()
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        if (response && Array.isArray(response.videos)) {
          this.shorts = response.videos.map(this.mapShortData);
          //console.log("Shorts of channel", this.shorts);
          this.calculateVideoDurations();
        } else {
          console.error('Unexpected response format:', response);
        }
      }, error => {
        console.error('Error loading shorts:', error);
      });
  }

  mapShortData(video: video): Shorts {
    return {
      _id: video._id || '',
      channelId: video.channelId || '',
      name: video.name || '',
      title: video.title || video.name || 'No Title',
      url: video.url || '',
      duration: '00:00', // Initialize with placeholder, will be updated
      views: video.views || 0,
      isListed: video.isListed !== undefined ? video.isListed : false,
      thumbnail: video.thumbnail || video.thumbnailUrl || '',
      category: video.category,
      likes: video.likes || [],
      disLikes: video.disLikes || [],
      channelName: video.channelName || '',
      timeAgo: video.timeAgo || '',
      createdAt: video.createdAt || '',
    };
  }

  calculateVideoDurations() {
    this.shorts.forEach(short => {
      const videoElement = document.createElement('video');
      videoElement.src = short.url;

      videoElement.addEventListener('loadedmetadata', () => {
        const duration = videoElement.duration;
        short.duration = this.formatDuration(duration);
      });
    });
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }


  playShort(short: Shorts): void {
    this.selectedShort = short;
    this.currentShortIndex = this.shorts.findIndex(s => s._id === short._id);
  }

  closeShort(): void {
    this.selectedShort = null;
    this.currentShortIndex = -1;
    if (this.modalVideoPlayer) {
      this.modalVideoPlayer.nativeElement.pause();
    }
  }

  playNextShort(): void {
    if (this.currentShortIndex < this.shorts.length - 1) {
      this.currentShortIndex++;
    } else {
      this.currentShortIndex = 0; // Loop back to the first short
    }
    this.selectedShort = this.shorts[this.currentShortIndex];
    this.playSelectedShort();
  }

  playPreviousShort(): void {
    if (this.currentShortIndex > 0) {
      this.currentShortIndex--;
    } else {
      this.currentShortIndex = this.shorts.length - 1; // Loop to the last short
    }
    this.selectedShort = this.shorts[this.currentShortIndex];
    this.playSelectedShort();
  }

  private playSelectedShort(): void {
    if (this.modalVideoPlayer) {
      this.modalVideoPlayer.nativeElement.load(); // Reload the video element
      this.modalVideoPlayer.nativeElement.play(); // Start playing the new video
    }
  }

  // ... existing methods ...

  // playShort(short: any): void {
  //   this.selectedShort = short;
  // }

  // closeShort(): void {
  //   this.selectedShort = null;
  //   if (this.modalVideoPlayer) {
  //     this.modalVideoPlayer.nativeElement.pause();
  //   }
  // }
  
}
