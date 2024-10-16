export interface SignupData {
    username: string;
    email: string;
    password: string;
  }
  
  export interface user {
    _id?: string;
    id: string;
    name?:string
    username: string;
    email?:string
    profilePic:string;
  }
  export interface User {
    id: string;
    _id: string;
    username: string;
    email: string;
    role: string;
    isblocked: boolean;
    password: string;
    tokenVersion: number;
    __v: number;
  }
  
  export interface FetchUsersResponse {
    message: string;
    users: User[];
  }

  export interface BlockUserResponse {
    message: string;
    updated: boolean;
    id: string;
    user: User;
  }

  export interface Message{
    error?: string;
    message?:string;
  }

  export interface Otp{
    message?:string;
    email?:string;
    otp?:number;

  }

  export interface OtpResponse {
    message: string;
    email: string;
    otp: string;
  }
  
  export interface otp{
    message:string;
    email:string;
    otp:number|string;

  }
  
    