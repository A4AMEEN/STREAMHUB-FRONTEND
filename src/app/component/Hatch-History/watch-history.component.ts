import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VideoService } from '../../services/video.service';
import { navVideo, Video } from '../Types/channelTypes';
import { channelService } from '../../services/channel.service';
import { AuthService } from '../../services/auth.service';
import { WatchHistory, WatchHistoryResponse } from '../Types/videoTypes';

@Component({
  selector: 'app-watch-history',
  templateUrl: './watch-history.component.html',
  styleUrl: './watch-history.component.css'
})
export class WatchHistoryComponent implements OnInit {
  watchHistory: WatchHistory[] = [];
  user: any;

  constructor(private _videoService: VideoService,private _authService:AuthService, private _router: Router,private _channelService:channelService) {}

  ngOnInit() {
    const userData = this._authService.getUserData();
    if (userData) {
      //console.log("this.userdata is ", userData);
      this.user = { name: userData.username };
    }
    this.loadWatchHistory();
  }

  loadWatchHistory() {
    this._videoService.getWatchHistory().subscribe({
      next: (response: WatchHistoryResponse) => {
        if (response && Array.isArray(response.watchHistory)) {
          //console.log("history", response.watchHistory);

          this.watchHistory = response.watchHistory;
        } else {
          console.error('Unexpected response format:', response);
          this.watchHistory = [];
        }
      },
      error: (error) => console.error('Error loading watch history:', error)
    });
  }

  navigateToVideo(video: Video) {
    const videoId = video._id || 'default';
    //console.log("vdatafo name", video);
  
    // Prepare video data, excluding isPrivate and isListed
    const videoData = {
      _id: video._id,
      url: video.url,
      category: video.category,
      channelName: video.channelName,
      channelId: video.channelId,
      views: video.views,
      likes: video.likes,
      disLikes: video.dislikes,
      name: video.title,
      description: video.description || '',
      thumbnail: video.thumbnail
    };
    
  
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

  setChannelProfilePic(video: any) {
    // Your existing logic to set channel profile picture
    // Make sure this returns a valid URL or a default image URL
    return video.channelProfilePic || 'path/to/default/image.png';
  }

  getVideoDuration(video: any): string {
    // Implement this method to return the video duration
    // If you don't have this data, you can return an empty string or remove this method call from the template
    return video.duration || '';
  }

  getVideoTimeAgo(video: any): string {
    // Implement this method to return how long ago the video was watched
    // If you don't have this data, you can return an empty string or remove this method call from the template
    return video.timeAgo || '';
  }

  getVideoWatchedOn(video: any): Date | null {
    // Implement this method to return the date the video was watched
    // If you don't have this data, you can return null or remove this method call from the template
    return video.watchedOn ? new Date(video.watchedOn) : null;
  }
}