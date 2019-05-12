import React from 'react';
import { TouchableOpacity,TouchableHighlight,Vibration,FlatList,Animated,Alert,StyleSheet, Text, View, Dimensions, Button, Image } from 'react-native';
import MapView,{ Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import { createSwitchNavigator, createStackNavigator, NavigationEvents } from 'react-navigation';
import {Constants, Location, Permissions} from 'expo';
import g from 'ngeohash'
import * as math from 'mathjs';
import * as firebase from 'firebase';
import 'firebase/firestore';


// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD2YhfO1TBYNOAWSxGwXQocAikqLuCRl7Q",
  authDomain: "testing-617da.firebaseapp.com",
  databaseURL: "https://testing-617da.firebaseio.com",
  projectId: "testing-617da",
  storageBucket: "testing-617da.appspot.com",
    //messagingSenderId: "862420802331"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// const uniqueId = DeviceInfo.getUniqueID();

// console.log(uniqueID);

//import Panel from './components/Panel';  // Step 1

let id = 0;

function getRandomInt(min,max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max-min))+min;
}

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      pressStatus: false,
      showStatus: false,
      infoPage: false,
      leaderBoard: false,
      leaderBoardButton:true,
      tabVal: false,
      animatedFlex: new Animated.Value(.5),
      animatedHeight: new Animated.Value(30),
      animatedTop: new Animated.Value(1000),
      animatedLeaderboard: new Animated.Value(1000),
      animatedLeaderboardButton: new Animated.Value(-3),
      animatedTab:  new Animated.Value(500),
      locationResult:null,
      testtest:null,
      geoHashGrid: {},
      markers_: {},
      leaderBoard_: [],
      showVotingButtons: true,
      //0.00000898311175 lat to 1 m
      //0.000000024953213 lng to 1 m
      selectedMarker:null,
      selectedGeohash:null,
      markerBorderColor: "transparent",
      infoPageMarker:null,
      infoPageGeohash:null,
      ghostMarker: [],
      mapRegion: {
        latitude: null,
        latitudeDelta: null,
        longitude: null,
        longitudeDelta: null
      },
      currentGrid: [],
      userLocation: {
        formattedAddress: null,
        latitude: null,
        longitude: null
      },
      error: null,
      testMarker: {
        coordinate: {latitude:78, longitude: 78},
        cost: 0,
        title: "kasdd",
      },
      testString: null,
    };


    this.onLongPressMap = this.onLongPressMap.bind(this);
    this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this);
    // this.onUserLocationChange = this.onUserLocationChange.bind(this);
    // this.onPressMap = this.onPressMap.bind(this);
    this.handlePress = this.handlePress.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this._getLocationAsync = this._getLocationAsync.bind(this);
    this.closePopUp = this.closePopUp.bind(this);
    this.addLit = this.addLit.bind(this);
    this.toggleInfoPage = this.toggleInfoPage.bind(this);
    this.toggleLeaderBoard = this.toggleLeaderBoard.bind(this);
    this.addNewLocation = this.addNewLocation.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.toggleTabMapPress = this.toggleTabMapPress.bind(this);
    this.hideTab = this.hideTab.bind(this);
    this.returnUpVotes = this.returnUpVotes.bind(this);
    this.returnDownVotes = this.returnDownVotes.bind(this);
    this.renderImage = this.renderImage.bind(this);
  }

  componentDidMount() {
    // currently this watches the users position. 
    // It updates userLocation when the user moves significantly far away.
    // The intention is to keep userLocation relatively up to date so they always know
    // which markers are accessible. This function should also update the votableMarkers
    // prop which will be a vector of markers that can be voted on from where they are
    // I was thinking we could mark these with a different color highlight or something.
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;

        // Fetch curent location
        myApiKey = 'AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE';
        fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + latitude + ',' + longitude + '&key=' + myApiKey)
        .then((response) => response.json())
        .then((responseJson) => {
          var results = JSON.parse(JSON.stringify(responseJson)).results
          var len = results.length
          var i = 0;
          var minDist = -1;
          var userAddressDictionary = {}
          // this loop checks to see which of the possible results returned from the
          // fetch is closest to the latitude and longitude click that are actually passed
          // in. This used to just take the first result, however, sometimes it is not sorted
          // in a fashion of closest so this was causing problems particularly when adding
          // markers to building with multiple sub buildings attached. For example mason,
          // Angel, or Tisch halls.
          for (indx = 0; indx < len; indx++) {
            if (!isNaN(parseInt(results[indx].formatted_address[0]))) {
              userAddressDictionary[results[indx].formatted_address] = true;
            }
            var dist = math.sqrt(math.square(latitude-results[indx].geometry.location.lat)+math.square(longitude-results[indx].geometry.location.lng));
            if (minDist == -1) {
              minDist = dist;
            }
            else if (dist < minDist) {
              minDist = dist;
              i = indx;
            }
          }
          var finalResult = results[i]
          var userAddress = finalResult.formatted_address;
          len = finalResult.address_components.length;
          var userCity = null;
          var l = null;
          for (j = 0; j < len; j++) {
            l = finalResult.address_components[j].types.length;
            for (k = 0; k < l; k++) {
              if (finalResult.address_components[j].types[k] == "locality") {
                userCity = finalResult.address_components[j].long_name;
              }
            }
          }
          // saves address, latitude, and longitude in a coordinate object
          const newCoordinate = {
            userCity,
            userAddress,
            userAddressDictionary,
            latitude,
            longitude
          };
          console.log("coordinate ", newCoordinate);
          // sets new userLocation based on previously created coordinate object
          this.setState({userLocation: newCoordinate});
        })
      }
    )
}
  componentWillMount() {
    // TODO: The getlocationAsync() and reverselocationAsync() may be unuseful now. Im leaving
    // them in because you wrote them and I want a second opinon
    this._getLocationAsync();
    this._reverseLocationAsync();
    this._getDeviceInfoAsync();
  }


  // You wrote this so im not fully sure
  _getLocationAsync = async() => {
    let{ status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        locationResult:'Permission to access location was deinied',
      });
    }

    let location = await Location.getCurrentPositionAsync({enableHighAccuracy: false});
    console.log("I AM DONE");
    this.setState({locationResult:JSON.stringify(location)});

    var initialPosition = {
      latitude: JSON.parse(this.state.locationResult).coords.latitude,
      longitude: JSON.parse(this.state.locationResult).coords.longitude
    }

    var initialRegion = {
      latitude: JSON.parse(this.state.locationResult).coords.latitude,
      longitude: JSON.parse(this.state.locationResult).coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }

    this.setState({mapRegion: initialRegion})
    var currentGeohash = [g.encode_int(initialRegion.latitude,initialRegion.longitude,26)];
    var currentGrid = g.neighbors_int(currentGeohash[0],26);
    currentGrid = currentGeohash.concat(currentGrid);
    this.setState({currentGrid});

    this.map.animateToRegion(initialRegion, 1);
    this.setState({mapRegion: initialRegion});
    this.setState(previousState => (
      { testMarker: {
        coordinate: initialPosition,
        cost: previousState.testMarker.cost,
      }}
    ));

    

    //ADDED THIS LISTENER FOR REAL TIME UPDATES
    // this listener listens to the database for updates. I am working towards only making
    // it listen to the data that is relevant for the map right now.
    listener = db.collection('locations')
    .where("geohash", "array-contains", await this.state.currentGrid[0])
    .onSnapshot(snapshot => {
      let changes = snapshot.docChanges();
      changes.forEach(change => {
        // if a new document is added to the listener. We have to create a location and
        // add it to the markers dictionary.
        if(change.type == 'added'){
          let newGrid = {...this.state.geoHashGrid};
          if (change.doc.data().geohash[0] in newGrid) {
            let newDictionary = {...newGrid[change.doc.data().geohash[0]]}
            newDictionary[change.doc.id] = {
                coordinate: {
                  latitude: change.doc.data().latitude,
                  longitude: change.doc.data().longitude
                },
                cost: change.doc.data().count,
                address: change.doc.id,
                geohash: change.doc.data().geohash[0],
                upVotes: change.doc.data().upVotes,
                downVotes: change.doc.data().downVotes,
                borderColor: "transparent",
                key: change.doc.id,
            }
            newGrid[change.doc.data().geohash[0]] = newDictionary
            this.setState({geoHashGrid: newGrid})
          } else {
            let newDictionary = {};
            newDictionary[change.doc.id] = {
                coordinate: {
                  latitude: change.doc.data().latitude,
                  longitude: change.doc.data().longitude
                },
                cost: change.doc.data().count,
                address: change.doc.id,
                geohash: change.doc.data().geohash[0],
                upVotes: change.doc.data().upVotes,
                downVotes: change.doc.data().downVotes,
                borderColor: "transparent",
                key: change.doc.id,
            }
            newGrid[change.doc.data().geohash[0]] = newDictionary
            this.setState({geoHashGrid: newGrid})
          }
        } 
        // if a document in the listener has been modified, it will just update the data in the
        // markers_ dictionary.
        else if(change.type == 'modified'){
          let newGrid = {...this.state.geoHashGrid};
          // this if statement may be redundant
          let newDictionary = newGrid[change.doc.data().geohash[0]];
          newDictionary[change.doc.id].cost = change.doc.data().count;
          newDictionary[change.doc.id].upVotes = change.doc.data().upVotes;
          newDictionary[change.doc.id].downVotes = change.doc.data().downVotes;
          newGrid[change.doc.data().geohash[0]] = newDictionary;
          this.setState({geoHashGrid: newGrid});
        }
        // if a document in the listener has been removed it will delete the location from
        // the markers_ dictionary
        else if(change.type == 'removed') {
          let newGrid = {...this.state.geoHashGrid};
          // this if statement may be redundant
          let newDictionary = newGrid[change.data().geoHashGrid[0]];
          delete newDictionary[change.doc.id];
          newGrid[change.doc.data().geohash[0]] = newDictionary;
          this.setState({geoHashGrid: newGrid})
        }
      })
    })

    // myApiKey = 'AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE';
    // fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + this.state.testMarker.coordinate.latitude + ',' + this.state.testMarker.coordinate.longitude + '&key=' + myApiKey)
    //     .then((response) => response.json())
    //     .then((responseJson) => {
    //         this.setState({testString:JSON.parse(JSON.stringify(responseJson)).results[0].formatted_address});
    // })
  };
 // you wrote this
  _reverseLocationAsync = async() => {
    let regionName =  await Location.reverseGeocodeAsync({latitude:42.275863,longitude:-83.72695});
    this.setState({testtest:JSON.stringify(regionName)});
  }

  // this gets the Id for the phone. TODO: update to device ID after ejecting project
  // installationID will likely only work for expo
  _getDeviceInfoAsync = async() => {
    console.log('retrieving info')
    var uniqueId = Constants.installationId;
    console.log(uniqueId);
  }

  // collects info from the map in "info" then reads it into addNewLocation.
  onLongPressMap = info => {
    let data = info.nativeEvent.coordinate
    this.addNewLocation(data.latitude, data.longitude);
  }

  // keeps track of the bounds of the screen. Currently not helpful but could become
  // so if I could find a way to properly limit the scope of the firestore listener.
  // working on accomplishing this with the help of geotagging.
  onRegionChangeComplete = mapRegion => {
    var currentGeohash = [g.encode_int(mapRegion.latitude,mapRegion.longitude,26)];
    var currentGrid = g.neighbors_int(currentGeohash[0],26);
    currentGrid = currentGeohash.concat(currentGrid);
    // console.log(currentGrid)
    // //ADDED THIS LISTENER FOR REAL TIME UPDATES
    // // this listener listens to the database for updates. I am working towards only making
    // // it listen to the data that is relevant for the map right now.
    // listener = db.collection('locations')
    // .where("geohash", "array-contains", currentGeohash[0])
    // .onSnapshot(snapshot => {
    //   let changes = snapshot.docChanges();
    //   changes.forEach(change => {
    //     // if a new document is added to the listener. We have to create a location and
    //     // add it to the markers dictionary.
    //     if(change.type == 'added'){
    //       console.log("added");
    //       let newGrid = {...this.state.geoHashGrid};
    //       if (change.doc.data().geohash[0] in newGrid) {
    //         let newDictionary = {...newGrid[change.doc.data().geohash[0]]}
    //         newDictionary[change.doc.id] = {
    //             coordinate: {
    //               latitude: change.doc.data().latitude,
    //               longitude: change.doc.data().longitude
    //             },
    //             cost: change.doc.data().count,
    //             address: change.doc.id,
    //             geohash: change.doc.data().geohash[0],
    //             upVotes: change.doc.data().upVotes,
    //             downVotes: change.doc.data().downVotes,
    //             borderColor: "transparent",
    //             key: change.doc.id,
    //         }
    //         newGrid[change.doc.data().geohash[0]] = newDictionary
    //         this.setState({geoHashGrid: newGrid})
    //       } else {
    //         let newDictionary = {};
    //         newDictionary[change.doc.id] = {
    //             coordinate: {
    //               latitude: change.doc.data().latitude,
    //               longitude: change.doc.data().longitude
    //             },
    //             cost: change.doc.data().count,
    //             address: change.doc.id,
    //             geohash: change.doc.data().geohash[0],
    //             upVotes: change.doc.data().upVotes,
    //             downVotes: change.doc.data().downVotes,
    //             borderColor: "transparent",
    //             key: change.doc.id,
    //         }
    //         newGrid[change.doc.data().geohash[0]] = newDictionary
    //         this.setState({geoHashGrid: newGrid})
    //       }
    //     } 
    //     // if a document in the listener has been modified, it will just update the data in the
    //     // markers_ dictionary.
    //     else if(change.type == 'modified'){
    //       let newGrid = {...this.state.geoHashGrid};
    //       // this if statement may be redundant
    //       let newDictionary = newGrid[change.doc.data().geohash[0]];
    //       newDictionary[change.doc.id].cost = change.doc.data().count;
    //       newDictionary[change.doc.id].upVotes = change.doc.data().upVotes;
    //       newDictionary[change.doc.id].downVotes = change.doc.data().downVotes;
    //       newGrid[change.doc.data().geohash[0]] = newDictionary;
    //       this.setState({geoHashGrid: newGrid});
    //     }
    //     // if a document in the listener has been removed it will delete the location from
    //     // the markers_ dictionary
    //     else if(change.type == 'removed') {
    //       let newGrid = {...this.state.geoHashGrid};
    //       // this if statement may be redundant
    //       let newDictionary = newGrid[change.data().geoHashGrid[0]];
    //       delete newDictionary[change.doc.id];
    //       newGrid[change.doc.data().geohash[0]] = newDictionary;
    //       this.setState({geoHashGrid: newGrid})
    //     }
    //   })
    // })
    let cleanGrid = null;
    Object.keys(this.state.geoHashGrid).map( geohash => {
      if (!currentGrid.includes(Number(geohash))) {
        if (cleanGrid === null) {
          cleanGrid = {...this.state.geoHashGrid};
        }
        delete cleanGrid[geohash];
      }
    })
    if (cleanGrid !== null) {
      this.setState({geoHashGrid: cleanGrid});
    }
  }

  // Toggles the info page on a hub
  toggleInfoPage (markerAddress) {
    // if infoPage is currently listed as false, open the page. Otherwise close it.
    if (!this.state.infoPage) {
      Animated.timing(this.state.animatedTop, {
        toValue: 50,
        friction: 100,
        duration: 300
      }).start();

      Animated.timing(this.state.animatedLeaderboardButton, {
        toValue: -50,
        friction: 100,
        duration: 300
      }).start();

    } else {
      Animated.timing(this.state.animatedTop, {
        toValue: 1000,
        friction: 100,
        duration: 200
      }).start();


      Animated.timing(this.state.animatedLeaderboardButton, {
        toValue: -3,
        friction: 100,
        duration: 200
      }).start();
    }
    // closes the vote tab when the info page is up so that its not distracting.
    if (this.state.infoPage) {
      this.toggleTab(this.state.infoPageMarker,this.state.selectedGeohash);
      this.setState({infoPageMarker: null});
      this.setState({infoPageGeohash: null});
    }
    // re opens the tab when the info page closes
    else {
      this.setState({infoPageMarker: this.state.selectedMarker});
      this.setState({infoPageGeohash: this.state.selectedGeohash});
      this.hideTab();
    }
    // switches the infoPage state to on or off
    this.setState(previousState => (
      { infoPage: !previousState.infoPage }
    ))
  }

  toggleLeaderBoard() {
    if (!this.state.leaderBoard) {
      var leaderBoard_ = [];
      db.collection('locations').where("city", "==", this.state.userLocation.userCity).orderBy('count', 'desc').limit(25).get()
        .then( snapshot => {
          let counter = 1;
          snapshot.forEach( doc => {
            leaderBoard_.push({
              number: doc.data().number,
              street: doc.data().street,
              count: doc.data().count,
              key: counter.toString()   
            });
            counter = counter + 1;
          })

        this.setState({leaderBoard_});
        }).catch( error =>{
          console.log(error)
        })
        
      console.log(this.state.leaderBoard_);
      Animated.timing(this.state.animatedLeaderboard, {
        toValue: 50,
        friction: 100,
        duration: 300
      }).start();

      Animated.timing(this.state.animatedLeaderboardButton, {
        toValue: -50,
        friction: 100,
        duration: 300
      }).start();

      if (this.state.tabVal) {
        Animated.timing(this.state.animatedTab, {
          toValue: 1000,
          friction: 100,
          duration: 200
        }).start();
      }

    } else {

      Animated.timing(this.state.animatedLeaderboard, {
        toValue: 1000,
        friction: 100,
        duration: 200
      }).start();

      Animated.timing(this.state.animatedLeaderboardButton, {
        toValue: -3,
        friction: 100,
        duration: 200
      }).start();

      if (this.state.tabVal) {
        Animated.timing(this.state.animatedTab, {
          toValue: 370,
          friction: 100,
          duration: 200
        }).start();
      }
    }
    // switches the infoPage state to on or off
    this.setState(previousState => (
      { leaderBoard: !previousState.leaderBoard }
    ))
  }

  toggleTab(markerAddress,geohash) {
    // Checks to see if the marker is in the array of active markers. This is a trigger
    // to see if youre working with a ghost marker. If the marker is a ghost marker
    // and you click it again, it will just hide the tab without adding a new marker 
    // the array.
    // Markers overhaul
    // this.state.geoHashGrid[geohash][markerAddress].borderColor = "#e8b923"
    if(!Object.keys(this.state.geoHashGrid[geohash]).includes(markerAddress)) {
      this.hideTab();
    }
    // checks to see if the marker you clicked on is the one currently stored as
    // selectedMarker. If not, this should change the selected address to the one
    // youre clickig on now.
    else if(this.state.selectedMarker !== markerAddress) {
      // Markers overhaul
      // console.log(this.state.geoHashGrid[geohash][markerAddress].latitude)
      // console.log(this.state.userLocation.userAddressDictionary)
      // if ((this.state.geoHashGrid[geohash][markerAddress].latitude < this.state.userLocation.latitude + 0.05694933525
      //       && this.state.geoHashGrid[geohash][markerAddress].latitude > this.state.userLocation.latitude - 0.05694933525
      //       && this.state.geoHashGrid[geohash][markerAddress].latitude < this.state.userLocation.longitude + 0.0100748596382
      //       && this.state.geoHashGrid[geohash][markerAddress].latitude > this.state.userLocation.longitude - 0.0100748596382)
      //       || (markerAddress == this.state.userLocation.address)) {
      //   console.log(true);
      // } else {
      //   console.log(false);
      // }

      if(markerAddress in this.state.userLocation.userAddressDictionary) {
        console.log("YES")
        this.setState({showVotingButtons: true})
      } else {
        console.log("NO")
        this.setState({showVotingButtons: false})
      }
      // Markers overhaul
      // if (this.state.geoHashGrid[geohash][this.state.selectedMarker]) {
      //   this.state.geoHashGrid[geohash][this.state.selectedMarker].borderColor = "transparent"
      // }

      if (!this.state.tabVal) {
        Animated.timing(this.state.animatedTab, {
          toValue: 370,
          friction: 100,
          duration: 200
        }).start();
        this.setState(previousState => (
          { tabVal: !previousState.tabVal 
          }
        ))
      }
      this.setState({selectedGeohash: geohash});
      this.setState({selectedMarker: markerAddress});

      this.state.geoHashGrid[geohash][markerAddress].borderColor = "#e8b923"

      console.log(this.state.geoHashGrid[geohash][this.state.selectedMarker])
      console.log(markerAddress)
      if (this.state.geoHashGrid[geohash][this.state.selectedMarker]) {
        this.state.geoHashGrid[geohash][this.state.selectedMarker].borderColor = "#e8b923"
      }

      this.setState({onLongPress: false});
    } 
    // if the marker you're clicking on is neither a ghost marker, nor a new marker, it must
    // be the same one so we just close it.
    else{
      // Markers overhaul
      this.state.geoHashGrid[geohash][markerAddress].borderColor = "transparent"
      this.hideTab();
    }
    
    
  }

  // any time the map is pressed and its not on a marker, just hide the tab.
  toggleTabMapPress = pressinfo => {
    if(pressinfo.nativeEvent.action !== "marker-press") {
      this.hideTab();
    }
    
  }

  // hides the vodting tab and switches the state back to false. Also clears out ghostMarker
  // if necessary.
  hideTab() {
    Animated.timing(this.state.animatedTab, {
      toValue: 1000,
      friction: 200,
      duration: 500
    }).start();
    this.setState(previousState => (
      { tabVal: !previousState.tabVal }
    ))
    // Markers overhaul
    if (this.state.geoHashGrid[this.state.selectedGeohash] != undefined) {
      if (this.state.geoHashGrid[this.state.selectedGeohash][this.state.selectedMarker] != undefined) {
        this.state.geoHashGrid[this.state.selectedGeohash][this.state.selectedMarker].borderColor = "transparent"
      }
    }
    
    this.setState({selectedMarker: null});
    var deleteGhost = []
    this.setState({ghostMarker: deleteGhost});
  }

  // TODO, I dont think this does anything, if you agree we should get rid.
  handlePress() {
      if (!this.state.showStatus) {
        Animated.spring(this.state.animatedHeight, {
          toValue: 80,
          friction: 4
        }).start();
      } 

      this.setState(previousState => (
        { showStatus: !previousState.showStatus }
      ))
  }

  closePopUp() {
    if (this.state.showStatus) {
      Animated.timing(this.state.animatedHeight, {
        toValue: 0,
        duration: 100
      }).start();
    }
  }

  //UPDATED THIS TO WORK WITH DATABASE
  // Adds one vote for lit at the current marker.
  addLit(address,geohash) {
    // recieve the ID from the user
    // var uniqueId = Constants.installationId;
    var uniqueId = Math.random().toString();
    // collect timestamp.
    var time = new Date();
    
    // TODO: if the marker is not in the markers_ array, then it means that either the address
    // of the marker is not currently in the database, or somehow, the address is in the
    // database but was not loaded into the local dictionary of markers. This is something
    // that I am only now considering and should fix. Although if it were in the database
    // and you can click on it, it should be in the markers database. This is supposed to
    // be used to turn a ghost marker into a regular marker. 
    if (this.state.geoHashGrid[geohash] == undefined || !Object.keys(this.state.geoHashGrid[geohash]).includes(address)){
      var latitude = this.state.ghostMarker[0].coordinate.latitude;
      var longitude = this.state.ghostMarker[0].coordinate.longitude;
      var city = this.state.ghostMarker[0].city;
      var street = this.state.ghostMarker[0].street;
      var number = this.state.ghostMarker[0].number;
      hashes = [g.encode_int(latitude,longitude,26)];
      hashNeighbors = g.neighbors_int(hashes[0],26);
      // get a reference to the document at this address in the database.
      var ref = db.collection('locations').doc(address);
      ref.get()
        .then( doc => {
          // if the document doesnt yet exist, add a new one with base stats.
          if (!doc.exists) {
            ref.set({
              count: 0,
              upVotes: 0,
              downVotes: 0,
              percentVotesLastThirty: 0,
              percentVotesLastHour: 0,
              timeCreated: time,
              latitude:  latitude,
              longitude: longitude,
              geohash: hashes.concat(hashNeighbors),
              imagePath: './assets/logs.png',
              city: city,
              street: street,
              number: number
            })
            // add a new vote to the votes on this document with the users uniqueID.
            ref.collection('votes').doc(uniqueId).set({
              voteTime: time,
              vote: 1,
            })
          }
        })
        // assuming it was a ghost marker, that marker can now be hidden.
        this.hideTab(); 

    // if the marker is in the markers vector then it is already in the database and
    // we just need to update the votes.
    } else {
      // gets a reference to the document at the address.
      var ref = db.collection('locations').doc(address).collection('votes').doc(uniqueId);
      return ref.get()
      .then( voteDoc => {
        // if there is a document at this address in the votes collection with the users
        // unique ID then they can only update their vote
        if (voteDoc.exists) {
          // if the user had not previously up voted this location then change their vote to
          // an upVote.
          if (voteDoc.data().vote != 1) {
            var newVote = 1;
            ref.set({
              voteTime: time,
              vote: newVote,
            })
          }
        }
        // if there is not yet a vote with uniqueID, then the user has not yet voted on this
        // hub. Therefore, we must add a new upVote with their uniqueID as the key
        else {
          db.collection('locations').doc(address).collection('votes').doc(uniqueId).set({
            voteTime: time,
            vote: 1,
          })
        }
      })
    }
  
  }

  //UPDATED THIS TO WORK WITH DATBASE
  // TODO: This is very similar to add lit however its for deleting a lit from the db. See 
  // above comments, however, this just adds downvotes instead. This could probably
  // be condensed into one function actually 
  deleteLit(address, geohash) {
    // var uniqueId = Constants.installationId;
    var uniqueId = Math.random().toString();
    var time = new Date();
    if (this.state.geoHashGrid[geohash] == undefined || !Object.keys(this.state.geoHashGrid[geohash]).includes(address)) {
      var latitude = this.state.ghostMarker[0].coordinate.latitude;
      var longitude = this.state.ghostMarker[0].coordinate.longitude;
      var city = this.state.ghostMarker[0].city;
      var street = this.state.ghostMarker[0].street;
      var number = this.state.ghostMarker[0].number;
      hashes = [g.encode_int(latitude,longitude,26)];
      hashNeighbors = g.neighbors_int(hashes[0],26);
      var ref = db.collection('locations').doc(address);
      ref.get()
        .then( doc => {
          if (!doc.exists) {
            ref.set({
              count: 0,
              street: street,
              number: number,
              upVotes: 0,
              downVotes: 0,
              percentVotesLastThirty: 0,
              percentVotesLastHour:0,
              timeCreated: time,
              latitude:  latitude,
              longitude: longitude,
              geohash: hashes.concat(hashNeighbors),
              imagePath: './assets/logs.png',
              city: city
            })
            ref.collection('votes').doc(uniqueId).set({
              voteTime: time,
              vote: -1,
            })
          }
        })
      this.hideTab();
    } else {
      var ref = db.collection('locations').doc(address).collection('votes').doc(uniqueId);
      return ref.get()
        .then( voteDoc => {
          if (voteDoc.exists) {
            if (voteDoc.data().vote !== -1) {
              var newVote = -1;
              ref.set({
                voteTime: time,
                vote: newVote
              })
            }
          }
          else {
            db.collection('locations').doc(address).collection('votes').doc(uniqueId).set({
              voteTime: time,
              vote: -1,
            })
          }
        })
      }
  }

  // This funcion adds a new ghost marker which will eventually be used
  // to the database and is triggered in longPressMap.
  addNewLocation = async(latitude_, longitude_) => {
    var ghostGeohash = g.encode_int(latitude_,longitude_,26)
    var address_ = null;
    var results = null;
    var coords = null;
    var city = null;
    var street = null;
    var number = null;
    // fetch the address of the place you are passing in the coordinates of.
    myApiKey = 'AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE';
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + latitude_ + ',' + longitude_ + '&key=' + myApiKey)
        .then((response) => response.json())
        .then((responseJson) => {
          var len = JSON.parse(JSON.stringify(responseJson)).results.length
          var i = 0;
          var minDist = -1;
          // this loop checks to see which of the possible results returned from the
          // fetch is closest to the latitude and longitude click that are actually passed
          // in. This used to just take the first result, however, sometimes it is not sorted
          // in a fashion of closest so this was causing problems particularly when adding
          // markers to building with multiple sub buildings attached. For example mason,
          // Angel, or Tisch halls.
          for (indx = 0; indx < len; indx++) {
            var dist = math.sqrt(math.square(latitude_-JSON.parse(JSON.stringify(responseJson)).results[indx].geometry.location.lat)+math.square(longitude_-JSON.parse(JSON.stringify(responseJson)).results[indx].geometry.location.lng));
            if (minDist == -1) {
              minDist = dist;
            }
            else if (dist < minDist) {
              minDist = dist;
              i = indx;
            }
          }
          // saves the data of the json result that is closest to the latitude and longitude 
          // passed into the funciton.
          results = JSON.parse(JSON.stringify(responseJson)).results[i]
          address_ = results.formatted_address;
          coords = results.geometry.location;
          len = results.address_components.length;
          var l = null;
          for (j = 0; j < len; j++) {
            l = results.address_components[j].types.length;
            for (k = 0; k < l; k++) {
              if (results.address_components[j].types[k] == "locality") {
                city = results.address_components[j].long_name;
              }
              if (results.address_components[j].types[k] == "route") {
                street = results.address_components[j].short_name;
              }
              if (results.address_components[j].types[k] == "street_number") {
                number = results.address_components[j].long_name;
              }
            }
          }
          console.log(city);
          // console.log(JSON.parse(JSON.stringify(responseJson)).results[i]);
          // checks to see if the users last known location is close enough to the hub to vote
          // on it
          if ((coords.lat < this.state.userLocation.latitude + 0.02694933525
            && coords.lat > this.state.userLocation.latitude - 0.02694933525
            && coords.lng < this.state.userLocation.longitude + 0.0000748596382
            && coords.lng > this.state.userLocation.longitude - 0.0000748596382)
            || (address_ == this.state.userLocation.address)) {
            console.log(true);
          } else {
            console.log(false);
          }

          // checks to make sure that the new location is not already part of the markers
          // dictionary. This would mean that the marker is already in the database. May need 
          // to query the actual database though instead... Look into this.
          if (this.state.geoHashGrid[ghostGeohash] == undefined || !Object.keys(this.state.geoHashGrid[ghostGeohash]).includes(address_)) {
            // creates the new ghost marker with the information of this location.
            console.log('here')
            let newGhostMarker = [];
            newGhostMarker.push({
                coordinate: {
                  latitude: coords.lat,
                  longitude: coords.lng
                },
                city: city,
                street: street,
                number: number,
                key: Math.random()                    
              });
              console.log(newGhostMarker[0])
              this.setState({showVotingButtons: true})
            // Opens the voting tab for the user.  
            Animated.timing(this.state.animatedTab, {
              toValue: 370,
              friction: 200,
              duration: 500
            }).start();
            this.setState(previousState => (
              { tabVal: !previousState.tabVal 
              }
            ))
            this.setState({selectedMarker: address_});
            this.setState({selectedGeohash: ghostGeohash});
            this.setState({ghostMarker: newGhostMarker});
          }
        })
    }
  // This is being used to get upVotes for the info page, this is because some of this
  // does not have a default value so it needs a function to call it.
  returnUpVotes(address,geohash) {
    if (this.state.geoHashGrid[geohash] != null) {
      if (this.state.geoHashGrid[geohash][address] != null) {
        return this.state.geoHashGrid[geohash][address].upVotes;
      } else {
        return null;
      }
    } else {
      return null
    }
  }

  // see returnUpVotes but this works for downVotes
  returnDownVotes(address,geohash) {
    if (this.state.geoHashGrid[geohash] != null) {
      if (this.state.geoHashGrid[geohash][address] != null) {
        return this.state.geoHashGrid[geohash][address].downVotes;
      } else {
        return null;
      }
    } else {
      return null
    }
  }

  // see return upVotes but this is for timeCreated
  returnTimeCreated(address, geohash) {
    if (this.state.geoHashGrid[geohash] != null) {
      if (this.state.geoHashGrid[geohash][address] != null) {
        return this.state.geoHashGrid[geohash][address].timeCreated;
      } else {
        return null;
      }
    } else {
      return null
    }
  }

  renderImage(markerCost){
    if (markerCost < 0) {
      return <Image
      style = {{
        height: 40,
        resizeMode: 'contain',
        width: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'black',
        backgroundColor:'white'}}
      source={require('./assets/poop.png')}
    />;
    } else if(markerCost < 10) {
       return <Image
       style = {{
         height: 40,
         resizeMode: 'contain',
         width: 40,
         borderRadius: 20,
         borderWidth: 2,
         borderColor: 'black',
         backgroundColor:'white'}}
       source={require('./assets/logs.png')}
     />;
    } else if (markerCost < 50) {
      return <Image
       style = {{
         height: 40,
         resizeMode: 'contain',
         width: 40,
         borderRadius: 20,
         borderWidth: 2,
         borderColor: 'black',
         backgroundColor:'white'}}
       source={require('./assets/logsfire.png')}
     />;
    } else if (markerCost < 100) {
      return <Image
       style = {{
         height: 40,
         resizeMode: 'contain',
         width: 40,
         borderRadius: 20,
         borderWidth: 2,
         borderColor: 'black',
         backgroundColor:'white'}}
       source={require('./assets/logsfire2.png')}
     />;
    } else {
      return <Image
       style = {{
         height: 40,
         resizeMode: 'contain',
         width: 40,
         borderRadius: 20,
         borderWidth: 2,
         borderColor: 'black',
         backgroundColor:'white'}}
       source={require('./assets/forestfire.png')}
     />;
    } 
 }

  renderLeaderboardCell =  ({item}) => {
    return (
      <View style = {styles.leaderBoardCell}>
      <Text style = {{...styles.leaderboardText,fontWeight:'bold'}}> {item.key} </Text>
      {this.renderImage(item.count)}
      <Text style = {styles.leaderboardText}> {item.number} {item.street}</Text>
      <View style = {styles.LBinnerBox}>
          <Text style = {{color:'white',fontSize:20}}>{item.count}</Text>
      </View>
      </View>
    )
  }

  // renders the onscreen info
  render() {
    return (
      <View style = {styles.bigContainer}>        
        <MapView
          // create the map with the map settings
          ref={ref => { this.map = ref; } }  
          minZoomLevel = {16.5}
          maxZoomLevel = {19}
          showsMyLocationButton = {true}          
          zoomEnabled = {true}
          provider = {PROVIDER_GOOGLE}
          showsUserLocation = {true}
          onLongPress = {this.onLongPressMap}
          onPress = {this.toggleTabMapPress}
          onRegionChangeComplete = {this.onRegionChangeComplete}
          // onUserLocationChange = {this.onUserLocationChange}
          style={styles.container}
          initialRegion = {{
            latitude:37.7884459,
            longitude:-122.4066252,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        > 
          {Object.values(this.state.geoHashGrid).map(markerSet => {
            return(
              Object.values(markerSet).map( (marker) => {
              // creates each marker in the primary markers_ dictionary.
                return (
                  <MapView.Marker 
                  {...marker} 
                  // on press should toggle the voter tab
                  onPress = {() => this.toggleTab(marker.address,marker.geohash)} 
                  >
                    <View style={{...styles.marker,borderColor:marker.borderColor}} >
                      {this.renderImage(marker.cost)}
                      <Text style={styles.testtext}>{marker.cost}</Text>
                    </View>
    
                  </MapView.Marker>
                )
              })
            )
          })}
          {this.state.ghostMarker.map( (marker) => {
            // creates the ghostMarker if needed.
            return (
              <MapView.Marker 
              {...marker} 
              // on press should toggle the voter tab. This should only be relevant if pressing
              // to close the tab
              onPress =  {() => this.toggleTab(marker.address)} 
              >
                <View style={styles.ghostMarker} >
                  <Image
                    style = {{height: 40,
                      resizeMode: 'contain',
                      width: 40,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: 'black',
                      backgroundColor:'white'}}
                    source={require('./assets/poo2.png')}
                  />
                  <Text style={styles.testtext}>?</Text>
                </View>

              </MapView.Marker>
            )
          })}
          </MapView>

          <Animated.View style={{...styles.infoPage,top:this.state.animatedTop}}>
            <Button style={styles.marker} title = 'X' onPress={this.toggleInfoPage} />
            <Text style = {{...styles.locationText}}>
              Analytics
            </Text>
            <Text style = {{...styles.locationText}}>
              {this.state.infoPageMarker}
            </Text>
            <Text style = {{...styles.locationText}}>
              🔥 = {this.returnUpVotes(this.state.infoPageMarker,this.state.infoPageGeohash)}
            </Text>
            <Text style = {{...styles.locationText}}>
              💩 = {this.returnDownVotes(this.state.infoPageMarker,this.state.infoPageGeohash)}
            </Text>
          </Animated.View>

          <Animated.View style={{...styles.infoPage,top:this.state.animatedLeaderboard}}>
            <Button style={styles.marker} title = 'X' onPress={this.toggleLeaderBoard} />
            <Text style = {{...styles.locationText}}>
              Leaderboard
            </Text>
            <FlatList
              data = {this.state.leaderBoard_}
              // renderItem={({item}) => <Text style={styles.item}>{item.number} {item.street} {item.count}</Text>}
              renderItem = {this.renderLeaderboardCell}
              style={styles.flatListContainer}
            />
          </Animated.View>

          <Animated.View style={{...styles.tab,left:this.state.animatedTab}}> 
            {this.state.showVotingButtons && <Button style={styles.tabStyle} title = '🔥' onPress = {()=>this.addLit(this.state.selectedMarker,this.state.selectedGeohash)} />}
            {this.state.showVotingButtons && <Button style={styles.tabStyle} title = '💩' onPress = {()=>this.deleteLit(this.state.selectedMarker,this.state.selectedGeohash)} />}
            <Button style={styles.tabStyle} title = 'ⓘ' onPress={this.toggleInfoPage} />
            {/* <Button style={styles.marker} color="red" title = 'X' onPress={()=>this.hideTab()} /> */}
          </Animated.View>

          <Animated.View style= {{...styles.leaderBoardButton,right:this.state.animatedLeaderboardButton}}>
            {/* <Button style={styles.marker} title = 'L' color="black" onPress={()=>this.toggleLeaderBoard()} /> */}
            <TouchableOpacity onPress={()=>this.toggleLeaderBoard()}>
              <Image
                style = {{flex:1,
                          height: 30,
                          resizeMode: 'contain',
                          width: 30,}}
                source={require('./assets/medal.png')}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
    );
  }
}
//this is just style stuff.
const styles = StyleSheet.create({

  container: {
    justifyContent: 'center',
    flex:1
  },
  infoPage: {
    height: '90%',
    width: '90%',
    position: 'absolute',
    top:50,
    alignSelf:'center',
    borderColor:'black',
    borderWidth: 2,
    borderRadius: 15,
    backgroundColor: 'white',
    flex:1,
    flexDirection:'column',
    justifyContent:'flex-start',
    alignItems:'center'
  },
  animView: {
    backgroundColor:'blue',
    flex:.5,
    borderBottomColor:'black',
    borderBottomWidth: 5,
  },
  bigContainer: {
    flex:1,
    flexDirection: 'column',
    justifyContent:'flex-start',
  },
  locationText: {
    marginTop:10,
    alignSelf: 'center',
    fontSize: 20,
  },
  marker: {
    // padding: 5,
    borderRadius: 30,
    borderWidth: 2,
    // backgroundColor:"red",
    borderColor: "transparent",
    position: 'absolute',
    alignItems:'center',
    justifyContent:'center',
    // flexDirection:"column",
    // justifyContent: "center",
  },
  tabStyle: {
    borderRadius: 5,
    borderWidth: 2,
    // backgroundColor:"red",
    borderColor: "transparent",
    position: 'absolute',
    alignItems:'center',
    justifyContent:'center',
    fontSize: 10,
  },
  ghostMarker: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor:"white",
    position: 'absolute',
    alignItems:'center',
    justifyContent:'center',
  },
  test: {
    flex:1,
    flexDirection:'row',
    justifyContent: 'space-evenly',
    width: 100,
    height: 40,
    alignItems: 'center',
    backgroundColor:"white",
    borderColor:'black',
    borderWidth: 2,
    borderRadius: 10
  },
  text: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 20
  },

  testtext: {
    color: "white",
    fontWeight: "bold",
    fontSize: 10,
    position: 'absolute',
    // top:'40%'
  },

  tab: {
    backgroundColor:"white",
    borderColor:'black',
    borderWidth: 2,
    borderRadius: 10,
    position: 'absolute',
    flex:1,
    left: 370,
    top: '40%',
    flexDirection:'column',
    justifyContent: 'space-evenly',
    alignItems:"center",
  },

  leaderBoardButton: {
    backgroundColor:"white",
    borderColor:'black',
    borderWidth: 2,
    position: 'absolute',
    flex:1,
    right: 0,
    top: '10%',
    // justifyContent: 'space-evenly',
    // alignItems:"center",
    // width: 120,
    // height: 40,
  },

  leaderBoardCell: {
    padding: 15,
    marginTop: 5,
    flex:1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderColor:'black',
    borderWidth: 1,
    borderRadius: 15
  },

  flatListContainer: {
    flex: 1,
    width: '95%',
  },
  LBinnerBox: {
    height: 40,
    width: 40,
    borderWidth: 2,
    borderColor: "#e8b923",
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right:4,
    borderRadius: 30,
    backgroundColor:"#e8b923",
  },
  leaderboardText: {
    fontSize: 20,
  }
});
