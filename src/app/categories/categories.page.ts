import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  BannerAdOptions} from '@capacitor-community/admob';
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
} from '@capacitor-community/admob';
import { Preferences } from '@capacitor/preferences';
import { NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

import { base_URL } from '../app-constant';
import { AlertService } from '../provider/alert.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage {
  categories: any[] = [];
  isShow: boolean = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private http: HttpClient,
    private alertService: AlertService
  ) {}

  async ionViewDidEnter() {
    await this.initialize();
    this.banner();
    await this.alertService.presentLoader('');
    await this.readDataFromPref();
  }

  async readDataFromPref() {
    const latestList: any[] = await this.readCategoriesFromDb();
    // get categories list from storage
    const categoriesList: any = await Preferences.get({ key: 'categories' });
    if (categoriesList && !categoriesList.value) {
      if (latestList.length > 0) {
        await Preferences.set({
          key: 'categoriesList',
          value: JSON.stringify(latestList),
        });
        this.categories = latestList;
        await this.alertService.dismissLoader();
        this.isShow = true;
      } else {
        // no one shayari available
        await this.alertService.dismissLoader();
        this.isShow = true;
      }
    } else {
      const prefCategoriesList = JSON.parse(categoriesList.value);
      if (latestList.length > 0) {
        latestList.forEach((element) => {
          const index = prefCategoriesList.findIndex((ele: any) => {
            return ele.key === element.key;
          });
          if (index == -1) {
            prefCategoriesList.push(element);
          }
        });
      }
      this.categories = prefCategoriesList;
      await this.alertService.dismissLoader();
      this.isShow = true;
    }
  }

  async openShayariList(category: any) {
    if (this.isShowBanner) AdMob.removeBanner();
    this.navCtrl.navigateForward(['/folder/home'], {
      queryParams: { category: JSON.stringify(category) },
    });
  }

  async initialize() {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: true,
    });
  }

  isShowBanner: boolean = false;
  banner() {
    try {
      const options: BannerAdOptions = {
        adId: 'ca-app-pub-3228515841874235/2717450061',
        adSize: BannerAdSize.FULL_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: !environment.production,
      };
      AdMob.showBanner(options).then(() => {
        this.isShowBanner = true;
      });
    } catch (err) {}
  }

  ngOnDestroy() {
    if (this.isShowBanner) AdMob.removeBanner();
  }

  readCategoriesFromDb() {
    return new Promise<any>((resolve, reject) => {
      try {
        this.http.get(`${base_URL}categories.json`).subscribe((res) => {
          const list = this.alertService.convertObjToArr(res);
          resolve(list);
        });
      } catch (err) {
        resolve([]);
      }
    });
  }

  async openSettingsPage() {
    this.router.navigate(['/side-menu']);
  }

  closeApp() {
    navigator['app'].exitApp();
  }

  openFavoritePage() {
    if (this.isShowBanner) AdMob.removeBanner();
    this.navCtrl.navigateForward(['/favorite']);
  }
}
