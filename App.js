import React from 'react';
import {View} from 'react-native';
import MasterView from './MasterView.js';
import * as firebase from 'firebase';
import 'firebase/firestore';
import styles from './styles.js';
import { GeoCollectionReference, GeoFirestore, GeoQuery, GeoQuerySnapshot } from 'geofirestore';

// Initialize Firebase
global.firebaseConfig = {
  apiKey: "AIzaSyD2YhfO1TBYNOAWSxGwXQocAikqLuCRl7Q",
  authDomain: "testing-617da.firebaseapp.com",
  databaseURL: "https://testing-617da.firebaseio.com",
  projectId: "testing-617da",
  storageBucket: "testing-617da.appspot.com",
    //messagingSenderId: "862420802331"
};

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
    };
  }
  // renders the onscreen info
  render() {
    return (
      <View style = {styles.bigContainer}>    
        <MasterView/>    
      </View>
    );
  }
}