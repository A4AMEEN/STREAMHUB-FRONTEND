import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { channelService } from '../../services/channel.service';
import { VideoService } from '../../services/video.service';
import { Router } from '@angular/router';
import { interval, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Channel, ChannelData, navVideo, Video } from '../Types/channelTypes';
import { video, videoTrack } from '../Types/videoTypes';
import { formatDistanceToNow } from 'date-fns';
import { user } from '../Types/userTypes';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})

export class LandingComponent implements OnInit, OnDestroy {
  user!: user
  
  userId: string = ''
  out: string = '';
  videos: video[] = [];
  categories: { name: string }[] = [];
  allChannels:any[] = [];
  liveChannels:any[] = [];
  isSidebarExpanded: boolean = false;
  channels: { name: string, _id: string }[] = [];
  channelProfilePic = '/assets/images/Screenshot (204).png';
  private destroy$ = new Subject<void>();
  filteredVideos: Video[] = [];
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  allVideos: Video[] = [];
  selectedCategory: string = 'All';
  channel: ChannelData ={
    _id: '',
    name: '',
    profilePic: '',
    subscribers: 0,
    isRestricted: false,
    bannerImage: ''
  };


  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _videoService: VideoService,
    private _categoryService: CategoryService,
    private changeDetectorRef: ChangeDetectorRef,
    private _channelService: channelService
  ) { }

  ngOnInit(): void {
    const userData = this._authService.getUserData();
    
    
    if (userData) {
      this.userId = userData._id
      this.user = { username: userData.username, id: userData.id,profilePic:userData.profilePic };
      console.log("this.userdata is ", this.user);
    }
    console.log("this.userdata is ", this.user);
    this.loadCategories();
    this.loadAllVideos();
    this. loadChannels()
    this.loadChannelData()
    interval(60000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateTimeAgo();
    });
  }
  updateTimeAgo() {
    this.videos = this.videos.map(video => ({
      ...video,
      timeAgo: formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })
    }));
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllVideos(): void {
    const userId = this.userId;
    console.log("user", userId);

    this._videoService.getAllVideos(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Raw response:', response);
          if (response && Array.isArray(response.videos)) {
            this.allVideos = response.videos
              .filter((video: Video) => this.canUserViewVideo(video))
              .map(this.mapVideoData);
            this.calculateVideoDurations();
            this.applyFilters();
          } else {
            console.error('Unexpected response format:', response);
          }
        },
        error: (error) => {
          console.error('Error loading videos:', error);
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
              isRestricted: channelData.channel.isRestricted || false,
              
            };
          } else {
            console.error('Channel data not found');
          }
        },
        error: (error: any) => {
          console.error('Error fetching channel data:', error);
        }
      });
  }

  mapVideoData(video: Video) {
    return {
      _id: video._id,
      thumbnailUrl: video.thumbnail || '/assets/images/Screenshot (204).png',
      title: video.name,
      category: video.category,
      likes: video.likes,
      createdAt: video.createdAt,
      disLikes: video.dislikes,
      channelName: video.channelName,
      profilePic: video.profilePic,
      description: video.description,
      channelId: video.channelId,
      views: `${video.views} views`,
      timeAgo: formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }),
      url: video.url,
      isListed: video.isListed,
      isPremiumSubscriber: video.isPremiumSubscriber,
      duration: '00:00' // This will be updated in calculateVideoDurations
    };
  }

  calculateVideoDurations() {
    this.allVideos.forEach(video => {
      const videoElement = document.createElement('video');
      videoElement.src = video.url;

      videoElement.addEventListener('loadedmetadata', () => {
        const duration = videoElement.duration;
        video.duration = this.formatDuration(duration);
        // Trigger change detection if needed
        // this.changeDetectorRef.detectChanges();
      });
    });
  }

  private loadChannels(): void {
    this._channelService.getAllChannels().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.allChannels = response.showChannels;
        this.liveChannels = this.allChannels.filter(channel => channel.liveId && channel.liveId !== "");
        console.log("Live channels:", this.liveChannels);
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => console.error('Error loading channels:', error)
    });
  }
  trackByChannelId(index: number, channel: Channel): string {
    return channel._id;
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

  navigateToLiveStream(channel: Channel): void {
    if (channel.liveId) {
      // Navigate to the live stream URL
      window.location.href = channel.liveId;
    }
  }


  canUserViewVideo(video: Video):boolean {
    return video.isListed || video.isPremiumSubscriber;
  }

  trackByVideoId(index: number, video: Video): string {
    return video._id;
  }

  // trackByVideoId(index: number, video: videoTrack): string {
  //   return video._id;
  // }

  loadCategories() {
    this._categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories: { name: string; _id: string }[]) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error fetching categories:', error);
        }
      });
  }

  setChannelProfilePic(video: Video): string {
    if (video && video.profilePic) {
      return video.profilePic;
    } else {
      // Return the default image if no profile pic is available
      return '../../../assets/images/download (1).png';
    }
  }
  setLChannelProfilePic(video: Channel): string {
    console.log("lprofilpic",video);
    
    
      // return `'http://localhost:5000/assets/images/Screenshot (204).png'`;
      
   

      // Return the default image if no profile pic is available
      return '../../../assets/images/download (4).jpeg';
    
  }
  setLLChannelProfilePic(video: Channel): string {
    console.log("lprofilpic",video);
    
    
      // return `'http://localhost:5000/assets/images/Screenshot (204).png'`;
      
   

      // Return the default image if no profile pic is available
      return '../../../assets/images/download.png';
    
  }

  setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  // onSearchChange(searchTerm: string) {
  //   this.searchSubject.next(searchTerm);
  // }

  search() {
    this.performSearch(this.searchTerm);
  }

  performSearch(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.filteredVideos = [...this.videos];
    } else {
      const lowerCaseSearch = searchTerm.toLowerCase();
      this.filteredVideos = this.videos.filter(video =>
        video.title.toLowerCase().includes(lowerCaseSearch) ||
        video.channelName.toLowerCase().includes(lowerCaseSearch) ||
        video.description.toLowerCase().includes(lowerCaseSearch)
      );
    }
  }

  filterByCategory(categoryName: string) {
    this.selectedCategory = categoryName;
    console.log("Selected category:", this.selectedCategory);
    this.applyFilters();
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredVideos = this.allVideos.filter(video => {
      const categoryMatch = this.selectedCategory === 'All' ||
        (video.category &&
          video.category.name &&
          video.category.name.toLowerCase() === this.selectedCategory.toLowerCase());

      const searchMatch = this.searchTerm === '' ||
        (video.title && video.title.toLowerCase().includes(this.searchTerm.toLowerCase()));

      return categoryMatch && searchMatch;
    });

    console.log("Filtered videos:", this.filteredVideos);
  }
  logout(): void {
    console.log('Logging out');
    this.out = 'OUT';
    this._authService.logout();
    this._router.navigate(['/auth/login']);
  }

  goLive() {
    this._router.navigate(['/user/live-stream']);
  }

  navigateToLogin(): void {
    // Add your navigation logic here if needed
  }

  toggleSidebar(): void {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  navigateToVideo(video: Video) {
    const videoId = video._id || 'default';
    console.log("vdatafo name", video);

    // Prepare video data, excluding isPrivate and isListed
    const videoData = {
      _id: video._id,
      url: video.url,
      category: video.category?._id,
      channelName: video.channelName,
      channelId: video.channelId,
      views: video.views,
      likes: video.likes,
      disLikes: video.dislikes,
      name: video.title,
      description: video.description || '',
      thumbnail: video.thumbnail
    };
    console.log("vdatafo dataass", videoData)


    if (this.user) {
      this._videoService.addToWatchHistory(videoId).subscribe({
        next: () => console.log("Added to watch history"),
        error: (error) => console.error("Error adding to watch history", error)
      });
    }

    // Fetch channel data
    this._channelService.getChannelById(video.channelId).subscribe({
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
