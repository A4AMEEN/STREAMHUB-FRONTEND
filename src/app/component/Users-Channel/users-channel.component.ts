/* eslint-disable no-var */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { channelService } from '../../services/channel.service';
import { environment } from '../../../env/environment';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Channel,Video } from '../Types/channelTypes';
import { user } from '../Types/userTypes';
declare var Razorpay: any;
@Component({
  selector: 'app-user-channel',
  templateUrl: './users-channel.component.html',
  styleUrls: ['./users-channel.component.css']
})
export class UsersChannelComponent implements OnInit, OnDestroy {
  private paymentInProgress = new BehaviorSubject<boolean>(false);

  channel!: Channel;
  isSubscribed: boolean = false;
  superUserExpiryDate: Date | null = null;
  remainingDays: number = 0;
  currentUserId!:string |null
  categories = [
    { name: 'Home' },
    { name: 'Videos' },
    { name: 'Shorts' },
    { name: 'Live' },
    { name: 'Playlists' },
    { name: 'Community' },
    { name: 'Channels' },
    { name: 'About' }
  ];
  videos: Video[] = [];
    filteredVideos: Video[] = [];
  subscriberCount: number = 0;
  user!:user
  isSuperUser: boolean = false;
  isChannelOwner: boolean = false;
  showPlans: boolean = false;
  selectedPlan: string = '';
  private unsubscribe$ = new Subject<void>();

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _authService: AuthService,
    private _channelService: channelService
  ) {
    const navigation = this._router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.channel = navigation.extras.state['channelData'].channel;
      this.videos = this.channel.videos;
      this.loadChannelData(this.channel._id);
      this.checkIfChannelOwner();
      console.log("navidata", this.channel);
    }
  }

  ngOnInit(): void {
    this.currentUserId = this._authService.getCurrentUserId();
    this.user = this._authService.getUserData()
    this.checkIfChannelOwner();

    console.log("this.currentUserId",this.currentUserId);
    if (!this.currentUserId) {
      console.error("User not logged in");
      this._router.navigate(['/auth/login']);
      return;
    }

    if (!this.channel) {
      this._route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
        const channelId = params['id'];
        if (channelId) {
          this.loadChannelData(channelId);
          this.checkSuperUserStatus();
        } else {
          console.error("No channelId provided");
          this._router.navigate(['/user/profile']);
        }
      });
    } else {
      this.checkSubscriptionStatus();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  trackByVideoId(index: number, video: Video): string {
    return video._id;
  }
  
loadChannelData(channelId: string): void {
  this._channelService.getChannelById(channelId).pipe(takeUntil(this.unsubscribe$)).subscribe({
    next: (channelData) => {
      this.channel = channelData.channel;
      this.subscriberCount = channelData.channel.subscribers.length;
      this.checkIfChannelOwner();
      this.filterVideos();
      this.checkSubscriptionStatus()
      this.checkSuperUserStatus()
    },
    error: (error) => {
      console.error("Error loading channel data", error);
      this._router.navigate(['/user/profile']);
    }
  });
}
filterVideos(): void {
  this.filteredVideos = this.channel.videos.filter((video: Video) => {
    return video.isListed || this.isChannelOwner;
  });
}

  
  checkSuperUserStatus(): void {
    if (this.channel && this.currentUserId && !this.isChannelOwner) {
      const userSubscription = this.channel.subscriptions.find(
        (sub) => sub.user.toString() === this.currentUserId
      );
      console.log("userSubscription", userSubscription);
      
      if (userSubscription) {
        const expiryDate = new Date(userSubscription.expiryDate);
        const now = new Date();
        
        if (expiryDate > now) {
          this.isSuperUser = true;
          this.superUserExpiryDate = expiryDate;
          this.remainingDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        } else {
          this.isSuperUser = false;
          this.superUserExpiryDate = null;
          this.remainingDays = 0;
        }
      } else {
        this.isSuperUser = false;
        this.superUserExpiryDate = null;
        this.remainingDays = 0;
      }
    }
  }

  getRemainingTimeString(): string {
    if (this.remainingDays > 1) {
      return `${this.remainingDays} days remaining`;
    } else if (this.remainingDays === 1) {
      return '1 day remaining';
    } else {
      return 'Less than a day remaining';
    }
  }
  


  showSuperUserPlans(): void {
    this.showPlans = true;
  }

  selectPlan(plan: string): void {
    this.selectedPlan = plan;
    this.initializeRazorpay();
  }

  initializeRazorpay(): void {
    const options = {
      key: 'rzp_test_U3wApGAM5gGpOR',
      amount: this.selectedPlan === 'weekly' ? 9900 : 29900, // Amount in paise
      currency: 'INR',
      name: 'StreamHub',
      description: `${this.selectedPlan.charAt(0).toUpperCase() + this.selectedPlan.slice(1)} Super User Subscription`,
      handler: this.razorpayPaymentHandler.bind(this),
      prefill: {
        name: this.user.username ||this.user.name|| 'Guest',
        email: this.user.email || 'user@example.com'
      },
      theme: {
        color: '#F37254'
      },
      modal: {
        ondismiss: () => {
          this.paymentInProgress.next(false);
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

  razorpayPaymentHandler(response: any): void {
    console.log(response);
    
    // Handle the payment response here
    // You should send this response to your backend for verification
    this._channelService.verifySuperUserPayment(response, this.selectedPlan, this.channel._id).subscribe({
      next: (result) => {
        console.log('Payment verified', result);
        // Update UI to reflect super user status
        this.paymentInProgress.next(false);
        this.checkSubscriptionStatus()
      },
      error: (error) => {
        console.error('Error verifying payment:', error);
        this.paymentInProgress.next(false);
      }
    });
  }

  checkSubscriptionStatus(): void {
    if (!this.channel || !this.currentUserId || this.isChannelOwner) return;
  
    this._channelService.checkSubscriptionStatus(this.channel._id, this.currentUserId).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (isSubscribed) => {
        this.isSubscribed = isSubscribed;
        console.log("Subscription status:", this.isSubscribed);
      },
      error: (error) => {
        console.error("Error checking subscription status:", error);
      }
    });
  }

  checkIfChannelOwner(): void {
    console.log('Subscription successful');
    if (this.channel && this.currentUserId) {
      this.isChannelOwner = this.channel.user === this.currentUserId;
      console.log('Subscription successful', this.isChannelOwner);
    }
  }

  getProfilePicUrl(): string {
    if (this.channel?.profilePic) {
      return this.channel.profilePic.startsWith('http')
        ? this.channel.profilePic
        : `${environment.ASSETS_URL}uploads/${this.channel.profilePic}`;
    }
    return 'assets/images/Screenshot (204).png';
  }

  getBanner(): string {
    if (this.channel?.banner) {
      return this.channel.banner.startsWith('http')
        ? this.channel.banner
        : `${environment.ASSETS_URL}uploads/${this.channel.banner}`;
    }
    return 'assets/images/Screenshot (204).png';
  }

  toggleSubscription(): void {
    if (!this.channel || !this.currentUserId) return;

    if (this.isSubscribed) {
      this.unsubscribeFromChannel();
    } else {
      this.subscribeToChannel();
    }
  }

  subscribeToChannel(): void {
    this._channelService.subscribeToChannel(this.channel._id).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response) => {
        console.log('Subscription successful', response);
        this.isSubscribed = true;
        if(this.currentUserId){

          if (!this.channel.subscribers.includes(this.currentUserId)) {
            this.channel.subscribers.push(this.currentUserId);
          }
        }
        this.checkSubscriptionStatus(); // Add this line
      },
      error: (error) => {
        console.error('Error subscribing to channel:', error);
      }
    });
  }

  unsubscribeFromChannel(): void {
    this._channelService.unsubscribeFromChannel(this.channel._id).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response) => {
        console.log('Unsubscription successful', response);
        this.isSubscribed = false;
        if(this.currentUserId){

          const index = this.channel.subscribers.indexOf(this.currentUserId);
          if (index > -1) {
            this.channel.subscribers.splice(index, 1);
          }
        }
        this.checkSubscriptionStatus();
      },
      error: (error) => {
        console.error('Error unsubscribing from channel:', error);
      }
    });
  }

  navigateToVideo(video: Video) {
    console.log("parsnng", video);

    const videoId = video._id || 'default';

    // Prepare video data, excluding isPrivate and isListed
    const videoData = {
      _id: video._id,
      url: video.url,
      category: video.category,
      channelName: this.channel.channelName,
      channelId: this.channel._id,
      views: video.views,
      likes: video.likes,
      name: video.name,
      description: video.description || '',
      thumbnail: video.thumbnail
    };
    console.log("vdata", videoData);

    // Fetch channel data
    this._channelService.getChannelById(video.channelId).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (channelData) => {
        // Navigate with prepared video data and channel data
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
