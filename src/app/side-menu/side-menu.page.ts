import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Share } from '@capacitor/share';
import { AlertService } from '../provider/alert.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.page.html',
  styleUrls: ['./side-menu.page.scss'],
})
export class SideMenuPage {

  public appPages = [
    {
      title: 'Home',
      url: '',
      icon: 'home',
      subTitle: 'Back to home'
    },
    {
      title: 'Rate Us',
      url: '/folder/RateUs',
      icon: 'star-half',
      subTitle: "If you love our app. please take a moment to rate and review it in the Google Play Store"
    },
    {
      title: 'Share with Friends',
      url: '/folder/Share',
      icon: 'share-social',
      subTitle: "Support us by sharing the app with friends"
    },
    {
      title: 'More Apps',
      url: '/folder/MoreApps',
      icon: 'apps',
      subTitle: "If you like the app. don't forgot to check out our other apps"
    },
    {
      title: 'Privacy Policy',
      url: '/folder/PrivacyPolicy',
      icon: 'information-circle',
      subTitle: "Read our privacy & policy"
    },
    {
      title: "App version",
      url: "/folder/appVersion",
      icon: "phone-portrait-outline",
      subTitle: "1.0.1"
    }
  ];

  constructor(public alertService: AlertService, private router: Router) { }

  async selectIndex(p: any) {
    if(p.url == '') { // Home
      this.router.navigate(['']);
    } else if(p.url == '/folder/RateUs') {
      window.open(
        'https://play.google.com/store/apps/details?id=com.englishquotes.app',
        '_blank'
      );
    } else if(p.url == '/folder/Share') {
      await Share.share({
        url: 'https://play.google.com/store/apps/details?id=com.englishquotes.app',
      })
    } else if (p.url == '/folder/Feedback') {
      this.router.navigateByUrl("/feedback")
    } else if(p.url == '/folder/MoreApps') {
      window.open('https://play.google.com/store/apps/developer?id=SVInfotech')
    }  else if (p.url == '/folder/PrivacyPolicy') {
      window.open('https://svinfotechapppolicy.000webhostapp.com/')
    }
 
    setTimeout(() => {
      this.getSelectedIndex();
    }, 1000);
  }

  getSelectedIndex() {
    const path = window.location.pathname.split('folder/')[1];
    if (path) {
      this.alertService.selectedIndex = this.appPages.findIndex(
        (page) => page.url.toLowerCase() === `/folder/${path.toLowerCase()}` 
      );
    } else {
      this.alertService.selectedIndex = 0;
    }
  }

}
