export interface Category {
    _id: string;
    name: string;
  }
  
  export interface navVid{
    name: string
    description: string
    category: string
    file: File,
  }

  export interface editShorts {
    _id: string;
    thumbnail: string;
    name: string;
    title?: string; // Optional
    category?: any; // Optional
    likes?: string[];
    disLikes?: string[];
    channelId?: string;
    channelName?: string;
    profilePic?: string;
    views: number;
    url: string;
    duration?: string; // Optional
  }
  
  export interface Video {

    _id: string;
    category?: any;
    channelId: string;
    channelName?: string;
    comments?: any[]; // Define a proper interface if you have details for comments
    description?: string;
    dislikes?: string[]; // Same here, define a proper interface if neededddd
    isListed?: boolean;
    isPrivate?: boolean;
    name?: string;
    profilePic?: string;
    thumbnail?: string;
    thumbnailUrl?: string;
    url: string;
    title?:string
    userName?: string;
    views?: string|number;
    timeAgo?: any;
    createdAt?: any;
    likes?: string[];
    duration?:string
    message?:string;
    isPremiumSubscriber?:any 
  }
  export interface CVideo {

    _id: string;
    category?: any;
    channelId: string;
    channelName?: string;
    comments?: any[]; // Define a proper interface if you have details for comments
    description?: string;
    dislikes?: string[]; // Same here, define a proper interface if needed
    isListed?: boolean;
    isPrivate?: boolean;
    name?: string;
    profilePic?: string;
    thumbnail?: string;
    url: string;
    title?:string
    userName?: string;
    views?: string|number;
    timeAgo?: any;
    createdAt?: any;
    likes?: string[];
    duration?:string
    message?:string;
    isPremiumSubscriber:any 
  }

  export interface mapVideo {
    _id?: string | undefined;
    category?: any | undefined;
    channelId?: string | undefined;
    channelName?: string | undefined;
    comments?: any[] | undefined; // Define a proper interface for comments if needed
    description?: string | undefined;
    dislikes?: string[] | undefined; // Define a proper interface if needed
    isListed?: boolean | undefined;
    isPrivate?: boolean | undefined;
    name?: string | undefined;
    profilePic?: string | undefined;
    thumbnail?: string | undefined;
    url?: string | undefined;
    title?: string | undefined;
    userName?: string | undefined;
    views?: any | undefined;
    timeAgo?: any | undefined;
    createdAt?: any | undefined;
    likes?: string[] | undefined; // Optional field as it was only found in some items
  }
  
  export interface TChannel {
    _id: string;
    name?:string
    banner: string;
    channelName: string;
    isRestricted: boolean;
    playlists: Playlist[];
    profilePic: string;
    shorts: Video[];
    subscribers: string[]; // Array of user IDs
    subscriptions: string[];
    user: string; // User ID
    videos: Video[];
    watchHistory: string[]; // Array of video IDs
    __v: number;
  }
  export interface navVideo {
    title: string;
    _id: string;
    category: Category | null;
    channelId: string;
    channelName: string;
    comments: any[]; // Define a proper interface if you have details for comments
    description: string;
    dislikes: string[]; // Same here, define a proper interface if needed
    isListed: boolean;
    isPrivate: boolean;
    name: string;
    profilePic: string;
    thumbnail: string;
    url: string;
    userName: string;
    views: number;
    timeAgo?: any;
    createdAt?: any;
    likes?: string[]; // Optional field as it was only found in some items
  }
  export interface Playlist {
    _id: string;
    thumbnail: string;
    name: string;
    title: string;
    description: string;
    videos: any[];
    createdAt: string;
    isPublic: boolean;
    category?: string;
    channelId: string;
    channelName: string;
    views: number;
    url: string;
    creatorId: string;
    creatorName: string;
    isOwnedByUser: boolean;
    message?: string;
  }
  
  export interface PlaylistsResponse {
    playlists: Playlist[];
  }
    export interface PlayList {
      channelId: string;
      channelName: string;
      creatorId: string;
      message?:string
      _id: string;
      name: string;
      description: string;
      thumbnail: string;
      videos: any[]; // You can replace 'any' with a proper type for videos if available
      createdAt: string; // This is a date string, consider using Date if you prefer
      isPublic: boolean;
      category?: string;
    }
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
  export interface editPlaylist{
      _id: string;
      name?: string;  // Make it optional
      description?: string;  // Make it optional
      thumbnail?: string;  // Make it optional
      videos: any[];
      createdAt?: string;
      isPublic?: boolean;
      category?: string;  // Make it optional
      message?: string;  // Make it optional
  }
  
  export interface updateVideo{
    videoId: string
      title:string
      description: string
      category: string
  }
  export interface Channel {
    channel: Channel;
    _id: string;
    name?:string
    user?:string
    liveId?:string
    channelName: string;
    profilePic: string;
    bannerImage?:string
    banner: string;
    isRestricted: boolean;
    subscribers: string[];
    subscriptions: any[]; // Define a proper interface if needed
    videos: any[]; // Define a proper interface if needed
    playlists: any[]; // Define a proper interface if needed
    watchHistory: any[]; // Define a proper interface if needed
    __v: number;
  }

  // export interface ChannelData {
  //   _id: string;
  //   user: string;
  //   channelName: string;
  //   subscribers: string[];
  //   profilePic: string;
  //   banner: string;
  //   isRestricted: boolean;
  //   videos: Video[]; 
  //   playlists: any[];
  //       watchHistory: string[];
  //   __v: number;
  // }

  export interface ChannelData {
    _id: string;
    name?: string;
    profilePic: string;
    bannerImage?: string;
    subscribers: number;
    isRestricted: boolean;
  }

  export interface MinimalChannelData {
    _id: string;
    channelName: string;
  }
  
  
  
  export interface ChannelResponse {
    videos?: Video[];
    playlists?: any[];
    channels?: Channel[];
    showChannels?: { _id: string; channelName: string; }[];
  }

  
  export interface RestrictChannelResponse {
    message: string;
    channel: Channel;
  }

  export interface Message{
    _id: string;
    message:string;
  }
  
  
  
  