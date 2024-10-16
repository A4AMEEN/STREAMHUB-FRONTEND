import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';

@Component({
  selector: 'app-livestream',
  template: `
    <div>
      <h2>Livestream</h2>
      <div *ngIf="!isStreaming">
        <button (click)="startStream()">Start Streaming</button>
      </div>
      <div *ngIf="isStreaming">
        <button (click)="stopStream()">Stop Streaming</button>
      </div>
      <div *ngIf="!isViewing">
        <button (click)="startViewing()">Start Viewing</button>
      </div>
      <div *ngIf="isViewing">
        <button (click)="stopViewing()">Stop Viewing</button>
      </div>
      <video #localVideo autoplay playsinline></video>
      <video #remoteVideo autoplay playsinline></video>
    </div>
  `
})
export class StreamCreatorComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo', { static: true }) localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: true }) remoteVideoRef!: ElementRef<HTMLVideoElement>;

  private zg!: ZegoExpressEngine;
  private streamID = 'stream-' + new Date().getTime();
  isStreaming = false;
  isViewing = false;

  private appID = 723099634;
  private appSign = '6ce9751ff1c2692ea8002933742d925dcfe2b38bcddd0aea0475be1e3ce32d67';

  ngOnInit() {
    this.initSDK();
    this.loginRoom();
  }

  ngOnDestroy() {
    if (this.zg) {
      this.zg.destroyEngine();
    }
  }

  initSDK() {
    this.zg = new ZegoExpressEngine(this.appID, this.appSign);
    this.zg.setLogConfig({
      logLevel: 'warn'
    });
  }

  async loginRoom() {
    try {
      await this.zg.loginRoom('room1', this.generateToken(), { userID: 'user1', userName: 'user1' });
      console.log('Login success');
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  generateToken(): string {
    // In a real application, you should generate this token on your server
    // This is just a placeholder
    return 'your_generated_token';
  }

  async startStream() {
    try {
      const localStream = await this.zg.createStream();
      await this.zg.startPublishingStream(this.streamID, localStream);
      if (this.localVideoRef.nativeElement) {
        this.localVideoRef.nativeElement.srcObject = localStream;
      }
      this.isStreaming = true;
    } catch (error) {
      console.error('Failed to start stream', error);
    }
  }

  async stopStream() {
    try {
      await this.zg.stopPublishingStream(this.streamID);
      this.isStreaming = false;
      if (this.localVideoRef.nativeElement) {
        this.localVideoRef.nativeElement.srcObject = null;
      }
    } catch (error) {
      console.error('Failed to stop stream', error);
    }
  }

  async startViewing() {
    try {
      const remoteStream = await this.zg.startPlayingStream(this.streamID);
      if (this.remoteVideoRef.nativeElement) {
        this.remoteVideoRef.nativeElement.srcObject = remoteStream;
      }
      this.isViewing = true;
    } catch (error) {
      console.error('Failed to start viewing', error);
    }
  }

  async stopViewing() {
    try {
      await this.zg.stopPlayingStream(this.streamID);
      this.isViewing = false;
      if (this.remoteVideoRef.nativeElement) {
        this.remoteVideoRef.nativeElement.srcObject = null;
      }
    } catch (error) {
      console.error('Failed to stop viewing', error);
    }
  }
}