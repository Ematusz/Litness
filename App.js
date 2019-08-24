import React from 'react';
import {View, SafeAreaView} from 'react-native';
import MasterView from './MasterView.js';
import * as firebase from 'firebase';
import 'firebase/firestore';
import styles from './styles.js';
import { GeoFirestore} from 'geofirestore';
import * as Location from 'expo-location';
import ErrorPage from './ErrorPage'

// Initialize Firebase
global.firebaseConfig = {
  apiKey: "AIzaSyD2YhfO1TBYNOAWSxGwXQocAikqLuCRl7Q",
  authDomain: "testing-617da.firebaseapp.com",
  databaseURL: "https://testing-617da.firebaseio.com",
  projectId: "testing-617da",
  storageBucket: "testing-617da.appspot.com",
    //messagingSenderId: "862420802331"
};

// set API key for location
Location.setApiKey('AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE')

firebase.initializeApp(firebaseConfig);
global.db = firebase.firestore();

const geofirestore = new GeoFirestore(db);

global.hubs = geofirestore.collection('hubs')


// const uniqueId = DeviceInfo.getUniqueID();

// console.log(uniqueID);

//import Panel from './components/Panel';  // Step 1

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      pageErrorState: false,
      pageErrorMessage: "Oops! We can't seem to reach our servers. Please check your connection and try again.",
    };
    this.pageErrorHandler = this.pageErrorHandler.bind(this);
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
      <SafeAreaView style = {{flex: 1, backgroundColor: 'white'}}>
        <View style = {styles.bigContainer}>   
          {this.state.pageErrorState && <ErrorPage
            error={this.state.pageErrorMessage}
          />} 
          {!this.state.pageErrorState && <MasterView
            pageErrorHandler={this.pageErrorHandler}
          />}    
        </View>
      </SafeAreaView>
      
    );
  }
}