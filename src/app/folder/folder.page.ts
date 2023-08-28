import { HttpClient } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AdOptions,
  BannerAdOptions} from '@capacitor-community/admob';
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
} from '@capacitor-community/admob';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Clipboard } from '@capacitor/clipboard';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import { environment } from 'src/environments/environment';

import { base_URL } from '../app-constant';
import  { AlertService } from '../provider/alert.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  categoryData: any;
  isFav: boolean = false;
  isShow: boolean = false;
  filterList: any[] = [];
  shayariList: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private alertService: AlertService
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params['category']) {
        this.categoryData = JSON.parse(params['category']);
      }
    });
  }

  async showInterstitial() {
    const options: AdOptions = {
      adId: 'ca-app-pub-3228515841874235/8618042809',
      isTesting: !environment.production
    };
    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
  }

  async ngOnInit() {
    await this.initialize();
    this.banner();
    await this.showInterstitial();
  }

  async gotoBack() {
    await this.stopTextToSpeech();
    this.router.navigateByUrl('');
  }

  async ionViewDidEnter() {
    await this.alertService.presentLoader('');
    await this.readDataFromPref();
  }

  async readDataFromPref() {
    let latestList: any[] = [];
    latestList = await this.readShayariFromDb();
    // get shayari list from storage
    const shayariList: any = await Preferences.get({ key: 'favoriteShayari' });
    if (shayariList && !shayariList.value) {
      if (latestList.length > 0) {
        this.filterList = latestList;
      }
      await this.alertService.dismissLoader();
      this.isShow = true;
    } else {
      let prefShayariList = JSON.parse(shayariList.value);
      if (this.categoryData) {
        prefShayariList = prefShayariList.filter((shayari: any) => {
          return shayari.categoryId == this.categoryData.key;
        });
      }
      if (latestList.length > 0) {
        latestList.forEach((element) => {
          const index = prefShayariList.findIndex((ele: any) => {
            return ele.key === element.key;
          });
          if (index == -1) {
            prefShayariList.push({...element, isFav: false});
          } else {
            prefShayariList[index].isFav = true;
          }
        });
      }
      this.filterList = prefShayariList;
      this.filterList = this.filterList.map(shayari => {
        shayari.isPlay = false;
        return shayari;
      })
      await this.alertService.dismissLoader();
      this.isShow = true;
    }

  }

  async initialize() {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: true,
    })
  }

  isShowBanner: boolean = false;
  banner() {
    try {
      const options: BannerAdOptions = {
        adId: 'ca-app-pub-3228515841874235/7778205051',
        adSize: BannerAdSize.FULL_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: !environment.production
      };
      AdMob.showBanner(options).then(
        () => {
          this.isShowBanner = true;
        });
     } catch (err) {
     }
  }

  async stopTextToSpeech() {
    await TextToSpeech.stop();
    this.filterList.map(item => {
      item.isPlay = false
    })
  }

  async ngOnDestroy() {
    if(this.isShowBanner) AdMob.removeBanner()
    await this.stopTextToSpeech();
  }

  readShayariFromDb() {
    return new Promise<any>((resolve, reject) => {
      try {
        this.http
          .get(
            `${base_URL}quotes/${this.categoryData.key}.json`
          )
          .subscribe(
            (res) => {
              let list: any[] = [];
              if (res) list = this.alertService.convertObjToArr(res);
              if (list.length > 0) {
                list.forEach((element) => {
                  element.categoryId = this.categoryData.key;
                });
              }
              resolve(list);
            });
      } catch (err) { 
        resolve([]);
      }
    });
  }

  // Copy quote
  copyClipboard(shayari: any) {
    Clipboard.write({ string: this.alertService.removeBrFromStr(shayari.name) });
  }

  // Bookmark
  async favorite(shayari: any) {
    shayari.isFav = !shayari.isFav;
    const index = this.filterList.findIndex((ele) => {
      return ele.key == shayari.key;
    });
    if (index > -1) {
      this.filterList[index] = shayari;
    }
    await this.setShayariInPref(shayari);
  }


  async setShayariInPref(shayari: any) {
    let list: any[] = [];
    const prefData: any = await Preferences.get({ key: 'favoriteShayari' });
    if (prefData && !prefData.value) {
      list.push(shayari);
    } else {
      list = JSON.parse(prefData.value);
      const index = list.findIndex((element) => {
        return element.key == shayari.key;
      });
      if (index > -1) {
        list.splice(index, 1);
      } else {
        list.push(shayari);
      }
    }
    await Preferences.set({ key: 'favoriteShayari', value: JSON.stringify(list) });
  }

  // Social Share
  socialShare(shayari: any) {
    Share.share({ text: this.alertService.removeBrFromStr(shayari.name) });
  }

  isPlayRunning: boolean = false;
  async speak(shayari: any) {
    if(shayari.isPlay) return;
    shayari.isPlay = true;
    const obj = {
      text: shayari.name.replace(/<br\s*\/?>/gi,''),
      lang: 'hi-IN',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: 'ambient',
    }
    TextToSpeech.speak(obj).then(res => {
      shayari.isPlay = false;
    })

    this.filterList.map(item => {
      if(item.key != shayari.key) item.isPlay = false
    })

  }

  async stopSpeaking(shayari: any) {
    await TextToSpeech.stop();
    shayari.isPlay = false;
  }
}
