import { Component, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-video-conference',
  template: '<div #root></div>',
  styles: ['']
})
export class VideoChatComponent implements AfterViewInit {
  @ViewChild('root') root!: ElementRef;

  constructor(
    private _authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.initializeZegoUIKit();
    }
  }

  private async initializeZegoUIKit() {
    try {
      const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');
      
      const userData = this._authService.getUserData();
      const roomID = this.getUrlParams().get('roomID') || this.randomID(5);
      const userID = userData._id;
      const userName = userData.username;

      const res = await this.generateToken('https://nextjs-token.vercel.app/api', userID);
      const token = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        1484647939, // Replace with your actual appID
        res.token,
        roomID,
        userID,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(token);

      zp.joinRoom({
        container: this.root.nativeElement,
        sharedLinks: [
          {
            name: 'Personal link',
            url: window.location.origin + window.location.pathname + '?roomID=' + roomID,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
      });
    } catch (error) {
      console.error('Error initializing ZegoUIKit:', error);
    }
  }

  private generateToken(tokenServerUrl: string, userID: string): Promise<any> {
    return fetch(
      `${tokenServerUrl}/access_token?userID=${userID}&expired_ts=7200`,
      {
        method: 'GET',
      }
    ).then((res) => res.json());
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

  private getUrlParams(url: string = window.location.href): URLSearchParams {
    const urlStr = url.split('?')[1];
    return new URLSearchParams(urlStr);
  }
}