import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from '../component/Profile/profile.component';
import { ChannelComponent } from '../component/Channel/channel.component';
import { UsersChannelComponent } from '../component/Users-Channel/users-channel.component';
import { VideoComponent } from '../component/Video/video.component';
import { WatchHistoryComponent } from '../component/Hatch-History/watch-history.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared.module';
import { PlaylistsComponent } from '../component/playlists/playlists.component';
import { PVideoComponent } from '../component/p-video/Play-video.component';
import { ShortsComponent } from '../component/shorts/shorts.component';
//import { PremiumComponent } from '../component/premium/premium.component';
import { LiveStreamComponent } from '../component/live-stream/live-stream.component';
// import { LiveStreamViewerComponent } from '../component/live-stream-viewer/live-stream-viewer.component';

const routes: Routes = [
  { path: 'profile', component: ProfileComponent },
  { path: 'channel', component: ChannelComponent },
  { path: 'user-channel/:id', component: UsersChannelComponent },
  { path: 'video/:id', component: VideoComponent, data: { reuse: false } },
  { path: 'Video/:id', component: PVideoComponent, data: { reuse: false } },
  { path: 'playlist', component: PlaylistsComponent },
  { path: 'shorts', component: ShortsComponent },
  //{ path: 'Premium', component: PremiumComponent },
  { path: 'history', component: WatchHistoryComponent },
  { path: 'live-stream', component: LiveStreamComponent },
//  { path: 'watch/:roomId', component: LiveStreamViewerComponent },

  

];

@NgModule({
  declarations: [
    ProfileComponent,
    ChannelComponent,
    UsersChannelComponent,
    VideoComponent,
    PlaylistsComponent,
    WatchHistoryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class UserModule { }