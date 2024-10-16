/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { Component, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID, OnInit, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { channelService } from '../../services/channel.service';
import { take } from 'rxjs/operators';
import { Channel, ChannelData } from '../Types/channelTypes';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-livestream',
  template: '<div #root></div>',
  styles: ['']
})
export class LiveStreamComponent implements AfterViewInit, OnInit {

  @ViewChild('root') root!: ElementRef;
  private isBrowser: boolean;
  link!: string;
  channelId!: string;
  private zp: any; // ZegoUIKitPrebuilt instance
  private roomID: string = '';
  private destroy$ = new Subject<void>();

  channel: ChannelData = {
    _id: '',
    name: '',
    profilePic: '',
    subscribers: 0,
    isRestricted: false,
    bannerImage: ''
  };

  constructor(
    private _authService: AuthService,
    private _channelService: channelService,
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadChannelData();
      const user = this._authService.getUserData();
      if (!user) {
        this.router.navigate(['/auth/login']);
      }
    }
  }

  async ngAfterViewInit() {
    if (this.isBrowser) {
      await this.initializeLiveStream();
    }
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
          } else {
            console.error('Channel data not found');
          }
        },
        error: (error: any) => {
          console.error('Error fetching channel data:', error);
        }
      });
  }

  private async initializeLiveStream() {
    if (this.isBrowser) {
      try {
        const userData = this._authService.getUserData();
        if (!userData) {
          this.router.navigate(['/auth/login']);
          return;
        }
        const channel = this._authService.getChannelId();
        this.channelId = channel._id;

        this.roomID = this.getUrlParams().get('roomID') || this.randomID(5);
        const userID = userData._id;
        const userName = userData.username;
        const channelId = channel._id;
        console.log("channelId", channelId, this.channelId);

        const roleStr = this.getUrlParams().get('role') || 'Host';
        const role = roleStr === 'Host' ? ZegoUIKitPrebuilt.Host
                : roleStr === 'Cohost' ? ZegoUIKitPrebuilt.Cohost
                : ZegoUIKitPrebuilt.Audience;

        const res = await this.generateToken('https://preview-uikit-server.zegotech.cn/api/token', 2013980891, userID);
        
        const token = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          2013980891,
          res,
          this.roomID,
          userID,
          userName
        );

        this.zp = ZegoUIKitPrebuilt.create(token);

        const sharedLinks = this.generateSharedLinks(role);

        this.ngZone.runOutsideAngular(() => {
          this.zp.joinRoom({
            container: this.root.nativeElement,
            scenario: {
              mode: ZegoUIKitPrebuilt.LiveStreaming,
              config: { role },
            },
            sharedLinks,
            onLeaveRoom: () => this.ngZone.run(() => this.removeStreamUrl()),
          });
        });

        if (role === ZegoUIKitPrebuilt.Host) {
          this.saveAudienceLink(channelId, sharedLinks);
        }
      } catch (error) {
        console.error('Error initializing ZegoUIKit for livestream:', error);
      }
    }
  }

  private generateSharedLinks(role: any) {
    const sharedLinks = [];
    if (role === ZegoUIKitPrebuilt.Host || role === ZegoUIKitPrebuilt.Cohost) {
      sharedLinks.push({
        name: 'Join as co-host',
        url: `${window.location.origin}${window.location.pathname}?roomID=${this.roomID}&role=Cohost`,
      });
    }
    sharedLinks.push({
      name: 'Join as audience',
      url: `${window.location.origin}${window.location.pathname}?roomID=${this.roomID}&role=Audience`,
    });
    return sharedLinks;
  }

  private saveAudienceLink(channelId: string, sharedLinks: any[]) {
    const audienceLink = sharedLinks.find(link => link.name === 'Join as audience')?.url;
    if (audienceLink) {
      this._channelService.startLive(channelId, audienceLink)
        .pipe(take(1))
        .subscribe({
          next: (response) => console.log('Audience link saved:', response),
          error: (error) => console.error('Error saving audience link:', error)
        });
    } else {
      console.error('Audience link not found');
    }
  }

  private removeStreamUrl() {
    this.router.navigate(['/landing']);
    this._channelService.stopLive(this.channelId)
      .pipe(take(1))
      .subscribe({
        next: (response) => console.log('Stream URL removed:', response),
        error: (error) => console.error('Error removing stream URL:', error)
      });
  }

  private generateToken(tokenServerUrl: string, appID: number, userID: string): Promise<string> {
    return fetch(tokenServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: appID,
        user_id: userID,
      }),
    }).then(res => res.text());
  }

  private randomID(len: number): string {
    let result = '';
    const chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP';
    const maxPos = chars.length;
    len = len || 5;
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return result;
  }

  private getUrlParams(): URLSearchParams {
    return new URLSearchParams(window.location.search);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}