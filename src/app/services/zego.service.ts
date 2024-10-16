/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ZegoService {
  private zegoUIKit: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async getZegoUIKit() {
    if (isPlatformBrowser(this.platformId) && !this.zegoUIKit) {
      const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');
      this.zegoUIKit = ZegoUIKitPrebuilt;
    }
    return this.zegoUIKit;
  }
}