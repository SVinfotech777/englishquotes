import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

import { AlertService } from '../provider/alert.service';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.page.html',
  styleUrls: ['./favorite.page.scss'],
})
export class FavoritePage implements OnInit {
  categoryData: any;
  isFav: boolean = false;
  isShow: boolean = false;
  filterList: any[] = [];
  shayariList: any[] = [];

  constructor(private router: Router, private alertService: AlertService) {}

  async initialize() {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: true,
    });
  }

  async ngOnInit() {
    await this.initialize();
    this.banner();
    await this.showInterstitial();
  }

  isShowBanner: boolean = false;
  banner() {
    try {
      const options: BannerAdOptions = {
        adId: 'ca-app-pub-3228515841874235/5504794300',
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

  async ionViewDidEnter() {
    const favoriteShayariList = await Preferences.get({ key: 'favoriteShayari' });
    if (favoriteShayariList && favoriteShayariList.value) {
      this.filterList = JSON.parse(favoriteShayariList.value);
      this.isShow = true;
    }
  }

  async stopTextToSpeech() {
    await TextToSpeech.stop();
    this.filterList.map((item) => {
      item.isPlay = false;
    });
  }

  async gotoBack() {
    await this.stopTextToSpeech();
    this.router.navigateByUrl('');
  }

  // Copy quote
  copyClipboard(shayari: any) {
    Clipboard.write({
      string: this.alertService.removeBrFromStr(shayari.name),
    });
  }

  // Social Share
  socialShare(shayari: any) {
    Share.share({ text: this.alertService.removeBrFromStr(shayari.name) });
  }

  isPlayRunning: boolean = false;
  async speak(shayari: any) {
    if (shayari.isPlay) return;
    shayari.isPlay = true;
    const obj = {
      text: shayari.name.replace(/<br\s*\/?>/gi, ''),
      lang: 'hi-IN',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: 'ambient',
    };
    TextToSpeech.speak(obj).then((res) => {
      shayari.isPlay = false;
    });

    this.filterList.map((item) => {
      if (item.key != shayari.key) item.isPlay = false;
    });
  }

  async stopSpeaking(shayari: any) {
    await TextToSpeech.stop();
    shayari.isPlay = false;
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
    await this.setShayariInPref(shayari, index);

    //
    if (!shayari.isFav) {
      this.filterList = this.filterList.filter((ele) => {
        return ele.hasOwnProperty('isFav') || ele.isFav;
      });
    }
  }

  async setShayariInPref(shayari: any, i: number) {
    shayari.isFav = !shayari.isFav;
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
        this.filterList.splice(i, 1);
      } else {
        list.push(shayari);
      }
    }
    await Preferences.set({
      key: 'favoriteShayari',
      value: JSON.stringify(list),
    });
  }

  async showInterstitial() {
    const options: AdOptions = {
      adId: 'ca-app-pub-3228515841874235/7160092108',
      isTesting: !environment.production,
    };
    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
  }
}
