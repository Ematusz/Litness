import React from 'react';
import {View, SafeAreaView} from 'react-native';
import MasterView from './MasterView.js';
import * as firebase from 'firebase';
import 'firebase/firestore';
import styles from './styles.js';
import { GeoFirestore} from 'geofirestore';
import * as Location from 'expo-location';
import ErrorPage from './ErrorPage'
import {AdMobInterstitial} from 'expo-ads-admob';
import PrivacyPolicyButton from './PrivacyPolicyButton.js';
import { SplashScreen } from 'expo';
import * as FacebookAds from 'expo-ads-facebook';

// FacebookAds.AdSettings.addTestDevice(FacebookAds.AdSettings.currentDeviceHash);

// Initialize Firebase
global.firebaseConfig = {
  apiKey: "AIzaSyD2YhfO1TBYNOAWSxGwXQocAikqLuCRl7Q",
  authDomain: "testing-617da.firebaseapp.com",
  databaseURL: "https://testing-617da.firebaseio.com",
  projectId: "testing-617da",
  storageBucket: "testing-617da.appspot.com",
    //messagingSenderId: "862420802331"
};

global.apiKey = 'AIzaSyD2YhfO1TBYNOAWSxGwXQocAikqLuCRl7Q';

// set API key for location
Location.setApiKey(apiKey)

firebase.initializeApp(firebaseConfig);
global.db = firebase.firestore();

const geofirestore = new GeoFirestore(db);

global.hubs = geofirestore.collection('hubs')

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      pageErrorState: false,
      pageErrorMessage: "Oops! We can't seem to reach our servers. Please check your connection and try again.",
    };
    this.pageErrorHandler = this.pageErrorHandler.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.showInterstitialAd = this.showInterstitialAd.bind(this);
  }

  showInterstitialAd = async() => {
    await AdMobInterstitial.requestAdAsync()
    await AdMobInterstitial.showAdAsync()
  }

  componentDidMount() {
    SplashScreen.preventAutoHide();
    AdMobInterstitial.setAdUnitID('ca-app-pub-9088719879244214/4527962867');
    AdMobInterstitial.setTestDeviceID('EMULATOR');
    AdMobInterstitial.addEventListener("interstitialDidLoad", ()=> console.log("interstitialDidLoad"));
    AdMobInterstitial.addEventListener("interstitialDidFailToLoad", (error)=> {
      console.log(error)
      setTimeout(() => {
        SplashScreen.hide();
      }, 500);
    });
    AdMobInterstitial.addEventListener("interstitialDidOpen", ()=> console.log("interstitialDidOpen"));
    AdMobInterstitial.addEventListener("interstitialDidClose", ()=> {
      console.log("interstitialDidClose");
      SplashScreen.hide();
    });
    AdMobInterstitial.addEventListener("interstitialWillLeaveApplication", ()=> console.log("interstitialWillLeaveApplication"));
    this.showInterstitialAd();
  }

  componentWillUnmount() {
    AdMobInterstitial.removeAllListeners();
  }
  pageErrorHandler(someValue) {
    this.setState({
      pageErrorState: someValue.state
    });
    this.setState({
      pageErrorMessage: someValue.message
    });
  }

  // renders the onscreen info
  render() {
    return (
        <View style = {styles.bigContainer}>   
          {this.state.pageErrorState && <ErrorPage
            error={this.state.pageErrorMessage}
          />} 
          {!this.state.pageErrorState && <MasterView
            pageErrorHandler={this.pageErrorHandler}
            showInterstitialAd={this.showInterstitialAd}
          />}
          {!this.state.pageErrorState && <SafeAreaView style={{flex:1,backgroundColor:'transparent',position:'absolute',top:'92%',height:'8%',width:'100%'}}>
            <View style= {{height:'100%',width:'100%'}}>
              <PrivacyPolicyButton/>
            </View>
          </SafeAreaView>}  
        </View>    
    );
  }
}