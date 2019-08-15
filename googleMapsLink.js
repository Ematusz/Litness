import {Platform} from 'react-native';
import AppLink from 'react-native-app-link';
// import Hub from './Hub.js'

export default class googleMapsLink { 
    constructor(marker) {
        this.marker = marker;
        this.appName = Platform.OS === 'ios' ? 'Google Maps - Transit & Food' : 'Maps';
        this.appStoreId = '585027354';
        this.appStoreLocale = 'us';
        this.playStoreId = 'com.google.android.apps.maps';
    }   
    openMaps() {
        let appName = this.appName;
        let appStoreId = this.appStoreId;
        let appStoreLocale = this.appStoreLocale;
        let playStoreId = this.playStoreId;
        let address = this.marker.location.address;
        AppLink.maybeOpenURL("https://www.google.com/maps/dir/?api=1&destination="+address+"&travelmode=driving" , { appName, appStoreId, appStoreLocale, playStoreId }).then(() => {
          console.log("redirected");
        })
      }
  }