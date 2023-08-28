import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Network } from '@capacitor/network';
import { AlertController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private _location: Location,
    private alertController: AlertController,
  ) {
    this.initializeApp();
    this.platform.backButton.subscribeWithPriority(10, async (res) => {
      if (
        this._location.isCurrentPathEqualTo('/folder/home') ||
        this._location.isCurrentPathEqualTo('')
      ) {
        this.showExitConfirm();
      } else {
        this._location.back();
      }
    });
  }

  showExitConfirm() {
    this.alertController
      .create({
        header: 'Confirmation',
        message: 'Do you want to close the app?',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Stay',
            role: 'cancel',
            handler: () => {},
          },
          {
            text: 'Exit',
            handler: () => {
              navigator['app'].exitApp();
            },
          },
        ],
      })
      .then((alert) => {
        alert.present();
      });
  }

  prefersDark: any;
  toggleData: any;
  async initializeApp() {
    const status = await Network.getStatus();
    if (status && !status.connected) {
      this.showNoNetworksDialog('No Network Connection!');
    }

    Network.addListener('networkStatusChange', (status: any) => {
      if (status) {
        if (!status.connected) {
          this.showNoNetworksDialog('No Network Connection!');
        } else {
          this.alert.dismiss();
        }
      }
    });
  }

  alert: any;
  async showNoNetworksDialog(msg: string, title?: string) {
    this.alert = await this.alertController.create({
      header: title ? title : 'Alert',
      message: msg,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            navigator['app'].exitApp();
          },
        },
      ],
    });
    this.alert.present();
    return alert;
  }

}
