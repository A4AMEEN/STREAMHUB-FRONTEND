import { Component, OnInit, OnDestroy } from '@angular/core';
import { channelService } from '../../../services/channel.service';
import { environment } from '../../../../env/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChannelResponse,RestrictChannelResponse,Channel } from '../../Types/channelTypes';

@Component({
  selector: 'app-admin-channel',
  templateUrl: './admin-channel.component.html',
  styleUrl: './admin-channel.component.css'
})
export class AdminChannelComponent implements OnInit, OnDestroy {
  showChannels: Partial<Channel>[]=[];
  channels: Partial<Channel>[]=[];
  assetsUrl = environment.ASSETS_URL;
  currentPage = 1;
  pageSize = 6;
  totalChannels = 0;
  private destroy$ = new Subject<void>();

  constructor(private _channelService: channelService) { }

  ngOnInit(): void {
    this.loadAllChannels();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllChannels(): void {
    this._channelService.getAllChannelsAdmin()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ChannelResponse | Partial<Channel>[]) => {
          if (response && 'showChannels' in response && Array.isArray(response.showChannels)) {
            this.channels = response.showChannels.map(this.mapChannel);
          } else if (response && 'channels' in response && Array.isArray(response.channels)) {
            this.channels = response.channels.map(this.mapChannel);
          } else if (Array.isArray(response)) {
            this.channels = response.map(this.mapChannel);
          } else {
            console.error('Unexpected response format:', response);
            this.channels = [];
          }
          
          this.totalChannels = this.channels.length;
        },
        error: (error) => {
          console.error('Error loading channels:', error);
          this.channels = [];
        }
      });
  }

  mapChannel = (channel: Partial<Channel>) => ({
    
    
    ...channel,
    
    profilePic: channel.profilePic
      ? `${this.assetsUrl}uploads/${channel.profilePic}`
      : '/assets/images/Screenshot (204).png'
  });
 
  confirmToggleChannelRestriction(channel: Partial<Channel>): void {
    if (!channel._id) {
      console.error('Channel ID is undefined');
      return;
    }
  
    const action = channel.isRestricted ? 'unrestrict' : 'restrict';
    const confirmMessage = `Are you sure you want to ${action} this channel?`;
    
    if (confirm(confirmMessage)) {
      this.toggleChannelRestriction(channel._id);
    }
  }

  toggleChannelRestriction(channelId: string): void {
    this._channelService.restrictChannel(channelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: RestrictChannelResponse) => {
          const channelIndex = this.channels.findIndex(c => c._id === channelId);
          if (channelIndex !== -1) {
            this.channels[channelIndex] = {
              ...this.channels[channelIndex],
              isRestricted: response.channel.isRestricted
            };
          } else {
            console.warn(`Channel with id ${channelId} not found in local state.`);
          }
        },
        error: (error) => {
          console.error('Error toggling channel restriction:', error);
        }
      });
  }

  get paginatedChannels() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.channels.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.totalChannels / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}