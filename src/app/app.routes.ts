import { Routes } from '@angular/router';

export const AppRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./categories/categories.routes'),
    pathMatch: "full"
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.routes')
  },
  {
    path: 'side-menu',
    loadChildren: () => import('./side-menu/side-menu.routes')
  },
  {
    path: 'favorite',
    loadChildren: () => import('./favorite/favorite.routes')
  }
];
