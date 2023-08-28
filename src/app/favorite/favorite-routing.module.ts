import { NgModule } from '@angular/core';
import { Routes} from '@angular/router';
import { RouterModule } from '@angular/router';

import { FavoritePage } from './favorite.page';

const routes: Routes = [
  {
    path: '',
    component: FavoritePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FavoritePageRoutingModule {}
