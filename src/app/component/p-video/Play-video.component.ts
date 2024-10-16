import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VideoService } from '../../services/video.service';
import { environment } from '../../../env/environment';
import { channelService } from '../../services/channel.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../Reusables/error.component';
import { Subject, takeUntil } from 'rxjs';
import {  CurrentVideo, video, VideoCategory } from '../Types/videoTypes';
import { ChannelData, MinimalChannelData, navVideo } from '../Types/channelTypes';
import { User } from '../Types/userTypes';
import { Channel } from '../Types/channelTypes';
import { formatDistanceToNow } from 'date-fns';


@Component({
  selector: 'app-p-video',
  templateUrl: './p-video.component.html',
  styleUrl: './p-video.component.css'
})
export class PVideoComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  recommendedVideos: video[] | undefined;
  comments: any[] | undefined;
  newComment: string = '';
  user: User[] = [];
  isChannelOwner: boolean = false;
  isSubscribed: boolean = false;
  isLiked: boolean = false;
  isDisliked: boolean = false;
  currentVideo: CurrentVideo | null = null
  currentUserId!: string|null
  channelProfilePic: string = '/assets/images/Screenshot (204).png';
  channel!: Channel;
  subscriberCount: number=0;
  isDescriptionExpanded: boolean = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private channelService: channelService,
    private dialog: MatDialog,
    private videoService: VideoService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.currentVideo = navigation.extras.state['videoData'];
      // this.setChannelProfilePic();
      if(this.currentVideo){
        this.checkIfChannelOwner()
        this.loadVideoData(this.currentVideo._id);
        //console.log("Navigation data:", this.currentVideo);
        this.loadChannelData(this.currentVideo.channelId);
        this.loadRecommendedVideos(this.currentVideo.category,this.currentVideo._id)
      }

 
      
    }
  }
