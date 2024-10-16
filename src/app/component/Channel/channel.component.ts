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
import { Channel, ChannelData, editPlaylist, editShorts, navVid, PlayList, Playlist, updateVideo, Video } from '../Types/channelTypes';
import { CurrentVideo, Shorts } from '../Types/videoTypes';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit, OnDestroy {

  navigateToPlaylist(_t120: Playlist) {
    throw new Error('Method not implemented.');
  }

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('bannerInput') bannerInput!: ElementRef;
  showCreatePlaylistModal = false;
  newPlaylist = {
    name: '',
    description: '',
    category: '',
    isPublic: true,
    thumbnail: null as File | null
  };
  thumbnailPreview: string | null = null;
  channel: ChannelData = {
    _id: '',
    name: '',
    profilePic: '',
    subscribers: 0,
    isRestricted: false,
    bannerImage: ''
  };
  isEditingName = false;
  newChannelName: string = '';
  categories: { name: string, _id: string }[] = [];
  showUploadModal = false;
  newVideo = {
    name: '',
    description: '',
    category: '',
    file: null as File | null,
  };

  showShortsUploadModal = false;
  newShort = {
    name: '',
    description: '',
    category: '',
    file: null as File | null,
  };

  editingShort: editShorts = {
    _id: '',
    title: '',
    category: '',
    thumbnail: '',
    name: '',
    views: 0,
    url: ''
  };
  showEditShortModal: boolean = false;
  shortTitleError: string = '';
  shortCategoryError: string = '';
  isUploading = false;
  showEditModal = false;
  editingVideo: updateVideo = {
    videoId: '',
    title: '',
    description: '',
    category: ''
  };
  videos: Video[] = [];
  titleError: string = '';
  descriptionError: string = '';
  categoryError: string = '';
  playlists: Playlist[] = [];
  showVideos = true;
  showAddVideoModal = false;
  selectedPlaylist: PlayList | null = null;
  playlistVideos: Video[] = [];
  showEditPlaylistModal = false;
  editingPlaylist: editPlaylist = {
    message: '',
    _id: '',
    name: '',
    description: '',
    thumbnail: '',
    videos: [],
    createdAt: '',
    isPublic: false,
    category: ''
  };
  newThumbnail: File | null = null;
  shorts: Shorts[] = [];
  activeContentType: 'videos' | 'playlists' | 'shorts' = 'videos';

  private destroy$ = new Subject<void>();

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
          console.log("Fetched categories:", this.categories);
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
            console.log('Raw response:', response);
            if (response && Array.isArray(response.videos)) {
              this.videos = response.videos.map((video) => ({
                _id: video._id || '',
                thumbnailUrl: video.thumbnail || '/assets/images/Screenshot (204).png',
                title: video.name || 'No Title',
                description: video.description || 'No Description',
                category: video.category ? video.category._id : 'No Category',
                channelName: video.channelName || 'Unknown Channel',
                channelId: video.channelId || '',
                likes: video.likes || [],
                disLikes: video.dislikes || [],
                views: `${video.views || 0} views`,
                timeAgo: this.calculateTimeAgo(video.createdAt),
                url: video.url || '',
                isListed: video.isListed !== undefined ? video.isListed : false,
                duration: '00:00' // Default duration, will be updated
              }));
              console.log('Processed videos:', this.videos);
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


  loadAllPlaylists(): void {
    if (this.channel && this.channel._id) {
      this._channelService.getChannelPlaylists(this.channel._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: { playlists: any[] }) => {
            console.log("listPlaylit", response.playlists);

            if (response && Array.isArray(response.playlists)) {
              // Use arrow function to preserve 'this' context
              this.playlists = response.playlists.map((playlist) => this.mapPlaylistData(playlist));
              console.log("Mapped playlists", this.playlists);
            } else {
              console.error('Unexpected response format:', response);
            }
            console.log("Mapped playlists", this.playlists);
          },
          error: (error) => {
            console.error('Error loading playlists:', error);
          }
        });
    }
  }

  mapVideoData(video: CurrentVideo): Video {
    return {
      _id: video._id || '',
      thumbnail: video.thumbnail || '/assets/images/Screenshot (204).png',
      title: video.name || 'No Title',
      description: video.description || 'No Description',
      category: video.category ? video.category._id : 'No Category',
      channelName: video.channelName || 'Unknown Channel',
      channelId: video.channelId || '',
      likes: video.likes || [],
      dislikes: video.dislikes || [],
      views: `${video.views || 0} views`,
      timeAgo: this.calculateTimeAgo,
      url: video.url || '',
      isListed: video.isListed !== undefined ? video.isListed : false
    };
  }



  mapPlaylistData(playlist: Playlist): Playlist {
    return {
      _id: playlist._id,
      thumbnail: playlist.thumbnail || '/assets/images/default-playlist.png',
      name: playlist.name || 'Untitled Playlist',
      title: playlist.title || playlist.name || 'Untitled Playlist',
      description: playlist.description || 'No Description',
      videos: playlist.videos || [],
      createdAt: playlist.createdAt || new Date().toISOString(),
      isPublic: playlist.isPublic !== undefined ? playlist.isPublic : true,
      channelId: playlist.channelId || playlist.creatorId || '',
      channelName: playlist.channelName || playlist.creatorName || 'Unknown Creator',
      views: playlist.views || 0,
      url: playlist.url || '',
      creatorId: playlist.creatorId || playlist.channelId || '',
      creatorName: playlist.creatorName || playlist.channelName || 'Unknown Creator',
      isOwnedByUser: playlist.isOwnedByUser || false,
      category: playlist.category,
      message: playlist.message
    };
  }

  calculateTimeAgo(createdAt: string): string {
    return '10:10';
  }


  trackByVideoId(index: number, video: Video): string {
    return video._id;
  }

  trackByPlaylistId(index: number, playlist: Playlist): string {
    return playlist._id;
  }
  trackByShortId(index: number, shorts: Shorts): string {
    return shorts._id;
  }

  toggleContent(): void {
    this.showVideos = !this.showVideos;
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
              console.log(`Video ${video._id} ${video.isListed ? 'listed' : 'unlisted'} successfully`);
              this.loadAllVideos();
              this.loadChannelData();
            },
            error: (error) => {
              console.error('Error updating video listing status:', error);
            }
          });
      }
    });
  }

  loadChannelData(): void {
    this._channelService.getChannelData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channelData: Channel) => {
          console.log("Fetched channel data", channelData);
          if (channelData && channelData.channel) {
            this.channel = {
              _id: channelData.channel._id,
              name: channelData.channel.channelName || 'Channel Name',
              profilePic: channelData.channel.profilePic || '../../../assets/images/download (1).png',
              bannerImage: channelData.channel.banner || '/assets/images/Screenshot (204).png',
              subscribers: channelData.channel.subscribers?.length || 0,
              isRestricted: channelData.channel.isRestricted || false
            };
            this.loadAllVideos();
            this.loadAllPlaylists();
            this.loadAllShorts();
          } else {
            console.error('Channel data not found');
          }
        },
        error: (error: any) => {
          console.error('Error fetching channel data:', error);
        }
      });
  }

  toggleEditName() {
    this.isEditingName = !this.isEditingName;
    if (this.isEditingName) {
      if (this.channel.name) {

        this.newChannelName = this.channel.name;
      }
    }
  }
  setActiveContentType(type: 'videos' | 'playlists' | 'shorts'): void {
    this.activeContentType = type;
  }

  updateChannelName() {
    if (this.newChannelName && this.newChannelName !== this.channel.name) {
      this._channelService.updateChannelName(this.channel._id, this.newChannelName)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: Channel) => {
            this.channel.name = response.channelName;
            this.isEditingName = false;
            this.loadChannelData();
          },
          error: (error: string) => {
            console.error('Error updating channel name:', error);
          }
        });
    } else {
      this.isEditingName = false;
    }
  }
  showPlaylistVideos(playlist: any) {
    this.selectedPlaylist = playlist;
    this._videoService.getPlaylistVideos(playlist._id, this.channel._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (videosData: any) => {
          if (videosData && videosData.videos && Array.isArray(videosData.videos)) {
            this.playlistVideos = videosData.videos.map((video: any) => ({
              ...video,
              duration: this.getVideoDuration(video.url),
              timeAgo: this.getTimeAgo(video._id) // Mock or calculate based on video creation date
            }));
          } else {
            console.error("Invalid response format: 'videos' property missing or not an array");
          }
        },
        error: (error) => {
          console.error('Error fetching playlist videos:', error);
        }
      });
  }

  loadAllShorts(): void {
    this._channelService.getChannelShorts(this.channel._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        if (response && Array.isArray(response.videos)) {
          this.shorts = response.videos
            .map(this.mapShortData);
          console.log("Shorts of channel", this.shorts);
        } else {
          console.error('Unexpected response format:', response);
        }
      }, error => {
        console.error('Error loading shorts:', error);
      });
  }
  mapShortData(video: any): any {
    return {
      _id: video._id || '',
      title: video.name || 'No Title',
      url: video.url || '',
      duration: video.duration || '00:00',
      views: video.views || 0,
      isListed: video.isListed !== undefined ? video.isListed : false
    };
  }
  getVideoDuration(url: string): string {
    // You can implement actual logic to fetch video metadata for duration or mock it for now
    return '3:45'; // Example mock duration
  }

  getTimeAgo(videoId: string): string {
    // Implement logic to calculate how long ago the video was added
    return '2 days ago'; // Example mock time ago
  }

  loadPlaylistVideos(playlist: Playlist) {
    this.playlistVideos = [];
    playlist.videos.forEach(videoId => {
      this._videoService.getVideoById(videoId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (videoData) => {
            const mappedVideo = this.mapVideoData(videoData);
            this.playlistVideos.push(mappedVideo);
            console.log("after fetching the videoData", videoData);
            console.log("after fetching the playlsitvideo", mappedVideo);

          },
          error: (error) => {
            console.error(`Error loading video ${videoId}:`, error);
          }
        });
    });
  }

  closePlaylistVideos() {
    this.selectedPlaylist = null;
    this.playlistVideos = [];
  }

  toggleEditProfilePic() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file: File | null = input.files?.[0] || null;
    console.log("filess", file);
    if (file) {
      this.updateProfilePic(file);
    }
  }

  onFileSelectedD(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file: File = input.files[0];
      this.newVideo.file = file;
    }
  }

  updateProfilePic(file: File) {
    this._channelService.updateProfilePic(this.channel._id, file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: Channel) => {
          console.log("Full response:", response);
          if (response && response.channel && response.channel.profilePic) {
            this.channel.profilePic = response.channel.profilePic;

            this.showError("Image updated successfully");
          } else {
            console.error('Invalid response format:', response);
          }
        },
        error: (error) => {
          console.error('Error updating profile picture:', error);
        }
      });
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;

    if (imgElement) {
      console.error('Error loading image:', event);
      imgElement.src = '/assets/images/Screenshot (204).png';
    }
  }

  openUploadModal() {
    this.showUploadModal = true;
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.newVideo = {
      name: '',
      description: '',
      category: '',
      file: null,
    };
  }


  uploadVideo() {
    if (!this.newVideo.file || !this.newVideo.name || !this.newVideo.category) {
      this.showError('Please fill in all required fields and select a video file.');
      return;
    }

    const channelId = this.channel?._id;
    if (!channelId) {
      this.showError('Channel ID is missing. Please try again or refresh the page.');
      return;
    }

    this.isUploading = true;

    this._videoService.uploadVideo(this.newVideo, channelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: Video) => {
          this.showError("Video uploaded successfully");
          this.isUploading = false;
          this.closeUploadModal();
          this.loadChannelData(); // Refresh channel data
          this.showError('VIDEO UPLOADED SUCCES FULLY');
        },
        error: (error) => {
          this.showError(error.error.message);
          this.isUploading = false;
        }
      });
  }
  openAddVideoModal(playlist: any) {
    this.selectedPlaylist = playlist;
    this.showAddVideoModal = true;
  }

  closeAddVideoModal() {
    this.showAddVideoModal = false;
    this.selectedPlaylist = null;
    this.newVideo = {
      name: '',
      description: '',
      category: '',
      file: null,
    };
  }

  openEditPlaylistModal(playlist: editPlaylist) {
    // Ensure that properties like name and description are not undefined by assigning default values
    const updatedPlaylist: editPlaylist = {
      ...playlist,
      name: playlist.name ?? '', // If name is undefined, assign an empty string
      description: playlist.description ?? '',
      thumbnail: playlist.thumbnail ?? '',
      category: playlist.category ?? '',
      videos: playlist.videos ?? [],
      createdAt: playlist.createdAt ?? '',
      isPublic: playlist.isPublic ?? false,
      _id: playlist._id,
      message: playlist.message ?? ''
    };

    this.editingPlaylist = updatedPlaylist;
    this.showEditPlaylistModal = true;
  }



  closeEditPlaylistModal() {
    this.showEditPlaylistModal = false;
    this.editingPlaylist = {
      message: '',
      _id: '',
      name: '',
      description: '',
      thumbnail: '',
      videos: [],
      createdAt: '',
      isPublic: false,
      category: ''
    };
    this.newThumbnail = null;
  }

  savePlaylistChanges() {
    if (!this.editingPlaylist.name) {
      this.showError('Playlist name is required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.editingPlaylist.name);
    formData.append('description', this.editingPlaylist.description || '');
    formData.append('playlistId', this.editingPlaylist._id);

    if (this.newThumbnail) {
      formData.append('thumbnail', this.newThumbnail);
    }

    this._videoService.updatePlaylist(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PlayList) => {
          this.showError("Playlist updated successfully");
          this.closeEditPlaylistModal();
          this.loadAllPlaylists(); // Refresh playlist data
        },
        error: (error) => {
          this.showError(error.error.message || 'Error updating playlist');
        }
      });
  }

  deletePlaylist(playlistId: string) {
    if (confirm('Are you sure you want to delete this playlist?')) {
      this._videoService.deletePlaylist(playlistId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.showError("Playlist deleted successfully");
            this.loadAllPlaylists();
          },
          error: (error) => {
            this.showError(error.error.message || 'Error deleting playlist');
          }
        });
    }
  }

  deleteShort(shortId: string) {
    const dialogRef = this._dialog.open(DeleteConfirmationDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._videoService.deleteShorts(shortId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.shorts = this.shorts.filter(v => v._id !== shortId);
              this.showError("Video deleted successfully");
            },
            error: () => {
              this.showError("Error while deleting video");
              this.showError("Error while deleting video");
            }
          });
      }
    });
  }

  togglePlaylistVisibility(playlist: Playlist) {
    this._videoService.togglePlaylistVisibility(playlist._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log(response.message);
          playlist.isPublic = !playlist.isPublic;
        },
        error: (error) => {
          console.error('Error toggling playlist visibility:', error);
          this.showError('Failed to update playlist visibility. Please try again.');
        }
      });
  }



  uploadVideoToPlaylist() {
    if (!this.newVideo.file || !this.newVideo.name) {
      this.showError('Please fill in all required fields and select a video file.');
      return;
    }

    const channelId = this.channel?._id;
    if (!channelId) {
      this.showError('Channel ID is missing. Please try again or refresh the page.');
      return;
    }

    this.isUploading = true;
    if (this.selectedPlaylist) {
      this._videoService.uploadVideoToPlaylist(this.newVideo, channelId, this.selectedPlaylist._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.showError("Video uploaded successfully to playlist");
            this.isUploading = false;
            this.closeAddVideoModal();
            this.loadAllPlaylists();
          },
          error: (error) => {
            this.showError(error.error.message || "error while operation");
            this.isUploading = false;
          }

        });
    }
    else {
      this.showError("No playlist selected.");
    }
  }

  onFileSelectedd(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.newVideo.file = file;
    }
  }



  openCreatePlaylistModal() {
    this.showCreatePlaylistModal = true;
  }

  closeCreatePlaylistModal() {
    this.showCreatePlaylistModal = false;
    this.newPlaylist = {
      name: '',
      description: '',
      category: '',
      isPublic: true,
      thumbnail: null
    };
    this.thumbnailPreview = null;
  }

  onThumbnailSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.newPlaylist.thumbnail = file;

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.thumbnailPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }


  openShortsUploadModal() {
    this.showShortsUploadModal = true;
  }

  closeShortsUploadModal() {
    this.showShortsUploadModal = false;
    this.newShort = {
      name: '',
      description: '',
      category: '',
      file: null,
    };
  }
  onShortSelectedd(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; // Optional chaining to handle the case where files might be undefined

    if (file) {
      this.newShort.file = file;
    }
  }


  uploadShort() {
    if (!this.newShort.file || !this.newShort.name || !this.newShort.category) {
      console.log("the shhort console", this.newShort.name, this.newShort.category);

      this.showError('Please fill in all required fields and select a video file.');
      return;
    }

    const channelId = this.channel?._id;
    if (!channelId) {
      this.showError('Channel ID is missing. Please try again or refresh the page.');
      return;
    }
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      if (video.duration > 60) {
        this.showError('Shorts must be 60 seconds or less. Please select a shorter video.');
        return;
      }
      this.isUploading = true;
      this._videoService.uploadShort(this.newShort, channelId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.showError("Short uploaded successfully");
            this.isUploading = false;
            this.closeShortsUploadModal();
            this.loadChannelData();
            this.showError(response.message || "success");
          },
          error: (error) => {
            this.showError(error.error.message);
            this.isUploading = false;
          }
        });
    };
    video.src = URL.createObjectURL(this.newShort.file);
  }

  onThumbnailSelectedd(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.newThumbnail = file;
    }
  }

  createPlaylist() {
    if (!this.newPlaylist.name) {
      this.showError('Please enter a playlist name.');
      return;
    }

    const channelId = this.channel?._id;
    if (!channelId) {
      this.showError('Channel ID is missing. Please try again or refresh the page.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.newPlaylist.name);
    formData.append('description', this.newPlaylist.description);
    formData.append('category', this.newPlaylist.category); // Add selected category
    formData.append('isPublic', this.newPlaylist.isPublic.toString());
    formData.append('channelId', channelId);
    if (this.newPlaylist.thumbnail) {
      formData.append('thumbnail', this.newPlaylist.thumbnail);
    }

    this._videoService.createPlaylist(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showError('Playlist created successfully');
          this.closeCreatePlaylistModal();
          this.loadChannelData();
        },
        error: (error) => {
          this.showError(error.error.message || 'An error occurred while creating the playlist');
        }
      });
  }


  toggleEditBanner() {
    this.bannerInput.nativeElement.click();
  }

  onBannerSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.updateBanner(file);
    }
  }


  updateBanner(file: File) {
    this._channelService.updateBanner(this.channel._id, file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: { bannerImage: string; }) => {
          this.showError("Banner updated successfully");
          this.channel.bannerImage = response.bannerImage;
        },
        error: (error) => {
          console.error('Error updating banner', error);
        }
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
    const updateData: updateVideo = {
      videoId: this.editingVideo.videoId,           // Use _id instead of videoId
      title: trimmedTitle,
      description: trimmedDescription,
      category: trimmedCategory,
    };
    console.log("updated ", updateData)

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
          this.showError('Failed to update video. Please try again.');
        }
      });
  }


  openEditModal(video: Video) {
    this.editingVideo = {
      videoId: video._id,
      title: video.title || '',
      description: video.description || '',
      category: video.category || '',
    };
    this.showEditModal = true;
  }



  closeEditModal() {
    this.showEditModal = false;
  }

  saveShortChanges() {
    const trimmedTitle = this.editingShort.title?.trim() ?? '';
    const trimmedCategory = this.editingShort.category?.trim() ?? '';

    this.shortTitleError = '';
    this.shortCategoryError = '';


    if (!trimmedTitle) {
      this.shortTitleError = 'Title is required.';
    }
    if (!trimmedCategory) {
      this.shortCategoryError = 'Category is required.';
    }
    if (this.shortTitleError || this.shortCategoryError) {
      return;
    }
    const updateData = {
      videoId: this.editingShort._id,
      title: trimmedTitle,
      category: trimmedCategory
    };

    this._videoService.updateShorts(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log("Short updated successfully", response);
          const index = this.shorts.findIndex(s => s._id === this.editingShort._id);
          if (index !== -1) {
            this.shorts[index] = { ...this.shorts[index], ...updateData };
          }
          this.closeEditShortModal();
        },
        error: (error) => {
          console.error('Error updating short', error);
          this.showError('Failed to update short. Please try again.');
        }
      });
  }

  openEditShortModal(short: Shorts) {
    this.editingShort = { ...short };
    this.showEditShortModal = true;
  }

  closeEditShortModal() {
    this.showEditShortModal = false;
    this.editingShort = {
      _id: '',
      thumbnail: '',
      name: '',
      title: '',      // Default value for optional properties
      category: '',
      likes: [],
      disLikes: [],
      channelId: '',
      channelName: '',
      profilePic: '',
      views: 0,
      url: '',
      duration: ''    // Optional property
    };
    this.shortTitleError = '';
    this.shortCategoryError = '';
  }

  toggleShortListing(_t163: any) {
    throw new Error('Method not implemented.');
  }
  navigateToShort(_t163: any) {
    throw new Error('Method not implemented.');
  }
  onThumbnailChange($event: Event) {
    throw new Error('Method not implemented.');
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
              this.showError("Error while deleting video");
            }
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
}
