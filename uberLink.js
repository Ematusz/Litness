import AppLink from 'react-native-app-link';

export default class uberLink { 
    constructor(marker) {
        this.marker = marker;
        this.appName = "Uber";
        this.appStoreId = '368677368';
        this.appStoreLocale = 'us';
        this.playStoreId = 'com.ubercab';
    }   
    openUber() {
        console.log(this.marker);
        let appName = this.appName;
        let appStoreId = this.appStoreId;
        let appStoreLocale = this.appStoreLocale;
        let playStoreId = this.playStoreId;
        let address = this.marker.location.address;
        let latitude = this.marker.coordinate.latitude;
        let longitude = this.marker.coordinate.longitude;
        AppLink.maybeOpenURL(
            "uber://?action=setPickup&client_id=Ph99lrMcQyQiLj6rnjQjOYfX28KyKMy6&pickup=my_location&dropoff[formatted_address]="+ address +"&dropoff[latitude]=" + latitude + "&dropoff[longitude]="+ longitude
            , { appName, appStoreId, appStoreLocale, playStoreId }).then(() => {
            console.log("redirected");
            })
      }
  }
