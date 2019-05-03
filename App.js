import React from 'react';
import { TouchableOpacity,TouchableHighlight,Vibration,Animated,Alert, StyleSheet, Text, View, Dimensions, Button, Image } from 'react-native';
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
      tabVal: false,
      animatedFlex: new Animated.Value(.5),
      animatedHeight: new Animated.Value(30),
      animatedTop: new Animated.Value(1000),
      animatedTab:  new Animated.Value(500),
      locationResult:null,
      testtest:null,
      markers_: {},
      votableMarkers: [],
      //0.00000898311175 lat to 1 m
      //0.000000024953213 lng to 1 m
      selectedMarker:null,
      markerBorderColor: "black",
      infoPageMarker:null,
      ghostMarker: [],
      // mapRegion: {
      //   latitude: null,
      //   latitudeDelta: null,
      //   longitude: null,
      //   longitudeDelta: null
      // },
      // currentGeohash: 26591405,
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
    this.addNewLocation = this.addNewLocation.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.toggleTabMapPress = this.toggleTabMapPress.bind(this);
    this.hideTab = this.hideTab.bind(this);
    this.returnUpVotes = this.returnUpVotes.bind(this);
    this.returnDownVotes = this.returnDownVotes.bind(this);
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
          var address = JSON.parse(JSON.stringify(responseJson)).results[0].formatted_address;
          // saves address, latitude, and longitude in a coordinate object
          const newCoordinate = {
            address,
            latitude,
            longitude
          };
          // sets new userLocation based on previously created coordinate object
          this.setState({userLocation: newCoordinate});

          /*if the marker is not within xm of the last known user location or at the 
          the user address at the last known user address, the marker's votable property
          will be set to false*/
          // TODO: must test to see if this actually works when walking around
          this.state.markers_.forEach( marker => {
            if (!(marker.latitude < this.state.userLocation.latitude + 0.02694933525
              && marker.latitude > this.state.userLocation.latitude - 0.02694933525
              && marker.longitude < this.state.userLocation.longitude + 0.0000748596382
              && marker.longitude > this.state.userLocation.longitude - 0.0000748596382)
              || !(marker.address == this.state.userLocation.address)) {
              marker.votable = false;
              console.log(this.state.markers_);
            } 
          })
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
    this.setState({currentGeohash: g.encode_int(initialPosition.latitude, initialPosition.longitude, 26)});

    this.map.animateToRegion(initialRegion, 1);
    this.setState({mapRegion: initialRegion});
    this.setState(previousState => (
      { testMarker: {
        coordinate: initialPosition,
        cost: previousState.testMarker.cost,
      }}
    ));

    myApiKey = 'AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE';
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + this.state.testMarker.coordinate.latitude + ',' + this.state.testMarker.coordinate.longitude + '&key=' + myApiKey)
        .then((response) => response.json())
        .then((responseJson) => {
            this.setState({testString:JSON.parse(JSON.stringify(responseJson)).results[0].formatted_address});
    })
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
    // this.setState({mapRegion}); 
    // console.log(mapRegion);
    // var minlat = mapRegion.latitude-mapRegion.latitudeDelta;
    // var minlon = mapRegion.longitude-mapRegion.longitudeDelta;
    // var maxlat = mapRegion.latitude+mapRegion.latitudeDelta;
    // var maxlon = mapRegion.longitude+mapRegion.longitudeDelta;
    // var geohashes = g.bboxes_int(minlat, minlon, maxlat, maxlon, 26);
    // this.setState({visibleGeohashes: geohashes});
    // console.log(this.state.visibleGeohashes);
    var currentGeohash = g.encode_int(mapRegion.latitude,mapRegion.longitude,26);
    //ADDED THIS LISTENER FOR REAL TIME UPDATES
    // this listener listens to the database for updates. I am working towards only making
    // it listen to the data that is relevant for the map right now.
    listener = db.collection('locations')
    .where("geohash", "array-contains", currentGeohash)
    .onSnapshot(snapshot => {
      let changes = snapshot.docChanges();
      changes.forEach(change => {
        // if a new document is added to the listener. We have to create a location and
        // add it to the markers dictionary.
        if(change.type == 'added'){
          let newDictionary = {...this.state.markers_};
          newDictionary[change.doc.id] = {
              coordinate: {
                latitude: change.doc.data().latitude,
                longitude: change.doc.data().longitude
              },
              cost: change.doc.data().count,
              address: change.doc.id,
              upVotes: change.doc.data().upVotes,
              downVotes: change.doc.data().downVotes,
              borderColor: "black",
              votable: false
          }
          
          //checks to see if the new location is within a votable range of the user, if
          //so, it changes the votable attribute to true
          if ((change.doc.data().latitude < this.state.userLocation.latitude + 0.02694933525
            && change.doc.data().latitude > this.state.userLocation.latitude - 0.02694933525
            && change.doc.data().longitude < this.state.userLocation.longitude + 0.0000748596382
            && change.doc.data().longitude > this.state.userLocation.longitude - 0.0000748596382)
            || (change.doc.id == this.state.userLocation.address)) {
            newDictionary[change.doc.id].votable = true;
          }
          this.setState({markers_: newDictionary});
        } 
        // if a document in the listener has been modified, it will just update the data in the
        // markers_ dictionary.
        else if(change.type == 'modified'){
          let newDictionary = {...this.state.markers_};
          newDictionary[change.doc.id].cost = change.doc.data().count;
          newDictionary[change.doc.id].upVotes = change.doc.data().upVotes;
          newDictionary[change.doc.id].downVotes = change.doc.data().downVotes;
          this.setState({markers_: newDictionary});
        }
        // if a document in the listener has been removed it will delete the location from
        // the markers_ dictionary
        else if(change.type == 'removed') {
          let newDictionary = {...this.state.markers_};
          delete newDictionary[change.doc.id];
          this.setState({markers_: newDictionary});
        }
      })
    })
  }

  // keep for now
  // onUserLocationChange = locationInfo => {
  //   let userLocation = locationInfo.nativeEvent.coordinate;
  //   this.setState({userLocation});
  //   console.log(this.state.userLocation);
  // }

  // Toggles the info page on a hub
  toggleInfoPage (markerAddress) {
    // if infoPage is currently listed as false, open the page. Otherwise close it.
    if (!this.state.infoPage) {
      Animated.timing(this.state.animatedTop, {
        toValue: 50,
        friction: 100,
        duration: 300
      }).start();
    } else {
      Animated.timing(this.state.animatedTop, {
        toValue: 1000,
        friction: 100,
        duration: 200
      }).start();
    }
    // closes the vote tab when the info page is up so that its not distracting.
    if (this.state.infoPage) {
      this.toggleTab(this.state.infoPageMarker);
      this.setState({infoPageMarker: null})
    }
    // re opens the tab when the info page closes
    else {
      this.setState({infoPageMarker: this.state.selectedMarker});
      this.hideTab();
    }
    // switches the infoPage state to on or off
    this.setState(previousState => (
      { infoPage: !previousState.infoPage }
    ))
  }

  toggleTab(markerAddress) {
    // Checks to see if the marker is in the array of active markers. This is a trigger
    // to see if youre working with a ghost marker. If the marker is a ghost marker
    // and you click it again, it will just hide the tab without adding a new marker 
    // the array.

    this.state.markers_[markerAddress].borderColor = "#e8b923"
    if(!Object.keys(this.state.markers_).includes(markerAddress)) {
      this.hideTab();
    }
    // checks to see if the marker you clicked on is the one currently stored as
    // selectedMarker. If not, this should change the selected address to the one
    // youre clickig on now.
    else if(this.state.selectedMarker !== markerAddress) {
      if (this.state.selectedMarker) {
        this.state.markers_[this.state.selectedMarker].borderColor = "black"
      }        
      if (!this.state.tabVal) {
        Animated.timing(this.state.animatedTab, {
          toValue: 370,
          friction: 200,
          duration: 500
        }).start();
        this.setState(previousState => (
          { tabVal: !previousState.tabVal 
          }
        ))
      }

      this.setState({selectedMarker: markerAddress});
      console.log(markerAddress)
    } 
    // if the marker you're clicking on is neither a ghost marker, nor a new marker, it must
    // be the same one so we just close it.
    else{
      this.state.markers_[markerAddress].borderColor = "black"
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
  addLit(address) {
    // recieve the ID from the user
    var uniqueId = Constants.installationId;
    // collect timestamp.
    var time = new Date();
    // if the marker is in the markers vector then it is already in the database and
    // we just need to update the votes.
    if (Object.keys(this.state.markers_).includes(address)) {
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
    // TODO: if the marker is not in the markers_ array, then it means that either the address
    // of the marker is not currently in the database, or somehow, the address is in the
    // database but was not loaded into the local dictionary of markers. This is something
    // that I am only now considering and should fix. Although if it were in the database
    // and you can click on it, it should be in the markers database. This is supposed to
    // be used to turn a ghost marker into a regular marker.
    } else {
      hashes = [g.encode_int(coords.lat,coords.lng,26)];
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
              latitude:  coords.lat,
              longitude: coords.lng,
              geohash: hashes.concat(hashNeighbors),
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
    }
  
  }

  //UPDATED THIS TO WORK WITH DATBASE
  // TODO: This is very similar to add lit however its for deleting a lit from the db. See 
  // above comments, however, this just adds downvotes instead. This could probably
  // be condensed into one function actually 
  deleteLit(address) {
    var uniqueId = Constants.installationId;
    var time = new Date();
    if (Object.keys(this.state.markers_).includes(address)) {
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
    }else {
      hashes = [g.encode_int(coords.lat,coords.lng,26)];
      hashNeighbors = g.neighbors_int(hashes[0],26);
      var ref = db.collection('locations').doc(address);
      ref.get()
        .then( doc => {
          if (!doc.exists) {
            ref.set({
              count: 0,
              upVotes: 0,
              downVotes: 0,
              percentVotesLastThirty: 0,
              percentVotesLastHour:0,
              timeCreated: time,
              latitude:  coords.lat,
              longitude: coords.lng,
              geohash: hashes.concat(hashNeighbors)
            })
            ref.collection('votes').doc(uniqueId).set({
              voteTime: time,
              vote: -1,
            })
          }
        })
      this.hideTab(false);
    }
  }

  // This funcion adds a new ghost marker which will eventually be used
  // to the database and is triggered in longPressMap.
  addNewLocation = async(latitude_, longitude_) => {
    var address_ = null;
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
          address_ = JSON.parse(JSON.stringify(responseJson)).results[i].formatted_address;
          coords = JSON.parse(JSON.stringify(responseJson)).results[i].geometry.location;
          // checks to make sure that the new location is not already part of the markers
          // dictionary. This would mean that the marker is already in the database. May need 
          // to query the actual database though instead... Look into this.
          if (!Object.keys(this.state.markers_).includes(address_)) {
            // creates the new ghost marker with the information of this location.
            let newGhostMarker = [];
            newGhostMarker.push({
                coordinate: {
                  latitude: coords.lat,
                  longitude: coords.lng
                }                    
              });
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
            this.setState({ghostMarker: newGhostMarker});
          }
        })
    }
  // This is being used to get upVotes for the info page, this is because some of this
  // does not have a default value so it needs a function to call it.
  returnUpVotes(address) {
    if (this.state.markers_[address] != null) {
      return this.state.markers_[address].upVotes;
    }
    else {
      return null;
    }
  }

  // see returnUpVotes but this works for downVotes
  returnDownVotes(address) {
    if (this.state.markers_[address] != null) {
      return this.state.markers_[address].downVotes;
    }
    else {
      return null;
    }
  }

  // see return upVotes but this is for timeCreated
  returnTimeCreated(addres) {
    if (this.state.markers_[address] != null) {
      return this.state.markers_[address].timeCreated;
    }
    else {
      return null;
    }
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
          {Object.values(this.state.markers_).map( (marker) => {
            // creates each marker in the primary markers_ dictionary.
            return (
              <MapView.Marker 
              {...marker} 
              // on press should toggle the voter tab
              onPress =  {() => this.toggleTab(marker.address)} 
              >
                <View style={{...styles.marker,borderColor:marker.borderColor}} >
                    <Text style={styles.text}>{marker.cost}</Text>
                </View>

              </MapView.Marker>
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
                    <Text style={styles.text}>{0}</Text>
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
              🔥 = {this.returnUpVotes(this.state.infoPageMarker)}
            </Text>
            <Text style = {{...styles.locationText}}>
              💩 = {this.returnDownVotes(this.state.infoPageMarker)}
            </Text>
          </Animated.View>

          <Animated.View style={{...styles.tab,left:this.state.animatedTab}}> 
            <Button style={styles.marker} title = '💩' onPress = {()=>this.deleteLit(this.state.selectedMarker)} />
            <Button style={styles.marker} title = '🔥' onPress = {()=>this.addLit(this.state.selectedMarker)} />
            <Button style={styles.marker} title = 'ⓘ' onPress={this.toggleInfoPage} />
            <Button style={styles.marker} color="red" title = 'X' onPress={()=>this.toggleTab(this.state.selectedMarker)} />
          </Animated.View>
        </View>
    );
  }
  // //ADDED THIS LISTENER FOR REAL TIME UPDATES
  // // this listener listens to the database for updates. I am working towards only making
  // // it listen to the data that is relevant for the map right now.
  // listener = db.collection('locations')
  //   .onSnapshot(snapshot => {
  //   let changes = snapshot.docChanges();
  //   changes.forEach(change => {
  //     // if a new document is added to the listener. We have to create a location and
  //     // add it to the markers dictionary.
  //     if(change.type == 'added'){
  //       let newDictionary = {...this.state.markers_};
  //       newDictionary[change.doc.id] = {
  //           coordinate: {
  //             latitude: change.doc.data().latitude,
  //             longitude: change.doc.data().longitude
  //           },
  //           cost: change.doc.data().count,
  //           address: change.doc.id,
  //           upVotes: change.doc.data().upVotes,
  //           downVotes: change.doc.data().downVotes,
  //           borderColor: "black"
  //       }
  //       let votableMarkers_ = [...this.state.votableMarkers];
  //       // TODO: this checks to see if the new location should be added to the votable dictionary
  //       // has not been fully implemented because for development purposes, i want to
  //       // vote on all markers.
  //       if ((change.doc.data().latitude < this.state.userLocation.latitude + 0.0002694933525
  //         && change.doc.data().latitude > this.state.userLocation.latitude - 0.0002694933525
  //         && change.doc.data().longitude < this.state.userLocation.longitude + 0.000000748596382
  //         && change.doc.data().longitude > this.state.userLocation.longitude - 0.000000748596382)  || (change.doc.id == this.state.userLocation.address)) {
  //           if (votableMarkers_.includes(change.doc.id)) {
  //             votableMarkers_.push[change.doc.id];
  //           }
  //         }
  //       this.setState({votableMarkers: votableMarkers_});
  //       this.setState({markers_: newDictionary});
  //     } 
  //     // if a document in the listener has been modified, it will just update the data in the
  //     // markers_ dictionary.
  //     else if(change.type == 'modified'){
  //       let newDictionary = {...this.state.markers_};
  //       newDictionary[change.doc.id].cost = change.doc.data().count;
  //       newDictionary[change.doc.id].upVotes = change.doc.data().upVotes;
  //       newDictionary[change.doc.id].downVotes = change.doc.data().downVotes;
  //       this.setState({markers_: newDictionary});
  //     }
  //     // if a document in the listener has been removed it will delete the location from
  //     // the markers_ dictionary
  //     else if(change.type == 'removed') {
  //       let newDictionary = {...this.state.markers_};
  //       delete newDictionary[change.doc.id];
  //       this.setState({markers_: newDictionary});
  //     }
  //   })
  // })
}
//this is just style stuff.
const styles = StyleSheet.create({

  container: {
    justifyContent: 'center',
    flex:1
  },
  findMeButton: {
    alignSelf: 'flex-start',
    position: 'absolute',
    top:0,
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
  touch: {
    backgroundColor: 'yellow',
    flex: 1,
    width: 100,
    height: 900
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
    padding: 5,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "black",
    backgroundColor:"red",
    flexDirection:"column",
    justifyContent: "center"
  },
  ghostMarker: {
    padding: 5,
    borderRadius: 5,
    backgroundColor:"grey",
    flexDirection:"column",
    justifyContent: "center"


  },
  marker2: {
    backgroundColor: "green",
    borderRadius: 5,
    height:30,
    width: 60,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
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
  markerContainer: {
    flex:1,
    flexDirection:'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor:"red"
  },
  text: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 20
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
    width: 40,
    height: 120,
  },

  closeTab: {
    color:"red"
  },

  leaderBoardButton: {
    backgroundColor:"white",
    borderColor:'black',
    borderWidth: 2,
    borderRadius: 10,
    position: 'absolute',
    flex:1,
    left: 1,
    top: '40%',
    flexDirection:'column',
    // justifyContent: 'space-evenly',
    // alignItems:"center",
    width: 40,
    height: 40,
  }
});
