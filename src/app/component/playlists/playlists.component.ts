
import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { channelService } from '../../services/channel.service';
import { CategoryService } from '../../services/category.service';
import { VideoService } from '../../services/video.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Channel, ChannelData, MappedPlaylist, Video } from '../Types/channelTypes';
import { Playlist, PlaylistsResponse, video, VideoData } from '../Types/videoTypes';
import { user } from '../Types/userTypes';
import { PlayList } from '../Types/channelTypes';
import { Playlists, PlaylistVideosResponse, } from '../Types/categoryTypes';
@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrl: './playlists.component.css'
})
export class PlaylistsComponent implements OnInit, OnDestroy {
  searchPlaylists() {
    throw new Error('Method not implemented.');
  }

  logout(): void {
    //console.log('Logging out');
    this.out = 'OUT';
    this._authService.logout();
    this._router.navigate(['/auth/login']);
  }

  onThumbnailChange($event: Event) {
    throw new Error('Method not implemented.');
  }

  deletePlaylist(arg0: string) {
    throw new Error('Method not implemented.');
  }
  openEditPlaylistModal(_t120: Playlist) {
    throw new Error('Method not implemented.');
  }
  navigateToPlaylist(_t120: Playlist) {
    throw new Error('Method not implemented.');
  }
  togglePlaylistVisibility(_t120: Playlist) {
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

  channel: ChannelData ={
    _id: '',
    name: '',
    profilePic: '',
    subscribers: 0,
    isRestricted: false,
    bannerImage: ''
  };  isEditingName = false;
  showVideos: boolean = false;
  newChannelName = '';
  categories: { name: string, _id: string }[] = [];
  showUploadModal = false;
  newVideo = {
    name: '',
    description: '',
    category: '',
    file: null as File | null, 
  };
  showPlaylistPopup: boolean = false;

  videos: Video[] = [];
  titleError: string = '';
  descriptionError: string = '';
  categoryError: string = '';
  playlists: Playlist[] = [];
  showAddVideoModal = false;
  selectedPlaylist: PlayList | null = null;
  playlistVideos: VideoData[] = [];
  user: user = {
    username: '',
    id: '',
    profilePic:''
  };  out=''




  private destroy$ = new Subject<void>();

  constructor(
    private _authService: AuthService,
    private _channelService: channelService,
    private _categoryService: CategoryService,
    private _videoService: VideoService,
    private _router: Router,
    private _dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const userData = this._authService.getUserData();
    if (userData) {
      //console.log("this.userdata is ", userData);
      this.user = { username: userData.username, id: userData.id,profilePic:userData.profilePic };
    }
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
    this.fetchAllPlaylists()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllPlaylists(): void {
    if (this.channel && this.channel._id) {
      this._channelService.getChannelPlaylists(this.channel._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            //console.log("listPlaylit", response);
  
            if (response && Array.isArray(response.playlists)) {
              this.playlists = response.playlists
                .filter(playlist => playlist.videos && playlist.videos.length > 0)
                .map(playlist => ({
                  ...playlist,
                  videoCount: playlist.videos.length
                }));
              //console.log("Filtered and mapped playlists", this.playlists);
            } else {
              console.error('Unexpected response format:', response);
            }
          },
          error: (error) => {
            console.error('Error loading playlists:', error);
          }
        });
    }
  }
  
