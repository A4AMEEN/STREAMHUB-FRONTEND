export interface video {
    duration: string;
    _id: string;
    name?:string
    thumbnailUrl: string;
    thumbnail?: string;
    title: string;
    description: string;
    category: VideoCategory;
    channelName: string;
    channelId: string;
    likes: string[]; 
    disLikes: string[];
    views: number;
    timeAgo?: string|number;
    createdAt?: any;
    url: string;
    isListed: boolean;
  }
  export interface ShortVideo {
    _id: string;
    channelId: string;
    title: string;
    url: string;
    duration: string;
    views: number;
    isListed: boolean;
  }
  export interface VideoData {
    _id: string;
    category: string;
    channelId: string;
    channelName?:string
    createdAt: string;
    dislikes: string[];
    likes: string[];
    thumbnail: string;
    title: string;
    url: string;
    views: number;
  }
  export interface Playlist {
    _id: string;
    thumbnail: string;
    name: string;
    description: string;
    videos: VideoData[];
    createdAt: string;
    isPublic: boolean;
    category?: string;
    channelId: string;
    channelName: string;
    views: number;
    title: string;
    url: string;
    creatorId: string;
    creatorName: string;
    isOwnedByUser: boolean;
    duration?: string | number; 
  timeAgo?: string;
  }
  
  export interface PlaylistsResponse {
    _id: string;
    url: string;
    playlists?: Playlist[];
  }
  
  // This interface represents the mapped playlist data
  export interface MappedPlaylist {
    _id: string;
    thumbnail: string;
    name: string;
    description: string;
    videos: any[]; // You might want to define a more specific type for videos
    createdAt: string;
    isPublic: boolean;
    creatorId: string;
    creatorName: string;
    isOwnedByUser: boolean;
  }
 export  interface currVideo {
    _id: string;
    category: string; // The category seems to be an ID, so it's a string
    comments: any[]; // If comments have a specific structure, define it, otherwise use `any[]`
    createdAt: string; // This is an ISO date string
    description: string;
    dislikes: string[]; // Assuming dislikes are an array of user IDs
    isListed: boolean;
    isPrivate: boolean;
    likes: string[]; // Assuming likes are an array of user IDs
    name: string;
    thumbnail: string;
    url: string;
    views: number;
  }
  
 
  
 export   interface VideoCategory {
    _id: string;
    name: string;
  }
  
  export interface curVideo {
    _id: string;
    category?: VideoCategory; // The category seems to be an ID, so it's a string
    createdAt?: string; // This is an ISO date string
    description: string;
    dislikes: string[]; // Assuming dislikes are an array of user IDs
    isListed: boolean;
    isPrivate: boolean;
    likes: string[]; // Assuming likes are an array of user IDs
    name: string;
    thumbnail: string;
    url: string;
    views: number;
    channelId:string
  }

  export interface CurrentVideo {
    _id: string;
    category: VideoCategory;
    channelId: string;
    disLikes: string[];
    likes: string[];
    url?:string
    thumbnail?:string
    description: string;
    name: string;
    channelName:string;
    dislikes: string[];
    views?:number
    isListed: boolean;

    video: {
      _id: string;
      category: VideoCategory;
      comments: any[];
      createdAt: string;
      description: string;
      dislikes: string[];
      isListed: boolean;
      isPrivate: boolean;
      likes: string[];
      name: string;
      thumbnail: string;
      url: string;
      views: number;
    };
    timeAgo: string;
  }
  
  export interface VideoDataResponse {
    video: curVideo;
  }
  
  
  
  export interface Video {
    _id: string;
    thumbnail: string;
    name: string;
    description: string;
    category: any; // Update to a more specific type if you know it
    likes: string[];
    disLikes: string[];
    channelId: string;
    channelName: string;
    profilePic: string;
    views: number;
    url: string;
    timeAgo?: string|number;
    createdAt?: any;
    isListed: boolean;
    isPremiumSubscriber?:string   
  }
  export interface Shorts {
channelProfilePic?: string;
    _id: string;
    thumbnail: string;
    name: string;
    title?:string;
    category?: VideoCategory; // Update to a more specific type if you know it
    likes?: string[];
    disLikes?: string[];
    channelId?: string;
    channelName?: string;
    profilePic?: string;
    views: number;
    url: string;
    timeAgo?: string|number;
    createdAt?: string;
    isListed: boolean;
    isPremiumSubscriber?:any
    message?:string
    duration?:string
  }

  export interface shortsUpdate{
    videoId:string
      title: string
      category: string
  }
  export interface updatePlaylist{
    name:string
    description:string
    category:string
    file:any
  }
  export interface uploadShort{
    name: string
    description:string
    category: string
    file:any 
  }
  export interface VideoResponse {
    videos: Video[];
  }
  export interface ShortResponse {
    videos: Shorts[];
  }
  export interface WVideo {
    _id?: string;
    category?: string;
    channelId?: string;
    channelName?: string;
    channelProfilePic?: string;
    disLikes?: string[]; // Array of user IDs that disliked the video
    likes?: string[];    // Array of user IDs that liked the video
    thumbnail?: string;
    title?: string;
    url?: string;
    views?: number;
  }
  export interface WatchHistoryResponse {
    watchHistory: WatchHistory[];
  }
  export interface WatchHistory {
    _id: string;
    category: string;
    channelId: string;
    channelName: string;
    channelProfilePic?: string; // Optional based on availability
    disLikes: string[]; // Can be typed more specifically if you know the structure
    likes: string[]; // Assuming it's an array of user IDs who liked the video
    thumbnail: string;
    title: string;
    url: string;
    views: number;
  }

  export interface ShortsResponse {
    videos: video[];
  }
    
  export interface Category {
    _id: string;
    name: string;
  }
  
  export interface videoTrack {
    _id: string;
    thumbnailUrl: string;
    title: string;
    description: string;
    category: Category | null;
    channelId: string;
    channelName: string;
    likes?: string[]; 
    disLikes?: string[]; 
    profilePic: string;
    views: string;
    timeAgo: string;
    createdAt?: any;
    url: string;
    isListed: boolean;
  }

  export interface VideoActionResponse {
    isLiked: boolean;
    isDisliked: boolean;
    likeCount: number;
    dislikeCount: number;
  }
  
  
  