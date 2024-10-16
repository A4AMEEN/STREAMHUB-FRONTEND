import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebrtcService {
  private socket: Socket;
  private peerConnection?: RTCPeerConnection;
  private localStream?: MediaStream;
  private remoteStreamSubject = new BehaviorSubject<MediaStream | null>(null);

  private readonly rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      // Add additional STUN/TURN servers here
    ],
  };

  constructor() {
    this.socket = io('http://localhost:5000');
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('offer', (offer: RTCSessionDescriptionInit) => {
      this.handleOffer(offer);
    });

    this.socket.on('answer', (answer: RTCSessionDescriptionInit) => {
      this.handleAnswer(answer);
    });

    this.socket.on('ice-candidate', (candidate: RTCIceCandidateInit) => {
      this.handleIceCandidate(candidate);
    });

    this.socket.on('ready', () => {
      // Both peers have joined the room
      console.log('Room is ready for connection');
    });
  }

  public async setupLocalStream(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      return this.localStream;
    } catch (err) {
      console.error('Error accessing media devices.', err);
      throw err;
    }
  }

  public joinRoom(roomId: string): void {
    this.socket.emit('join-room', roomId);
  }

  public async createOffer(roomId: string): Promise<void> {
    this.initializePeerConnection();
    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);
    this.sendOffer(roomId, offer);
  }

  public async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    this.initializePeerConnection();
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    this.sendAnswer(answer);
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(answer));
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Error adding received ice candidate', err);
    }
  }

  private initializePeerConnection(): void {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    this.localStream?.getTracks().forEach((track) => {
      this.peerConnection!.addTrack(track, this.localStream!);
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendIceCandidate(event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStreamSubject.next(event.streams[0]);
    };
  }

  public getRemoteStream(): Observable<MediaStream | null> {
    return this.remoteStreamSubject.asObservable();
  }

  public sendOffer(roomId: string, offer: RTCSessionDescriptionInit): void {
    this.socket.emit('offer', { room: roomId, offer });
  }

  public sendAnswer(answer: RTCSessionDescriptionInit): void {
    this.socket.emit('answer', { room: this.socket.id, answer });
  }

  public sendIceCandidate(candidate: RTCIceCandidate): void {
    this.socket.emit('ice-candidate', { room: this.socket.id, candidate });
  }

  public onOffer(callback: (offer: RTCSessionDescriptionInit) => void): void {
    this.socket.on('offer', callback);
  }

  public onAnswer(callback: (answer: RTCSessionDescriptionInit) => void): void {
    this.socket.on('answer', callback);
  }

  public onIceCandidate(callback: (candidate: RTCIceCandidateInit) => void): void {
    this.socket.on('ice-candidate', callback);
  }
}