  // Assuming this method exists or needs to be added
  private mapPlaylistData(playlist: any): Playlists {
    return {
      ...playlist,
      videos: playlist.videos || [],
      // Add any other necessary mapping logic here
    };
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
            // this.loadAllPlaylists()
          } else {
            console.error('Channel data not found');
          }
        },
        error: (error) => {
          console.error('Error fetching channel data:', error);
        }
      });
  }

 


  getVideoDuration(url: string): string {
    // You can implement actual logic to fetch video metadata for duration or mock it for now
    return '3:45'; // Example mock duration
  }

  getTimeAgo(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const differenceInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (differenceInSeconds < 60) {
      return `${differenceInSeconds} seconds ago`;
    } else if (differenceInSeconds < 3600) {
      const minutes = Math.floor(differenceInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (differenceInSeconds < 86400) {
      const hours = Math.floor(differenceInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (differenceInSeconds < 2592000) {
      const days = Math.floor(differenceInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (differenceInSeconds < 31536000) {
      const months = Math.floor(differenceInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(differenceInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
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
                timeAgo: this.calculateTimeAgo,
                url: video.url || '',
                isListed: video.isListed !== undefined ? video.isListed : false
              }));
              //console.log('Processed videos:', this.videos);
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

  openPlaylistPopup(playlist: Playlists) {
    this.selectedPlaylist = playlist;
    this._videoService.getPlaylistVideos(playlist._id, this.channel._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (videosData) => {
          //console.log("videoplaylistpopop0", videosData);

          if (videosData && videosData.videos && Array.isArray(videosData.videos)) {
            this.playlistVideos = videosData.videos.map((video: VideoData) => ({
              ...video,
              duration: this.getVideoDuration(video.url),
              timeAgo: this.getTimeAgo(video._id)
            }));
            this.showPlaylistPopup = true;
          } else {
            console.error("Invalid response format: 'videos' property missing or not an array");
          }
        },
        error: (error) => {
          console.error('Error fetching playlist videos:', error);
        }
      });
  }

  closePlaylistPopup() {
    this.showPlaylistPopup = false;
    this.selectedPlaylist = null;
    this.playlistVideos = [];
  }

  calculateTimeAgo(createdAt: string): string {
    // Implement logic to calculate time difference
    // For now, returning a placeholder
    return '10:10';
  }
  closePlaylistVideos() {
    this.showVideos = false;
    this.selectedPlaylist = null;
    this.playlistVideos = [];
  }
  navigateToVideo(video: Video) {
    //console.log("Playlist nav",video);
    
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
      thumbnail: video.thumbnailUrl
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


  fetchAllPlaylists() {
    this._videoService.getAllPlaylists()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PlaylistsResponse) => {
          if (response && response.playlists && Array.isArray(response.playlists)) {
            this.playlists = response.playlists.map((playlist: Playlist) => this.mapPlaylistData(playlist));
            //console.log("playlists all", response);
          } else {
            console.error("Invalid response format: 'playlists' property missing or not an array");
          }
        },
        error: (error) => {
          console.error('Error fetching playlists:', error);
        }
      });
  }

  // mapPlaylistData(playlist: Playlist): Playlist {
  //   return {
  //     _id: playlist._id || '',
  //     thumbnail: playlist.thumbnail || '/assets/images/default-playlist.png',
  //     name: playlist.name || 'Untitled Playlist',
  //     title: playlist.name || 'Untitled Playlist', // Using name as title
  //     description: playlist.description || 'No Description',
  //     videos: playlist.videos || [],
  //     createdAt: this.calculateTimeAgo(playlist.createdAt),
  //     isPublic: playlist.isPublic !== undefined ? playlist.isPublic : true,
  //     channelId: playlist.channelId || '',
  //     channelName: playlist.channelName || 'Unknown Creator',
  //     views: playlist.views || 0,
  //     url: playlist.url || '',
  //     creatorId: playlist.channelId || '',
  //     creatorName: playlist.channelName || 'Unknown Creator',
  //     isOwnedByUser: playlist.channelId === this.user.id||playlist.channelId !== this.user.id,
  //     category: playlist.category
  //   };
  // }


  trackByVideoId(index: number, video: Video): string {
    return video._id;
  }

  trackByPlaylistId(index: number, playlist: Playlist): string {
    return playlist._id;
  }
  backToPlaylists() {
    this.showVideos = false;
    this.selectedPlaylist = null;
    this.playlistVideos = [];
  }

}