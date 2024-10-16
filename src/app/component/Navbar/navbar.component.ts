// NavbarComponent
import { Component, OnInit, OnDestroy } from '@angular/core';
import { channelService } from '../../services/channel.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Channel, ChannelData, MinimalChannelData } from '../Types/channelTypes';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  Math = Math;
  isSidebarExpanded: boolean = false;
  channels: { channelName: string, _id: string }[] = [];
  displayedChannels: { channelName: string, _id: string }[] = [];
  channelsPerPage: number = 5;
  currentPage: number = 1;
  private destroy$ = new Subject<void>();

  constructor(
    private _channelService: channelService,
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.getChannels();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  getChannels(): void {
    this._channelService.getAllChannels()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.channels = response.showChannels;
          this.updateDisplayedChannels();
          ////console.log('Fetched channels:', this.channels);
        },
        error: (error) => {
          console.error('Error fetching channels:', error);
        }
      });
  }

  updateDisplayedChannels(): void {
    const startIndex = (this.currentPage - 1) * this.channelsPerPage;
    const endIndex = startIndex + this.channelsPerPage;
    this.displayedChannels = this.channels.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage * this.channelsPerPage < this.channels.length) {
      this.currentPage++;
      this.updateDisplayedChannels();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedChannels();
    }
  }

  navigateToChannel(channel: MinimalChannelData): void {
    ////console.log("Fetching data for channel", channel);
    this._channelService.getChannelById(channel._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channelData) => {
          ////console.log("Received channel data", channelData);
          // Navigate to the channel component with the data
          this._router.navigate(['/user/user-channel', channel._id], { state: { channelData } });
        },
        error: (error) => {
          console.error("Error fetching channel data", error);
          this._router.navigate(['/user/profile']);
        }
      });
  }
}