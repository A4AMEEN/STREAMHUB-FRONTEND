import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './env/environment';
function bootstrap() {
  platformBrowserDynamic().bootstrapModule(AppModule, {
    ngZoneEventCoalescing: true
  })
  .catch(err => console.error(err));
}

if (environment.production) {
  if (document.readyState === 'complete') {
    bootstrap();
  } else {
    document.addEventListener('DOMContentLoaded', bootstrap);
  }
} else {
  bootstrap();
}