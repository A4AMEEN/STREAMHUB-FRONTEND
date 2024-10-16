import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../env/environment';
import { AuthService } from './auth.service';
import { Channel, PlayList, Playlist, RestrictChannelResponse } from '../component/Types/channelTypes';

@Injectable({
  providedIn: 'root'
})
export class channelService {
  private baseUrl = environment.BASE_URL;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getChannelData(): Observable<Channel> {
    const userId = this.authService.getCurrentUserId();
    //if (!userId) {
   //   throw new Error('User ID not available');
    //}
    return this.http.get<Channel>(`${this.baseUrl}channel/getChannelData/${userId}`);
  }

  getAllChannels(): Observable<{ showChannels: { _id: string; channelName: string; }[] }> {
    return this.http.get<{ showChannels: { _id: string; channelName: string; }[] }>(
      `${this.baseUrl}channel/getChannels`
    );
  }

  getAllChannelsAdmin(): Observable<{ showChannels: { _id: string; channelName: string; }[] }> {
    return this.authService.adminRequest('/getChannels', 'get');
  }

  restrictChannel(channelId: string): Observable<RestrictChannelResponse> {
    return this.authService.adminRequest(`/restrictchannel/${channelId}`, 'put');
  }

  getChannelById(channelId: string): Observable<Channel> {
    const url = `${this.baseUrl}channel/getChannelById/${channelId}`;
    console.log("Full URL:", url);
    return this.http.get<Channel>(url).pipe(
      tap(response => console.log("Response from getChannelById:", response)),
      catchError(error => {
        console.error("Error in getChannelById:", error);
        return throwError(() => error);
      })
    );
  }

  updateChannelName(channelId: string, newName: string): Observable<Channel> {
    return this.http.put<Channel>(
      `${this.baseUrl}channel/updateName/${channelId}`,
      { newName: newName }
    );
  }

  updateProfilePic(channelId: string, file: File): Observable<Channel> {
    const formData = new FormData();
    formData.append('profilePic', file);
     
    return this.http.put<Channel>(
      `${this.baseUrl}channel/updateProfilePic/${channelId}`,
      formData
    );
  }

  updateBanner(channelId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('banner', file);

    return this.http.put<any>(
      `${this.baseUrl}channel/updateBanner/${channelId}`,
      formData
    );
  }

  getChannelVideos(channelId: string): Observable<Channel>   {
    return this.http.get<Channel>(
      `${this.baseUrl}channel/videos/${channelId}`
    );
  }

  getChannelShorts(channelId: string): Observable<Channel> {
    return this.http.get<Channel>(
      `${this.baseUrl}channel/shorts/${channelId}`
    );
  }

  getChannelPlaylists(channelId: string): Observable<{ playlists: Playlist[] }> {
    return this.http.get<{ playlists: Playlist[] }>(`${this.baseUrl}channel/playlists/${channelId}`);
  }
  subscribeToChannel(channelId: string): Observable<Channel> {
    const userId = this.authService.getCurrentUserId();
    console.log("idpass", userId);
    
    //if (!userId) {
   //   throw new Error('User ID not available');
    //}
    return this.http.post<Channel>(`${this.baseUrl}channel/subscribe`, { userId, channelId });
  }
  startLive(channelId:string,link: string): Observable<Channel> {
    return this.http.post<Channel>(`${this.baseUrl}channel/startLive`, {channelId,link });
  }
  stopLive(channelId:string): Observable<Channel> {
    return this.http.post<Channel>(`${this.baseUrl}channel/stopLive`, {channelId });
  }

  unsubscribeFromChannel(channelId: string): Observable<Channel> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      console.error('User ID not available');
      
        }
    return this.http.post<Channel>(`${this.baseUrl}channel/unsubscribe`, { userId, channelId });
  }

  checkSubscriptionStatus(channelId: string, userId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}channel/checkSubscription/${channelId}/${userId}`);
  }
  verifySuperUserPayment(paymentResponse: any, plan: string,channelId:string,): Observable<Channel> {
    const userId = this.authService.getCurrentUserId();

    if (!userId) {
      return throwError(() => new Error('User ID not available'));
    }
    console.log("payments",channelId);
    console.log("payments2",userId);
    console.log("payments3",paymentResponse,plan,channelId,userId);
    return this.http.post<Channel>(`${this.baseUrl}channel/verifySuperUserPayment`, { paymentResponse, plan,channelId,userId });
  }

  getToken(roomName: string, participantName: string): Observable<any> {
    console.log("ongoing");
    
    return this.http.post<{ token: any }>(`${this.baseUrl}channel/live`, { roomName, participantName });
  }

  
}