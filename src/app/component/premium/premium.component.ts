import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { channelService } from '../../services/channel.service';
import { VideoService } from '../../services/video.service';
import { Router } from '@angular/router';
import { interval, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {  Video } from '../Types/channelTypes';
import { video, VideoResponse } from '../Types/videoTypes';
import { formatDistanceToNow } from 'date-fns';
import { user } from '../Types/userTypes';
@Component({
  selector: 'app-premium',
  templateUrl: './premium.component.html',
  styleUrl: './premium.component.css'
})
export class PremiumComponent implements OnInit, OnDestroy {
  user!: user
  userId:string=''
  out='';
  videos: Video[] = [];
  categories: { name: string }[] = [];
  isSidebarExpanded: boolean = false;
  channels: { name: string, _id: string }[] = [];
  hasPremiumVideos: boolean = false;

  channelProfilePic = '/assets/images/Screenshot (204).png';
  private destroy$ = new Subject<void>();  // Subject to handle unsubscriptions

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _videoService: VideoService,
    private _categoryService: CategoryService,
    private _channelService: channelService
  ) {}

  ngOnInit(): void {
    const userData = this._authService.getUserData();
    if (userData) {
      this.userId=userData._id
      console.log("this.userdata is ", this.userId);
      this.user = { username: userData.username, id: userData.id,profilePic:userData.profilePic };
    }
    console.log("this.userdata is ", this.user);
    this.loadCategories();
    this.loadAllVideos();
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
    const userId = this.userId; // Ensure this.userId is defined somewhere in your component
    
    this._videoService.getAllVideos(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: VideoResponse) => {
          console.log('Raw response:', response);
          if (response && Array.isArray(response.videos)) {
            this.videos = response.videos
              .filter(video => video.isPremiumSubscriber)
              .map(video => ({
                _id: video._id,
                thumbnailUrl: video.thumbnail || '/assets/images/Screenshot (204).png',
                title: video.name,
                category: video.category,
                likes: video.likes,
                createdAt: video.createdAt,
                disLikes: video.disLikes,
                channelName: video.channelName,
                profilePic: video.profilePic,
                description: video.description,
                channelId: video.channelId,
                views: `${video.views} views`,
                timeAgo: formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }),
                url: video.url,
                isListed: video.isListed,
                isPremiumSubscriber: video.isPremiumSubscriber
              }));
            
            this.hasPremiumVideos = this.videos.length > 0;
          } else {
            console.error('Unexpected response format:', response);
            this.hasPremiumVideos = false;
          }
        },
        error: (error) => {
          console.error('Error loading videos:', error);
          this.hasPremiumVideos = false;
        }
      });
  }

  canUserViewVideo(video: Video): boolean {
    if(video.isListed ){
      if(video.isPremiumSubscriber){

        return video.isListed || video.isPremiumSubscriber;
      }

    }
    return false
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
        error: (error: any) => {
          console.error('Error fetching categories:', error);
        }
      });
  }

  setChannelProfilePic(video: Video): string {
    if (video && video.profilePic) {
      return video.profilePic;
    } else {
      // Return the default image if no profile pic is available
      return `'/assets/images/Screenshot (204).png'`;
    }
  }

  search(): void {
    console.log('Search button clicked');
  }

  logout(): void {
    console.log('Logging out');
    this.out = 'OUT';
    this._authService.logout();
    this._router.navigate(['/auth/login']);
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
    
  
    if(this.user){
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
        // Navigate with just prepared video data if channel data fetch fails
        this._router.navigate(['/user/video', videoId], {
          state: {
            videoData: videoData
          }
        });
      }
    });
  }
}
