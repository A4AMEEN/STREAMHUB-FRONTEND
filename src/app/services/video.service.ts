import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../env/environment';
import { AuthService } from './auth.service';
import { CurrentVideo, PlaylistsResponse, ShortResponse, Shorts, ShortsResponse, shortsUpdate, updatePlaylist, uploadShort, video, VideoActionResponse, VideoResponse, WatchHistoryResponse } from '../component/Types/videoTypes';
import { Message } from '../component/Types/userTypes';
import { PlayList, updateVideo, Video } from '../component/Types/channelTypes';
import { PlaylistVideosResponse } from '../component/Types/categoryTypes';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private baseUrl = environment.BASE_URL;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getVideoById(videoId: string): Observable<CurrentVideo> {
    console.log("getVideoById in servixe",videoId);
    
    
    
    return this.http.get<CurrentVideo>(`${this.baseUrl}video/video/${videoId}`, { headers: this.getHeaders() });
  }
  getRecommendedVideos(categoryId: string): Observable<video[]> {
    console.log("Category ID in service:", categoryId);
    const url = `${this.baseUrl}video/recommended/${categoryId}`;
    console.log("Request URL:", url);
    return this.http.get<video[]>(url);
  }

  likeVideo(videoId: string): Observable<VideoActionResponse> {
    const userId = this.authService.getCurrentUserId();
    console.log("idpass",userId);
    
    if (!userId) {
      throw new Error('User ID not available');
    }
    return this.http.post<VideoActionResponse>(`${this.baseUrl}video/like`, {videoId,userId},{ headers: this.getHeaders() });
  }

  unlikeVideo(videoId: string): Observable<VideoActionResponse> {
    const userId = this.authService.getCurrentUserId();
    console.log("idpass", userId);
  
    if (!userId) {
      throw new Error('User ID not available');
    }
    return this.http.post<VideoActionResponse>(`${this.baseUrl}video/unlike`, {videoId, userId}, { headers: this.getHeaders() });
  }

  dislikeVideo(videoId: string): Observable<VideoActionResponse> {
    const userId = this.authService.getCurrentUserId();
    console.log("idpass", userId);
  
    if (!userId) {
      throw new Error('User ID not available');
    }
    return this.http.post<VideoActionResponse>(`${this.baseUrl}video/dislike`, {videoId,userId}, { headers: this.getHeaders() });
  }

  undislikeVideo(videoId: string): Observable<VideoActionResponse>{
    const userId = this.authService.getCurrentUserId();
    console.log("idpass", userId);
  
    if (!userId) {
      throw new Error('User ID not available');
    }
    return this.http.post<VideoActionResponse>(`${this.baseUrl}video/undislike`, {videoId,userId}, { headers: this.getHeaders() });
  }

  getLikeStatus(videoId: string): Observable<{ isLiked: boolean; isDisliked: boolean; likes: string[]; dislikes: string[]; }> {
    const userId = this.authService.getCurrentUserId();
    console.log("idpasszzzzzzzzzzzzzzz", userId,videoId);
    
    if (!userId) {
      throw new Error('User ID not available');
    }
    
    return this.http.get<{ isLiked: boolean; isDisliked: boolean; likes: string[]; dislikes: string[]; }>(
      `${this.baseUrl}video/likeStatus`,
      {
        params: { videoId, userId },
        headers: this.getHeaders()
      }
    );
  }

  uploadVideo(videoData: any, channelId: string): Observable<Video> {
    console.log('vidodata',videoData);
    
    const formData = new FormData();
    formData.append('video', videoData.file);
    formData.append('name', videoData.name);
    formData.append('description', videoData.description);
    formData.append('category', videoData.category);
    formData.append('channelId', channelId);
  
    return this.http.post<Video> (
      `${this.baseUrl}video/uploadVideo`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  uploadShort(shortData: uploadShort, channelId: string): Observable<Shorts> {
    console.log('shortdata', shortData);
    
    const formData = new FormData();
    formData.append('video', shortData.file);
    formData.append('name', shortData.name);
    formData.append('category', shortData.category);
    formData.append('channelId', channelId);
    formData.append('isShort', 'true');
  
    return this.http.post<Shorts>(
      `${this.baseUrl}video/uploadShort`,
      formData
    );
  }

  createPlaylist(formData: FormData): Observable<PlayList> {
    return this.http.post<PlayList>(
      `${this.baseUrl}video/create`,
      formData,
      { 
        headers: this.getHeaders()
      }
    );
  }
  getChannelPlaylists(channelId: string): Observable<PlayList> {
    return this.http.get<PlayList>(`${this.baseUrl}channel/playlists/${channelId}`);
  }

  getAllPlaylists(): Observable<PlaylistsResponse> {
    return this.http.get<PlaylistsResponse>(`${this.baseUrl}video/playlists`);
  }

  uploadVideoToPlaylist(videoData: updatePlaylist, channelId: string, playlistId: string): Observable<video> {
    const formData = new FormData();
    formData.append('video', videoData.file);
    formData.append('name', videoData.name);
    formData.append('description', videoData.description);
    formData.append('channelId', channelId);
    formData.append('playlistId', playlistId);

    return this.http.post<video>(
      `${this.baseUrl}video/uploadVideoToPlaylist`,
      formData
    );
  }
  updatePlaylist(formData: FormData): Observable<PlayList> {
    return this.http.put<PlayList>(
      `${this.baseUrl}video/updatePlaylist`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  deletePlaylist(playlistId: string): Observable<Message> {
    return this.http.delete(
      `${this.baseUrl}video/deletePlaylist/${playlistId}`,
      { headers: this.getHeaders() }
    );
  }

  togglePlaylistVisibility(playlistId: string): Observable<PlayList> {
    return this.http.put<PlayList>(
      `${this.baseUrl}video/togglePlaylistVisibility/${playlistId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getAllVideos(userId?: string): Observable<VideoResponse> {
    const url = userId ? `${this.baseUrl}video/all?userId=${userId}` : `${this.baseUrl}video/all`;
    return this.http.get<VideoResponse>(url);
  }
  
  getShortsVideos(): Observable<ShortsResponse> {
    return this.http.get<ShortsResponse>(`${this.baseUrl}video/allShorts`);
  }
  

  addToWatchHistory(videoId: string): Observable<Message> {
    const userId = this.authService.getCurrentUserId();
    // if (!userId) {
    //   throw new Error('User ID not available');
    // }
    return this.http.post(`${this.baseUrl}video/watch-history`, { videoId, userId }, { headers: this.getHeaders() });
  }

    getWatchHistory(): Observable<WatchHistoryResponse> {
      const id = this.authService.getCurrentUserId();
      // if (!id) {
      //   throw new Error('User ID not available');
      // }
      return this.http.get<WatchHistoryResponse>(`${this.baseUrl}video/watch-History/${id}`, { headers: this.getHeaders() });
    }
    getPlaylistVideos(playlistId: string, channelId: string): Observable<PlaylistVideosResponse> {
      console.log("channel",channelId);
      console.log("playlist",playlistId);
      
      const params = new HttpParams().set('channelId', channelId);
      return this.http.get<PlaylistVideosResponse>(`${this.baseUrl}video/playlistVideo/${playlistId}`, {
        params: params
      });
    }

  updateVideoListing(videoId:string,action:boolean): Observable<Message> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User ID not available');
    }
    return this.http.put<Message>(`${this.baseUrl}video/listUnlist`, {videoId,action},{ headers: this.getHeaders() });
    
  }

  updateVideo(updateData: updateVideo): Observable<updateVideo> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User ID not available');
    }
    console.log("for serve,",updateData);
    
    return this.http.put<updateVideo>(`${this.baseUrl}video/updateVideo`, updateData);
  }
  updateShorts(updateData: shortsUpdate): Observable<shortsUpdate> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User ID not available');
    }
    console.log("updatehsotdtata",updateData);
    
    return this.http.put<shortsUpdate>(`${this.baseUrl}video/updateShorts`, updateData);
  }

  deleteVideo(videoId:string):Observable<Message>{
    return this.http.delete<Message>(`${this.baseUrl}video/delete/${videoId}`)
  }
  deleteShorts(videoId:string):Observable<Message>{
    return this.http.delete<Message>(`${this.baseUrl}video/deleteShorts/${videoId}`)
  }
  
  addComment(videoId:string,comment:string):Observable<boolean>{
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User ID not available');
    }
    return this.http.post<boolean>(`${this.baseUrl}video/comment`,{videoId,comment,userId})
  }
  deleteComment(commentId:string,videoId:string):Observable<boolean>{
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User ID not available');
    }
    return this.http.post<boolean>(`${this.baseUrl}video/deleteComment`,{commentId,videoId})
  }
  
  
  getComments(videoId: string): Observable<any[]> {
    console.log("blaaaah",videoId);
    
    
    
    return this.http.get<any[]>(`${this.baseUrl}video/getComments/${videoId}`, { headers: this.getHeaders() });
  }
  incrementViewCount(id: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}video/view`, {id});
  }
}
