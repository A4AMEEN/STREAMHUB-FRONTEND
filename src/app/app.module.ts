
import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './component/Landing/landing.component';
import { HeaderComponent } from './component/Header/header.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/httpInterceptor';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './component/Reusables/toast.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorResponseInterceptor } from './interceptors/errorHandlerInterceptor';
import { ToastrModule } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DeleteConfirmationDialogComponent } from './component/Reusables/conformation.component';
import { ActionConfirmationDialogComponent } from './component/Reusables/actionConform.component';
import { ErrorDialogComponent } from './component/Reusables/error.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './modules/shared.module';
import { PVideoComponent } from './component/p-video/Play-video.component';
import { ShortsComponent } from './component/shorts/shorts.component';
import { PremiumComponent } from './component/premium/premium.component';
import { LiveStreamComponent } from './component/live-stream/live-stream.component';
import { AuthComponent } from './component/auth/auth.component';
import { LiveStreamViewerComponent } from './component/live-stream-viewer/live-stream-viewer.component';
import { StreamViewerComponent } from './component/stream-viewer/stream-viewer.component';
import { StreamerComponent } from './component/streamer/streamer.component';
import { ViewerComponent } from './component/viewer/viewer.component';
import { VideoChatComponent } from './component/video-chat/video-chat.component';
import { VideoViewerComponent } from './component/video-viewer/video-viewer.component';



@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    HeaderComponent,
    ToastComponent,
    DeleteConfirmationDialogComponent,
    ActionConfirmationDialogComponent,
    ErrorDialogComponent,
    PVideoComponent,
    ShortsComponent,
    PremiumComponent,
    LiveStreamComponent,
    AuthComponent,
    LiveStreamViewerComponent,
    StreamViewerComponent,
    StreamerComponent,
    ViewerComponent,
    VideoChatComponent,
    VideoViewerComponent,
    //PlaylistVideosComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    SharedModule
  ],
  providers: [
    provideClientHydration(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorResponseInterceptor, multi: true },
    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }