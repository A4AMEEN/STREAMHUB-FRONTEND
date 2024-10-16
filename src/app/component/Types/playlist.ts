// Base Video interface matching the API response
export interface Video {
    _id: string;
    channelId: string;
    title: string;
    url: string;
    views: number;
    createdAt: string;
    likes: string[];
    dislikes: string[];
    category?: string;
    thumbnail?: string;
    channelName?: string;
    comments?: any[];
    description?: string;
    isListed?: boolean;
    isPremiumSubscriber?: string;
    // Add any other optional properties that might be present in the API response
  }
  
  // ProcessedVideo interface extending Video
  export interface ProcessedVideo extends Video {
    thumbnailOrDuration: string;
    timeAgo: string;
  }
  
  // Response interface for getPlaylistVideos
  export interface PlaylistVideosResponse {
    videos: Video[];
  }