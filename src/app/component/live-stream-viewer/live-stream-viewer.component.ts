  import { Component, OnInit, ViewChild, ElementRef, OnDestroy, NgZone } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { AuthService } from '../../services/auth.service';
  import { io, Socket } from 'socket.io-client';

  @Component({
    selector: 'app-live-stream-viewer',
    template: `
      <div class="stream-container">
        <video #remoteVideo autoplay playsinline></video>
        <div *ngIf="!isStreamActive" class="stream-status">
          {{ statusMessage }}
          <button *ngIf="showRetryButton" (click)="retryConnection()">Retry Connection</button>
        </div>
        <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
      </div>
    `,
    styles: [`
      .stream-container {
        width: 100%;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #000;
        position: relative;
      }
      video {
        max-width: 100%;
        max-height: 100%;
      }
      .stream-status, .error-message {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 20px;
        text-align: center;
      }
      .error-message {
        color: red;
      }
      button {
        margin-top: 10px;
        padding: 5px 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
    `]
  })
  export class LiveStreamViewerComponent implements OnInit, OnDestroy {
    @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

    private socket!: Socket;
    private peerConnection!: RTCPeerConnection;
    private roomId: string = '';
    private connectionTimeout: number = 15000; // 15 seconds
    private connectionTimer: any;
    private userId: string = '';
    private iceCandidatesQueue: RTCIceCandidate[] = [];
    isStreamActive: boolean = false;
    errorMessage: string = '';
    statusMessage: string = 'Connecting to stream...';
    showRetryButton: boolean = false;
    private connectionAttempts: number = 0;
    private maxConnectionAttempts: number = 3;

    constructor(
      private route: ActivatedRoute,
      private authService: AuthService,
      private ngZone: NgZone
    ) { }

    ngOnInit(): void {
      console.log("Initializing LiveStreamViewerComponent");
      this.roomId = this.route.snapshot.paramMap.get('roomId') || '';
      if (!this.roomId) {
        this.setErrorMessage('No room ID provided');
        return;
      }
      const userData = this.authService.getUserData();
      if (userData) {
        this.userId = userData._id;
      }
      this.setupSignalingServer();
    }

    ngOnDestroy(): void {
      this.leaveStream();
    }

    private startConnectionTimer(): void {
      this.connectionTimer = setTimeout(() => {
        if (this.peerConnection.connectionState !== 'connected') {
          console.log('Connection timeout. Attempting to reconnect...');
          //this.restartIce();
        }
      }, this.connectionTimeout);
    }
    
    private clearConnectionTimer(): void {
      if (this.connectionTimer) {
        clearTimeout(this.connectionTimer);
      }
    }

    private setupSignalingServer(): void {
      console.log('Setting up signaling server');
      this.socket = io('http://localhost:5000');

      this.socket.on('connect', () => {
        console.log('Connected to signaling server');
        this.socket.emit('join-room', { room: this.roomId, role: 'viewer', username: this.userId });
      });

      this.socket.on('broadcaster-ready', (broadcasterId: string) => {
        console.log('Broadcaster is ready:', broadcasterId);
        this.initializePeerConnection();
        this.socket.emit('viewer-ready', { room: this.roomId, broadcasterId: broadcasterId });
      });

      this.socket.on('offer', (data: { broadcasterId: string; offer: RTCSessionDescriptionInit }) => {
        console.log('Received offer from broadcaster:', data.broadcasterId);
        this.handleOffer(data.offer);
      });

      this.socket.on('ice-restart', async (data: { offer: RTCSessionDescriptionInit }) => {
        console.log('Received ICE restart request');
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.socket.emit('ice-restart-answer', { room: this.roomId, answer: answer });
      });

      this.socket.on('broadcast-ended', () => {
        console.log('Broadcast ended');
        this.isStreamActive = false;
        this.setStatusMessage('The broadcast has ended');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from signaling server');
        this.setStatusMessage('Disconnected from server. Attempting to reconnect...');
        setTimeout(() => this.setupSignalingServer(), 5000);
      });
    }

    private initializePeerConnection(): void {
      console.log('Initializing peer connection');
      const configuration: RTCConfiguration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          }
        ],
        iceCandidatePoolSize: 10
      };
      
      this.peerConnection = new RTCPeerConnection(configuration);
      console.log("prre from me ",this.peerConnection)

      this.peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (this.remoteVideo.nativeElement.srcObject !== event.streams[0]) {
          console.log('Setting remote video source');
          this.remoteVideo.nativeElement.srcObject = event.streams[0];
          this.isStreamActive = true;
          this.setupVideoEventListeners();
        }
      };

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate to broadcaster');
          this.socket.emit('ice-candidate', {
            room: this.roomId,
            targetId: this.socket.id,
            candidate: event.candidate
          });
        }
      };

      this.peerConnection.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', this.peerConnection.iceGatheringState);
      };

      this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', this.peerConnection.connectionState);
        if (this.peerConnection.connectionState === 'connected') {
          console.log('WebRTC connection established successfully');
          this.clearConnectionTimer();
        } else if (this.peerConnection.connectionState === 'failed') {
          console.log('Connection failed. Attempting to reconnect...');
          //this.restartIce();
        }
      };

      this.peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', this.peerConnection.iceConnectionState);
        if (this.peerConnection.iceConnectionState === 'failed') {
          console.log('ICE connection failed. Attempting to restart...');
          //this.restartIce();
        }
      };

      this.peerConnection.onsignalingstatechange = () => {
        console.log('Signaling state:', this.peerConnection.signalingState);
      };

      this.peerConnection.onicecandidateerror = (event: RTCPeerConnectionIceErrorEvent) => {
        console.error('ICE candidate error:', event);
        console.log('Error details:', {
          address: event.address,
          port: event.port,
          url: event.url,
          errorCode: event.errorCode,
          errorText: event.errorText
        });
      };

      // Process any queued ICE candidates
      this.processIceCandidateQueue();
    }

    private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
      console.log('Handling offer from broadcaster:', offer);
      try {
        if (!this.peerConnection) {
          console.log('Peer connection not initialized. Initializing now.');
          this.initializePeerConnection();
        }
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        console.log('Remote description set successfully');
        const answer = await this.peerConnection.createAnswer();
        console.log('Answer created:', answer);
        await this.peerConnection.setLocalDescription(answer);
        console.log('Local description set successfully');
        this.socket.emit('answer', {
          room: this.roomId,
          broadcasterId: this.socket.id,
          answer: answer
        });
        console.log('Answer sent to broadcaster');
        
        // Start a timer to check if the connection is established
        this.startConnectionTimer();
      } catch (error) {
        console.error('Error handling offer:', error);
        this.setErrorMessage('Error establishing connection. Please try refreshing the page.');
        this.handleConnectionFailure();
      }
    }

    private handleIceCandidate(candidate: RTCIceCandidate): void {
      if (this.peerConnection && this.peerConnection.remoteDescription) {
        this.addIceCandidate(candidate);
      } else {
        this.iceCandidatesQueue.push(candidate);
      }
    }

    private async addIceCandidate(candidate: RTCIceCandidate): Promise<void> {
      try {
        await this.peerConnection.addIceCandidate(candidate);
        console.log('ICE candidate added successfully');
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }

    private async processIceCandidateQueue(): Promise<void> {
      console.log(`Processing ${this.iceCandidatesQueue.length} queued ICE candidates`);
      while (this.iceCandidatesQueue.length) {
        const candidate = this.iceCandidatesQueue.shift();
        if (candidate) {
          await this.addIceCandidate(candidate);
        }
      }
    }

    private setupVideoEventListeners(): void {
      const video = this.remoteVideo.nativeElement;

      video.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        video.play().catch(error => console.error('Error playing video:', error));
      };

      video.onplaying = () => {
        console.log('Video playback started');
        this.ngZone.run(() => {
          this.isStreamActive = true;
          this.setStatusMessage('');
        });
      };

      video.onended = () => {
        console.log('Video playback ended');
        this.ngZone.run(() => {
          this.isStreamActive = false;
          this.setStatusMessage('Stream ended');
        });
      };

      video.onerror = (event) => {
        console.error('Video error:', event);
        this.setErrorMessage('Error playing video. Please try refreshing the page.');
      };
    }

    private setStatusMessage(message: string): void {
      this.ngZone.run(() => {
        this.statusMessage = message;
        console.log(message);
      });
    }

    private setErrorMessage(message: string): void {
      this.ngZone.run(() => {
        this.errorMessage = message;
        console.error(message);
      });
    }

    private leaveStream(): void {
      console.log('Leaving stream');
      if (this.peerConnection) {
        this.peerConnection.close();
      }
      if (this.socket) {
        this.socket.disconnect();
      }
      if (this.remoteVideo.nativeElement.srcObject) {
        const tracks = (this.remoteVideo.nativeElement.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      this.isStreamActive = false;
    }

    private handleConnectionFailure(): void {
      this.connectionAttempts++;
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        this.setStatusMessage(`Connection failed. Retrying... (Attempt ${this.connectionAttempts}/${this.maxConnectionAttempts})`);
        this.retryConnection();
      } else {
        this.setErrorMessage('Failed to establish connection after multiple attempts. Please check your network connection and try again.');
        this.showRetryButton = true;
      }
    }

    private async restartIce(): Promise<void> {
      console.log('Attempting ICE restart');
      if (this.peerConnection) {
        try {
          const offer = await this.peerConnection.createOffer({ iceRestart: true });
          await this.peerConnection.setLocalDescription(offer);
          this.socket.emit('ice-restart', { room: this.roomId, offer: offer });
        } catch (error) {
          console.error('Error during ICE restart:', error);
        }
      }
    }

    retryConnection(): void {
      this.connectionAttempts = 0;
      this.showRetryButton = false;
      this.setStatusMessage('Retrying connection...');
      this.leaveStream();
      this.setupSignalingServer();
    }
  }