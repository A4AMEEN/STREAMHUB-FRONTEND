import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { channelService } from '../../services/channel.service';
import { CategoryService } from '../../services/category.service';
import { environment } from '../../../env/environment';
import { VideoService } from '../../services/video.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from '../Reusables/conformation.component';
import { ActionConfirmationDialogComponent } from '../Reusables/actionConform.component';
import { ErrorDialogComponent } from '../Reusables/error.component';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Channel, ChannelData, PlayList, Playlist, updateVideo, Video } from '../Types/channelTypes';
import { ShortResponse, Shorts, video } from '../Types/videoTypes';
@Component({
  selector: 'app-channel-video',
  templateUrl: './channel-video.component.html',
  styleUrl: './channel-video.component.css'
})
export class ChannelVideoComponent implements OnInit,OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('bannerInput') bannerInput!: ElementRef;
  channel: ChannelData ={
    _id: '',
    name: '',
    profilePic: '',
    subscribers: 0,
    isRestricted: false,
    bannerImage: ''
  };
  isEditingName = false;
  newChannelName:string='';
  categories: { name: string, _id: string }[] = [];
  showUploadModal = false;
  newVideo = {
    name: '',
    description: '',
    category: '',
    file: null as File | null, 
  };
showEditShortModal: boolean = false;
shortTitleError: string = '';
shortCategoryError: string = '';
  isUploading = false;
  showEditModal = false;
  editingVideo:updateVideo = {
    videoId: '',
    title: '',
    description: '',
    category: ''
  };
  videos: Video[] = [];
  titleError: string = '';
descriptionError: string = '';
categoryError: string = '';
showVideos = true;
showAddVideoModal = false;
activeContentType: 'videos' | 'playlists' | 'shorts' = 'videos';
  constructor(
    private _authService: AuthService,
    private _channelService: channelService,
    private _categoryService: CategoryService,
    private _videoService: VideoService,
    private _router: Router,
    private _dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

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

  loadAllVideos(): void {
    if (this.channel && this.channel._id) {
      this._channelService.getChannelVideos(this.channel._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: { videos: Video[] }) => {
            //console.log('Raw response:', response);
            if (response && Array.isArray(response.videos)) {
              this.videos = response.videos.map((video) => ({
                _id: video._id || '',
                thumbnailUrl: video.thumbnail || '/assets/images/Screenshot (204).png',
                title: video.name || 'No Title',
                description: video.description || 'No Description',
                category: video.category ? video.category._id : 'No Category',
                channelName: this.channel.name || 'Unknown Channel',
                channelId: video.channelId || '',
                likes: video.likes || [],
                disLikes: video.dislikes || [],
                views: `${video.views || 0} views`,
                timeAgo: this.calculateTimeAgo(video.createdAt),
                url: video.url || '',
                isListed: video.isListed !== undefined ? video.isListed : false,
                duration: '00:00' // Default duration, will be updated
              }));
              //console.log('Processed videos:', this.videos);
              this.calculateVideoDurations();
            } else {
              console.error('Unexpected response format:', response);
            }
          },
          error: (error: { error: { message: string; }; }) => {
            console.error('Error loading videos:', error);
          }
        });
    }
  }
  
  calculateTimeAgo(createdAt: string): string {
    // Implement logic to calculate time difference
    // For now, returning a placeholder
    return '10:10';
  }
  trackByVideoId(index: number, video: Video): string {
    return video._id;
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
            this.loadAllVideos();
          } else {
            console.error('Channel data not found');
          }
        },
        error: (error: any) => {
          console.error('Error fetching channel data:', error);
        }
      });
  }


  calculateVideoDurations() {
    this.videos.forEach(video => {
      const videoElement = document.createElement('video');
      videoElement.src = video.url;

      videoElement.addEventListener('loadedmetadata', () => {
        const duration = videoElement.duration;
        video.duration = this.formatDuration(duration);
        this.changeDetectorRef.detectChanges();
      });
    });
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }
  navigateToVideo(video: Video) {
    const videoId = video._id || 'default';
    const videoData = {
      _id: video._id,
      url: video.url,
      category: video.category,
      channelName: video.channelName,
      channelId: video.channelId,
      views: video.views,
      likes: video.likes,
      name: video.name,
      description: video.description || '',
      thumbnail: video.thumbnail
    };

    this._channelService.getChannelById(video.channelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channelData) => {
          this._router.navigate(['/user/video', videoId], {
            state: {
              videoData: videoData,
              channelData: channelData.channel
            }
          });
        },
        error: (error) => {
          console.error("Error loading channel data", error);
          this._router.navigate(['/user/video', videoId], {
            state: {
              videoData: videoData
            }
          });
        }
      });
  }

  openEditModal(video: Video) {
    this.editingVideo = {
      videoId: video._id,  // Map _id to videoId
      title: video.title || '',  // Ensure title is a string
      description: video.description || '',  // Ensure description is a string
      category: video.category || '',  // Ensure category is a string
      // Add other fields as necessary
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  toggleVideoListing(video: Video): void {
    const newListingStatus = !video.isListed;
    const action = newListingStatus ? 'list' : 'unlist';

    const dialogRef = this._dialog.open(ActionConfirmationDialogComponent, {
      width: '300px',
      data: {
        title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}ing`,
        message: `Are you sure you want to ${action} this video?`,
        confirmText: 'Yes',
        cancelText: 'No'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._videoService.updateVideoListing(video._id, newListingStatus)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              video.isListed = newListingStatus;
              //console.log(`Video ${video._id} ${video.isListed ? 'listed' : 'unlisted'} successfully`);
              this.loadAllVideos();
              this.loadChannelData();
            },
            error: (error: any) => {
              console.error('Error updating video listing status:', error);
            }
          });
      }
    });
  }

  deleteVideo(videoId: string) {
    const dialogRef = this._dialog.open(DeleteConfirmationDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._videoService.deleteVideo(videoId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.videos = this.videos.filter(v => v._id !== videoId);
              this.showError("Video deleted successfully");
            },
            error: () => {
              this.showError("Error while deleting video");            }
          });
      }
    });
  }

  showError(errorMessage: string) {
    this._dialog.open(ErrorDialogComponent, {
      data: { message: errorMessage },
      width: '300px'
    });
  }

  saveVideoChanges() {
    const trimmedTitle = this.editingVideo.title.trim();
    const trimmedDescription = this.editingVideo.description.trim();
    const trimmedCategory = this.editingVideo.category?.trim() || '';
    this.titleError = '';
    this.descriptionError = '';
    this.categoryError = '';
  
    if (!trimmedTitle) {
      this.titleError = 'Title is required.';
    }
    if (!trimmedDescription) {
      this.descriptionError = 'Description is required.';
    }
    if (!trimmedCategory) {
      this.categoryError = 'Category is required.';
    }
    if (this.titleError || this.descriptionError || this.categoryError) {
      return;
    }
    const updateData = {
      videoId: this.editingVideo.videoId,
      title: trimmedTitle,
      description: trimmedDescription,
      category: trimmedCategory
    };
  
    this._videoService.updateVideo(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showError("Video updated successfully");
          const index = this.videos.findIndex(v => v._id === this.editingVideo.videoId);
          if (index !== -1) {
            this.videos[index] = { ...this.videos[index], ...updateData };
          }
          this.closeEditModal();
        },
        error: (error) => {
          console.error('Error updating video', error);
          alert('Failed to update video. Please try again.');
        }
      });
  }


  
}
