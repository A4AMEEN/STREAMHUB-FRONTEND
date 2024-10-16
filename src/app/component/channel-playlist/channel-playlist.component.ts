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
  selector: 'app-channel-playlist',
  templateUrl: './channel-playlist.component.html',
  styleUrl: './channel-playlist.component.css'
})
export class ChannelPlaylistComponent implements OnInit, OnDestroy{
  navigateToPlaylist(_t120: Playlist) {
    throw new Error('Method not implemented.');
    }
    
      @ViewChild('fileInput') fileInput!: ElementRef;
      @ViewChild('bannerInput') bannerInput!: ElementRef;
      showCreatePlaylistModal = false;
      newPlaylist = {
        name: '',
        description: '',
        category:'',
        isPublic: true,
        thumbnail: null as File | null
      };
      thumbnailPreview: string | null = null;
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
      
      showShortsUploadModal = false;
      newShort = {
        name: '',
        description: '',
        category: '',
        file: null as File | null, 
      };
      
      editingShort:editShorts = {
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
    playlists: Playlist[] = [];
    showVideos = true;
    showAddVideoModal = false;
    selectedPlaylist: PlayList | null = null;
    playlistVideos: Video[] = [];
    showEditPlaylistModal = false;
    editingPlaylist: editPlaylist = {
      message:'',
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
    shorts: Shorts[]=[];
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
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }
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
              profilePic: channelData.channel.profilePic || '/assets/images/Screenshot (204).png',
              bannerImage: channelData.channel.banner || '/assets/images/Screenshot (204).png',
              subscribers: channelData.channel.subscribers?.length || 0,
              isRestricted: channelData.channel.isRestricted || false
            };
            this.loadAllPlaylists();
          } else {
            console.error('Channel data not found');
          }
        },
        error: (error: any) => {
          console.error('Error fetching channel data:', error);
        }
      });
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
   
  showPlaylistVideos(playlist: any) {
    this.selectedPlaylist = playlist;
    this._videoService.getPlaylistVideos(playlist._id, this.channel._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (videosData: any) => {
          console.log("after fetching the videoData", videosData);
  
          // Check if videosData has a 'videos' property before mapping
          if (videosData && videosData.videos && Array.isArray(videosData.videos)) {
            this.playlistVideos = videosData.videos.map((video: any) => ({
              ...video,
              duration: this.getVideoDuration(video.url), // Mock or fetch actual duration
              timeAgo: this.getTimeAgo(video._id) // Mock or calculate based on video creation date
            }));
          } else {
            console.error("Invalid response format: 'videos' property missing or not an array");
          }
  
          console.log("Processed playlistVideos", this.playlistVideos);
        },
        error: (error) => {
          console.error('Error fetching playlist videos:', error);
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

  getVideoDuration(url: string): string {
    return '3:45'; // Example mock duration
  }
  
  getTimeAgo(videoId: string): string {
    return '2 days ago'; // Example mock time ago
  }
  showError(errorMessage: string) {
    this._dialog.open(ErrorDialogComponent, {
      data: { message: errorMessage },
      width: '300px'
    });
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
  openAddVideoModal(playlist: any) {
    this.selectedPlaylist = playlist;
    this.showAddVideoModal = true;
  }
  trackByPlaylistId(index: number, playlist: Playlist): string {
    return playlist._id;
  }
  
  

    
}
