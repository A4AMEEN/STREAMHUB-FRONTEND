// Existing Playlist interface
export interface Playlists {
    _id: string;
    thumbnail: string;
    name: string;
    description: string;
    videos: Video[];
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
  }
  
  // Video interface
  export interface Video {
    _id: string;
    category: string;
    channelId: string;
    createdAt: string;
    dislikes: string[];
    likes: string[];
    thumbnail: string;
    title: string;
    url: string;
    views: number;
  }
  
  // ProcessedVideo interface
  export interface ProcessedVideo extends Video {
    thumbnailOrDuration: string;
    timeAgo: string;
  }
  
  // Response interface for getPlaylistVideos
  export interface PlaylistVideosResponse {
    videos: Video[];
  }