// poda potta 
  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    if(this.currentVideo){
      this.loadChannelData(this.currentVideo.channelId);
      //console.log(",maxxewell", this.currentVideo._id);
      this.loadVideoData(this.currentVideo._id);
      this.incrementViewCount(this.currentVideo._id);
      this.loadComments(this.currentVideo._id);
      this.loadRecommendedVideos(this.currentVideo.category._id,this.currentVideo._id);

      //console.log("Navigation data:sample", this.currentVideo.category._id);
    }

    this.currentUserId = this.authService.getCurrentUserId();
   

    this.checkSubscriptionStatus();

    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const videoId = params.get('id');
      if (videoId) {
        if (!this.currentVideo) {
          // If we don't have the video data from navigation state, fetch it
          this.loadVideoData(videoId);
          this.checkLikeStatus(videoId);
        } else {
          this.loadChannelData(this.currentVideo.channelId);
          this.setChannelProfilePic();
          this.checkLikeStatus(videoId);
        }
      } else {
        // Handle error - no video ID provided
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChannelData(channelId: string): void {
    this.channelService.getChannelById(channelId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (channelData) => {
        this.channel = channelData.channel;
        this.subscriberCount = channelData.channel.subscribers.length;
        //console.log("Loaded channel data", this.channel);
        this.checkSubscriptionStatus();
        this.setChannelProfilePic();
        this.checkIfChannelOwner()
        //console.log("the datssz", this.channel.profilePic);
      },
      error: (error) => {
        console.error("Error loading channel data", error);
      }
    });
  }

  checkIfChannelOwner(): void {
    //console.log('Subscription successful');
    if (this.channel && this.currentUserId) {
      this.isChannelOwner = this.channel.user === this.currentUserId;
      //console.log('Subscription successful', this.isChannelOwner);
    }
  }

  checkSubscriptionStatus(): void {
    if (!this.channel || !this.currentUserId) return;

    this.channelService.checkSubscriptionStatus(this.channel._id, this.currentUserId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (isSubscribed) => {
        this.isSubscribed = isSubscribed;
        //console.log("Subscription status:", this.isSubscribed);
      },
      error: (error) => {
        console.error("Error checking subscription status:", error);
      }
    });
  }

  toggleSubscription(): void {
    if (!this.currentUserId) {
      this.showError('You need to log in to perform this action.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.isSubscribed) {
      this.channelService.unsubscribeFromChannel(this.channel._id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.isSubscribed = false;
          this.subscriberCount--;
        },
        error: (error) => console.error("Error unsubscribing", error)
      });
    } else {
      this.channelService.subscribeToChannel(this.channel._id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.isSubscribed = true;
          this.subscriberCount++;
        },
        error: (error) => console.error("Error subscribing", error)
      });
    }
  }

  setChannelProfilePic(): void {
    if (this.channel.profilePic ) {
      //console.log("chanspic",this.channel )
      this.channelProfilePic = this.channel.profilePic;
    } else {
      this.channelProfilePic = '/assets/images/Screenshot (204).png';
    }
    //console.log("Set channel profile pic:", this.channelProfilePic);
  }

  loadVideoData(videoId: string) {
    this.videoService.getVideoById(videoId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (videoData) => {
        //console.log("video on id", videoData);
        this.currentVideo = videoData;
        //console.log("videodata from load", this.currentVideo.video.name);
        //console.log("videodata from load", this.currentVideo);
        //console.log("videodata from load", this.currentVideo.disLikes);

        if (this.currentVideo && this.currentVideo.channelId) {
          this.loadChannelData(this.currentVideo.channelId);
        }

        if (this.currentVideo.category) {
          this.loadRecommendedVideos(this.currentVideo.category,this.currentVideo._id);
        }

        this.checkLikeStatus(videoId);
      },
      error: (error) => {
        console.error("Error loading video data", error);
        if (error.status === 404) {
          this.router.navigate(['/not-found']);
        } else {
          this.showErrorMessage("An error occurred while loading the video. Please try again later.");
        }
      }
    });
  }

  incrementViewCount(videoId: string) {
    this.videoService.incrementViewCount(videoId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        //console.log("View count incremented");
      },
      error: (error) => {
        console.error("Error incrementing view count", error);
      }
    });
  }

  showErrorMessage(errorMessage: string) {
    this.dialog.open(ErrorDialogComponent, {
      data: { message: errorMessage },
      width: '300px'
    });
  }

  loadRecommendedVideos(category: string|VideoCategory,videoId:string) {
    const categoryId = typeof category === 'string' ? category : category._id;
    
    this.videoService.getRecommendedVideos(categoryId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (videos: video[] | undefined) => {
        if (videos) {
          // Filter out the current video from the recommendations
          if(this.currentVideo){

            this.recommendedVideos = videos.filter(video => video._id !== videoId);
          }
        } else {
          this.recommendedVideos = [];
        }
        //console.log("recommendedVideos", this.recommendedVideos);
      },
      error: (error: string) => {
        console.error("Error loading recommended videos", error);
      }
    });
  }

  formatDate(date: Date): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }

  loadComments(videoId:string) {
    this.videoService.getComments(videoId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (comments: any[]) => {
        this.comments = comments;
        //console.log(' this.comments = comments', this.comments);
        
      },
      error: (error: any) => {
        console.error("Error loading comments", error);
      }
    });
  }

  addComment(videoId:string) {
    if (this.newComment.trim()) {
      this.videoService.addComment(videoId, this.newComment).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (result: boolean) => {
          if (result) {
            this.loadComments(videoId); // Reload comments after adding
            this.newComment = ''; // Clear the input
          }
        },
        error: (error: any) => {
          console.error("Error adding comment", error);
        }
      });
    }
  }

  editComment(comment:string) {
    // Implement logic to edit the comment
    //console.log('Editing comment:', comment);
  }
  
  deleteComment(commentId: string,videoId:string) {
    this.videoService.deleteComment(commentId,videoId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result: boolean) => {
        if (result) {
          this.loadComments(videoId); // Reload comments after adding
          this.newComment = ''; // Clear the input
        }
      },
      error: (error: any) => {
        console.error("Error adding comment", error);
      }
    });
  }
  canDeleteComment(comment: any): boolean {
    return comment.user._id === this.currentUserId;
  }
  

  checkLikeStatus(videoId: string): void {
    if (this.currentVideo) {
      this.videoService.getLikeStatus(videoId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (status: { isLiked: boolean; isDisliked: boolean; }) => {
          this.isLiked = status.isLiked;
          this.isDisliked = status.isDisliked;
        },
        error: (error) => console.error("Error checking like status", error)
      });
    }
  }

  likeVideo(videoId: string): void {
    if (!this.currentUserId) {
      this.showError('You need to log in to perform this action.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.isLiked) {
      this.videoService.unlikeVideo(videoId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.isLiked = false;
          this.loadVideoData(videoId);
          if(this.currentVideo){

            this.currentVideo.likes = (this.currentVideo.likes as any[]).filter(id => id !== this.currentUserId);
            //console.log('increlikes', this.currentVideo.video.likes);
          }
        },
        error: (error) => console.error("Error unliking video", error)
      });
    } else {
      this.videoService.likeVideo(videoId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.isLiked = true;
          this.loadVideoData(videoId);
          if(this.currentVideo){
          if (!this.currentVideo.likes) {
            this.currentVideo.likes = [];
            //console.log('this.currentVideo.likes', this.currentVideo.likes);
          }
          if(this.currentUserId){

            this.currentVideo.likes.push(this.currentUserId);
          }
          //console.log('likes', this.currentVideo.likes);
        }
        },
        error: (error) => console.error("Error liking video", error)
      });
    }
  }

  dislikeVideo(videoId: string): void {
    if (!this.currentUserId) {
      this.showError('You need to log in to perform this action.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.isDisliked) {
      this.videoService.undislikeVideo(videoId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.isDisliked = false;
          this.loadVideoData(videoId);
          if(this.currentVideo){
          this.currentVideo.disLikes = (this.currentVideo.disLikes as any[]).filter(id => id !== this.currentUserId);
          }
        },
        error: (error) => console.error("Error undisliking video", error)
      });
    } else {
      this.videoService.dislikeVideo(videoId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.isDisliked = true;
          this.loadVideoData(videoId);
          if(this.currentVideo){
          if (!this.currentVideo.disLikes) {
            this.currentVideo.disLikes = [];
          }if(this.currentUserId){

            this.currentVideo.disLikes.push(this.currentUserId);
          }
        }
        },
        error: (error) => console.error("Error disliking video", error)
      });
    }
  }

  search(){
    //console.log("hhmm");
    
  }

  navigateToChannel(channel: MinimalChannelData): void {
    //console.log("Fetching data for channel", channel._id);
    this.channelService.getChannelById(channel._id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (channelData) => {
        //console.log("Received channel data", channelData);
        // Navigate to the channel component with the data
        this.router.navigate(['/user/user-channel', channel._id], { state: { channelData } });
      },
      error: (error) => {
        console.error("Error fetching channel data", error);
        this.router.navigate(['/user/profile']);
      }
    });
  }

  navigateToVideo(video: video): void {
    //console.log("Navigating to video:", video);

    const videoId = video._id || 'default';

    // Prepare video data
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

    //console.log("Video data:", videoData);

    // Fetch channel data
    this.channelService.getChannelById(video.channelId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (channelData) => {
        // Navigate with prepared video data and channel data
        this.router.navigate(['/user/video', videoId], {
          state: {
            videoData: videoData,
            channelData: channelData.channel
          }
        });
      },
      error: (error) => {
        console.error("Error loading channel data", error);
        // Navigate with just prepared video data if channel data fetch fails
        this.router.navigate(['/user/video', videoId], {
          state: {
            videoData: videoData
          }
        });
      }
    });
  }

  toggleDescription() {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  showError(errorMessage: string) {
    this.dialog.open(ErrorDialogComponent, {
      data: { message: errorMessage },
      width: '300px'
    });
  }
}


