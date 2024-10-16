import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../component/Navbar/navbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChannelVideoComponent } from '../component/channel-video/channel-video.component';
import { ChannelPlaylistComponent } from '../component/channel-playlist/channel-playlist.component';

@NgModule({
  declarations: [NavbarComponent, ChannelVideoComponent,ChannelPlaylistComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [NavbarComponent, ChannelVideoComponent,ChannelPlaylistComponent, CommonModule, FormsModule, ReactiveFormsModule]
})
export class SharedModule { }