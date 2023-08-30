import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { PreloadAllModules, RouteReuseStrategy, RouterModule } from '@angular/router';
import { NavParams, IonicRouteStrategy, IonicModule } from '@ionic/angular';
import { AppRoutes } from './app/app.routes';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, IonicModule.forRoot(), FormsModule,
        RouterModule.forRoot(AppRoutes, { preloadingStrategy: PreloadAllModules }),),
        NavParams, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideHttpClient(withInterceptorsFromDi()),
    ]
})
  .catch(err => console.log(err));
