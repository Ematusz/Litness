import AppLink from 'react-native-app-link';

export default class lyftLink { 
    constructor(marker,userLocation) {
        this.marker = marker;
        this.userLocation = userLocation;
        this.appName = "Lyft";
        this.appStoreId = '529379082';
        this.appStoreLocale = 'us';
        this.playStoreId = 'me.lyft.android';
    }   
    openLyft() {
        console.log(this.marker);
        let appName = this.appName;
        let appStoreId = this.appStoreId;
        let appStoreLocale = this.appStoreLocale;
        let playStoreId = this.playStoreId;
        let pickupLatitude = this.userLocation.latitude;
        let pickupLongitude = this.userLocation.longitude;
        let destinationLatitude = this.marker.coordinate.latitude;
        let destinationLongitude = this.marker.coordinate.longitude;
        AppLink.maybeOpenURL(
            "lyft://ridetype?id=lyft&pickup[latitude]="+pickupLatitude+"&pickup[longitude]="+pickupLongitude+"&destination[latitude]="+destinationLatitude+"&destination[longitude]="+destinationLongitude
            , { appName, appStoreId, appStoreLocale, playStoreId }).then(() => {
            console.log("redirected");
            })
      }
  }